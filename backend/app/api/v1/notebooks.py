import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.notebook import Notebook, Progress, Question, Topic
from app.models.user import User
from app.schemas.notebook import (
    FeedNotebookResponse,
    FeedPageResponse,
    GenerateTopicsRequest,
    NotebookCreate,
    NotebookPatch,
    NotebookResponse,
    ProgressResponse,
    ProgressUpdate,
    QuestionCreate,
    QuestionResponse,
    QuizRequest,
    QuizResponse,
    TopicContentResponse,
    TopicResponse,
)
from app.services.chat import AI_Service
from app.services.storage import read_markdown, save_markdown, delete_markdown

router = APIRouter()
ai_service = AI_Service()


async def get_notebook_or_404(notebook_id: uuid.UUID, db: AsyncSession) -> Notebook:
    result = await db.execute(select(Notebook).where(Notebook.id == notebook_id))
    notebook = result.scalar_one_or_none()
    if notebook is None:
        raise HTTPException(status_code=404, detail="Notebook not found")
    return notebook


def can_read(notebook: Notebook, user: User) -> bool:
    return notebook.is_public or notebook.user_id is None or notebook.user_id == user.id


def ensure_owner(notebook: Notebook, user: User) -> None:
    if notebook.user_id != user.id:
        raise HTTPException(status_code=404, detail="Notebook not found")


async def get_readable_notebook_or_404(
    notebook_id: uuid.UUID, db: AsyncSession, user: User
) -> Notebook:
    notebook = await get_notebook_or_404(notebook_id, db)
    if not can_read(notebook, user):
        raise HTTPException(status_code=404, detail="Notebook not found")
    return notebook


async def get_owned_notebook_or_404(
    notebook_id: uuid.UUID, db: AsyncSession, user: User
) -> Notebook:
    notebook = await get_notebook_or_404(notebook_id, db)
    ensure_owner(notebook, user)
    return notebook


@router.post("/notebooks", response_model=NotebookResponse, status_code=201)
async def create_notebook(
    body: NotebookCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    notebook = Notebook(
        user_id=user.id,
        name=body.name,
        description=body.description,
        is_public=False,
    )
    db.add(notebook)
    await db.commit()
    await db.refresh(notebook)
    return notebook


@router.get("/notebooks", response_model=list[NotebookResponse])
async def list_notebooks(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notebook)
        .where(Notebook.user_id == user.id)
        .order_by(Notebook.created_at.desc())
    )
    return result.scalars().all()


