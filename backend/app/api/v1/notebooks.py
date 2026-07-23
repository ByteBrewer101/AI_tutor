import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.message import Message
from app.models.notebook import MarginNote, Notebook, Progress, Question, Topic
from app.schemas.notebook import (
    GenerateTopicsRequest,
    MarginNoteCreate,
    MarginNoteResponse,
    NotebookCreate,
    NotebookResponse,
    ProgressResponse,
    ProgressUpdate,
    QuestionCreate,
    QuestionResponse,
    QuizRequest,
    QuizResponse,
    RegenerateContentResponse,
    TopicContentResponse,
    TopicResponse,
)
from app.services.chat import AI_Service
from app.services.storage import read_markdown, save_markdown, delete_markdown

router = APIRouter()
ai_service = AI_Service()


@router.post("/notebooks", response_model=NotebookResponse, status_code=201)
async def create_notebook(body: NotebookCreate, db: AsyncSession = Depends(get_db)):
    notebook = Notebook(name=body.name, description=body.description)
    db.add(notebook)
    await db.commit()
    await db.refresh(notebook)
    return notebook


@router.get("/notebooks", response_model=list[NotebookResponse])
async def list_notebooks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notebook).order_by(Notebook.created_at.desc()))
    return result.scalars().all()


@router.get("/notebooks/{notebook_id}", response_model=NotebookResponse)
async def get_notebook(notebook_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notebook).where(Notebook.id == notebook_id))
    notebook = result.scalar_one_or_none()
    if notebook is None:
        raise HTTPException(status_code=404, detail="Notebook not found")
    notebook.accessed_at = datetime.now(timezone.utc)
    notebook.access_count += 1
    await db.commit()
    await db.refresh(notebook)
    return notebook


@router.delete("/notebooks/{notebook_id}", status_code=204)
async def delete_notebook(notebook_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notebook).where(Notebook.id == notebook_id))
    notebook = result.scalar_one_or_none()
    if notebook is None:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
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
    db: AsyncSession = Depends(get_db),
):
    try:
        topics = await ai_service.generate_topics(body.prompt, notebook_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return topics


@router.get("/notebooks/{notebook_id}/topics", response_model=list[TopicResponse])
async def list_topics(notebook_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Topic).where(Topic.notebook_id == notebook_id).order_by(Topic.created_at)
    )
    return result.scalars().all()


# --- Questions ---


@router.post(
    "/topics/{topic_id}/questions", response_model=QuestionResponse, status_code=201
)
async def create_question(
    topic_id: uuid.UUID,
    body: QuestionCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    question = Question(
        topic_id=topic_id,
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
async def list_questions(topic_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Question).where(Question.topic_id == topic_id).order_by(Question.created_at)
    )
    return result.scalars().all()


# --- Margin Notes ---


@router.post(
    "/topics/{topic_id}/notes", response_model=MarginNoteResponse, status_code=201
)
async def create_margin_note(
    topic_id: uuid.UUID,
    body: MarginNoteCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    note = MarginNote(topic_id=topic_id, text=body.text)
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


@router.get("/topics/{topic_id}/notes", response_model=list[MarginNoteResponse])
async def list_margin_notes(topic_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MarginNote)
        .where(MarginNote.topic_id == topic_id)
        .order_by(MarginNote.created_at)
    )
    return result.scalars().all()


@router.delete("/notes/{note_id}", status_code=204)
async def delete_margin_note(note_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MarginNote).where(MarginNote.id == note_id))
    note = result.scalar_one_or_none()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    await db.delete(note)
    await db.commit()


# --- Progress ---


@router.get("/topics/{topic_id}/progress", response_model=ProgressResponse)
async def get_progress(topic_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Progress).where(Progress.topic_id == topic_id))
    progress = result.scalar_one_or_none()
    if progress is None:
        progress = Progress(topic_id=topic_id)
        db.add(progress)
        await db.commit()
        await db.refresh(progress)
    return progress


@router.patch("/topics/{topic_id}/progress", response_model=ProgressResponse)
async def update_progress(
    topic_id: uuid.UUID,
    body: ProgressUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Progress).where(Progress.topic_id == topic_id))
    progress = result.scalar_one_or_none()
    if progress is None:
        progress = Progress(topic_id=topic_id)
        db.add(progress)
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(progress, field, value)
    await db.commit()
    await db.refresh(progress)
    return progress


# --- Topic Content ---


@router.get("/topics/{topic_id}/content", response_model=TopicContentResponse)
async def get_topic_content(topic_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    content = await read_markdown(topic_id)
    if content is None:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return TopicContentResponse(id=topic.id, title=topic.title, content=content)


@router.put("/topics/{topic_id}/content", response_model=TopicContentResponse)
async def update_topic_content(
    topic_id: uuid.UUID,
    body: TopicContentResponse,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    file_name = await save_markdown(topic_id, body.content)
    topic.content_file_path = file_name
    await db.commit()
    await db.refresh(topic)
    
    return TopicContentResponse(id=topic.id, title=topic.title, content=body.content)


@router.post("/topics/{topic_id}/regenerate", response_model=RegenerateContentResponse)
async def regenerate_topic_content(
    topic_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    messages_result = await db.execute(
        select(Message)
        .where(Message.topic_id == topic_id)
        .order_by(Message.created_at)
    )
    messages = messages_result.scalars().all()
    
    if not messages:
        raise HTTPException(status_code=400, detail="No chat history to regenerate from")
    
    chat_history = [{"role": msg.role, "content": msg.content} for msg in messages]
    
    new_content = await ai_service.regenerate_content_from_chat(
        topic.title, chat_history
    )
    
    file_name = await save_markdown(topic_id, new_content)
    topic.content_file_path = file_name
    await db.commit()
    await db.refresh(topic)
    
    return RegenerateContentResponse(
        topic_id=topic_id,
        message="Content regenerated successfully from chat history",
        content=new_content,
    )


# --- Quiz ---


@router.post("/topics/{topic_id}/quiz", response_model=QuizResponse)
async def generate_quiz(
    topic_id: uuid.UUID,
    body: QuizRequest = QuizRequest(),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    content = await read_markdown(topic_id)
    if content is None:
        raise HTTPException(status_code=404, detail="Topic content not found")
    
    questions = await ai_service.generate_quiz(
        topic.title, content, body.num_questions
    )
    
    return QuizResponse(
        topic_id=topic_id,
        topic_title=topic.title,
        questions=questions,
    )
