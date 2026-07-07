import uuid
from datetime import datetime

from pydantic import BaseModel


class NotebookCreate(BaseModel):
    name: str


class NotebookResponse(BaseModel):
    id: uuid.UUID
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TopicResponse(BaseModel):
    id: uuid.UUID
    notebook_id: uuid.UUID
    title: str
    content: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class QuestionCreate(BaseModel):
    question_text: str
    answer_text: str | None = None


class QuestionResponse(BaseModel):
    id: uuid.UUID
    topic_id: uuid.UUID
    question_text: str
    answer_text: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class GenerateTopicsRequest(BaseModel):
    prompt: str
