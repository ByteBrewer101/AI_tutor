import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Notebook, Question, Topic
from app.schemas import (
    GenerateTopicsRequest,
    NotebookCreate,
    NotebookResponse,
    QuestionCreate,
    QuestionResponse,
    TopicResponse,
)
from app.services import TutorService

router = APIRouter()
tutor_service = TutorService()


@router.post("/notebooks", response_model=NotebookResponse, status_code=201)
async def create_notebook(body: NotebookCreate, db: AsyncSession = Depends(get_db)):
    notebook = Notebook(name=body.name)
    db.add(notebook)
    await db.commit()
    await db.refresh(notebook)
    return notebook


@router.get("/notebooks", response_model=list[NotebookResponse])
async def list_notebooks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notebook).order_by(Notebook.created_at.desc()))
    return result.scalars().all()


@router.post("/notebooks/{notebook_id}/topics/generate", response_model=list[TopicResponse], status_code=201)
async def generate_topics(
    notebook_id: uuid.UUID,
    body: GenerateTopicsRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        topics = await tutor_service.generate_topics(body.prompt, notebook_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return topics


@router.get("/notebooks/{notebook_id}/topics", response_model=list[TopicResponse])
async def list_topics(
    notebook_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Topic).where(Topic.notebook_id == notebook_id).order_by(Topic.created_at)
    )
    return result.scalars().all()


@router.post("/topics/{topic_id}/questions", response_model=QuestionResponse, status_code=201)
async def create_question(
    topic_id: uuid.UUID,
    body: QuestionCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    question = Question(topic_id=topic_id, **body.model_dump())
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question


@router.get("/topics/{topic_id}/questions", response_model=list[QuestionResponse])
async def list_questions(
    topic_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Question).where(Question.topic_id == topic_id).order_by(Question.created_at)
    )
    return result.scalars().all()