@router.get("/feed/notebooks", response_model=FeedPageResponse)
async def list_feed(
    offset: int = Query(0, ge=0),
    limit: int = Query(6, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    topic_count = (
        select(func.count(Topic.id))
        .where(Topic.notebook_id == Notebook.id)
        .correlate(Notebook)
        .scalar_subquery()
    )
    result = await db.execute(
        select(Notebook, User.display_name, topic_count.label("topic_count"))
        .outerjoin(User, Notebook.user_id == User.id)
        .where(Notebook.is_public.is_(True))
        .order_by(Notebook.created_at.desc())
        .offset(offset)
        .limit(limit + 1)
    )
    rows = result.all()
    has_more = len(rows) > limit
    rows = rows[:limit]
    return FeedPageResponse(
        items=[
            FeedNotebookResponse(
                id=notebook.id,
                owner_id=notebook.user_id,
                owner_name=owner_name,
                name=notebook.name,
                description=notebook.description,
                created_at=notebook.created_at,
                topic_count=topic_count,
            )
            for notebook, owner_name, topic_count in rows
        ],
        has_more=has_more,
    )


@router.get("/notebooks/{notebook_id}", response_model=NotebookResponse)
async def get_notebook(
    notebook_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    notebook = await get_readable_notebook_or_404(notebook_id, db, user)
    notebook.accessed_at = datetime.now(timezone.utc)
    notebook.access_count += 1
    await db.commit()
    await db.refresh(notebook)
    return notebook


@router.patch("/notebooks/{notebook_id}", response_model=NotebookResponse)
async def patch_notebook(
    notebook_id: uuid.UUID,
    body: NotebookPatch,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    notebook = await get_owned_notebook_or_404(notebook_id, db, user)
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(notebook, field, value)
    await db.commit()
    await db.refresh(notebook)
    return notebook


@router.delete("/notebooks/{notebook_id}", status_code=204)
async def delete_notebook(
    notebook_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    notebook = await get_owned_notebook_or_404(notebook_id, db, user)

    topics_result = await db.execute(
        select(Topic).where(Topic.notebook_id == notebook_id)
    )
    topics = topics_result.scalars().all()
    for topic in topics:
        await delete_markdown(topic.id)

    await db.delete(notebook)
    await db.commit()


# --- Topics ---


@router.post(
    "/notebooks/{notebook_id}/topics/generate",
    response_model=list[TopicResponse],
    status_code=201,
)
async def generate_topics(
    notebook_id: uuid.UUID,
    body: GenerateTopicsRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    notebook = await get_owned_notebook_or_404(notebook_id, db, user)
    try:
        topics = await ai_service.generate_topics(
            body.prompt, notebook.id, db, llm_config=body.llm_config
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return topics


@router.get("/notebooks/{notebook_id}/topics", response_model=list[TopicResponse])
async def list_topics(
    notebook_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await get_readable_notebook_or_404(notebook_id, db, user)
    result = await db.execute(
        select(Topic).where(Topic.notebook_id == notebook_id).order_by(Topic.created_at)
    )
    return result.scalars().all()


async def get_owned_topic_or_404(topic_id: uuid.UUID, db: AsyncSession, user: User) -> Topic:
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    await get_owned_notebook_or_404(topic.notebook_id, db, user)
    return topic


async def get_readable_topic_or_404(topic_id: uuid.UUID, db: AsyncSession, user: User) -> Topic:
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    await get_readable_notebook_or_404(topic.notebook_id, db, user)
    return topic


# --- Questions ---


@router.post(
    "/topics/{topic_id}/questions", response_model=QuestionResponse, status_code=201
)
async def create_question(
    topic_id: uuid.UUID,
    body: QuestionCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    topic = await get_owned_topic_or_404(topic_id, db, user)
    question = Question(
        topic_id=topic.id,
        type=body.type,
        question=body.question,
        answer=body.answer,
        options=body.options,
    )
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question


@router.get("/topics/{topic_id}/questions", response_model=list[QuestionResponse])
async def list_questions(
    topic_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    topic = await get_owned_topic_or_404(topic_id, db, user)
    result = await db.execute(
        select(Question).where(Question.topic_id == topic.id).order_by(Question.created_at)
    )
    return result.scalars().all()


# --- Progress ---


@router.get("/topics/{topic_id}/progress", response_model=ProgressResponse)
async def get_progress(
    topic_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    topic = await get_owned_topic_or_404(topic_id, db, user)
    result = await db.execute(
        select(Progress).where(
            Progress.topic_id == topic.id, Progress.user_id == user.id
        )
    )
    progress = result.scalar_one_or_none()
    if progress is None:
        progress = Progress(topic_id=topic.id, user_id=user.id)
        db.add(progress)
        await db.commit()
        await db.refresh(progress)
    return progress


@router.patch("/topics/{topic_id}/progress", response_model=ProgressResponse)
async def update_progress(
    topic_id: uuid.UUID,
    body: ProgressUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    topic = await get_owned_topic_or_404(topic_id, db, user)
    result = await db.execute(
        select(Progress).where(
            Progress.topic_id == topic.id, Progress.user_id == user.id
        )
    )
    progress = result.scalar_one_or_none()
    if progress is None:
        progress = Progress(topic_id=topic.id, user_id=user.id)
        db.add(progress)
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(progress, field, value)
    await db.commit()
    await db.refresh(progress)
    return progress


# --- Topic Content ---


@router.get("/topics/{topic_id}/content", response_model=TopicContentResponse)
async def get_topic_content(
    topic_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    topic = await get_readable_topic_or_404(topic_id, db, user)
    content = await read_markdown(topic.id)
    if content is None:
        raise HTTPException(status_code=404, detail="Content not found")
    return TopicContentResponse(id=topic.id, title=topic.title, content=content)


@router.put("/topics/{topic_id}/content", response_model=TopicContentResponse)
async def update_topic_content(
    topic_id: uuid.UUID,
    body: TopicContentResponse,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    topic = await get_owned_topic_or_404(topic_id, db, user)
    file_name = await save_markdown(topic.id, body.content)
    topic.content_file_path = file_name
    await db.commit()
    await db.refresh(topic)
    return TopicContentResponse(id=topic.id, title=topic.title, content=body.content)


# --- Quiz ---


@router.post("/topics/{topic_id}/quiz", response_model=QuizResponse)
async def generate_quiz(
    topic_id: uuid.UUID,
    body: QuizRequest = QuizRequest(),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    topic = await get_readable_topic_or_404(topic_id, db, user)
    content = await read_markdown(topic.id)
    if not content or not content.strip():
        return QuizResponse(
            topic_id=topic.id,
            topic_title=topic.title,
            questions=[],
        )

    questions = await ai_service.generate_quiz(
        topic.title,
        content,
        body.num_questions,
        llm_config=body.llm_config,
    )

    return QuizResponse(
        topic_id=topic.id,
        topic_title=topic.title,
        questions=questions,
    )
