import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class NotebookCreate(BaseModel):
    name: str
    description: str | None = None


class NotebookResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    created_at: datetime
    accessed_at: datetime
    access_count: int

    model_config = {"from_attributes": True}


class TopicResponse(BaseModel):
    id: uuid.UUID
    notebook_id: uuid.UUID
    title: str
    content: str | None
    content_file_path: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TopicContentResponse(BaseModel):
    id: uuid.UUID
    title: str
    content: str


class QuizQuestion(BaseModel):
    type: str = "mcq"
    question: str
    options: list[str] | None = None
    answer: str


class QuizRequest(BaseModel):
    num_questions: int = 5


class QuizResponse(BaseModel):
    topic_id: uuid.UUID
    topic_title: str
    questions: list[QuizQuestion]


class RegenerateContentResponse(BaseModel):
    topic_id: uuid.UUID
    message: str
    content: str


class TopicAIResponse(BaseModel):
    """Schema the LLM must fill in when generating subtopics."""
    topics: list[str] = Field(
        ..., description="A list of concise subtopic titles for the given learning topic."
    )


class QuestionCreate(BaseModel):
    type: str = "open"
    question: str
    answer: str | None = None
    options: list[str] | None = None


class QuestionResponse(BaseModel):
    id: uuid.UUID
    topic_id: uuid.UUID
    type: str
    question: str
    answer: str | None
    options: list[str] | None
    created_at: datetime

    model_config = {"from_attributes": True}


class MarginNoteCreate(BaseModel):
    text: str


class MarginNoteResponse(BaseModel):
    id: uuid.UUID
    topic_id: uuid.UUID
    text: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ProgressResponse(BaseModel):
    id: uuid.UUID
    topic_id: uuid.UUID
    read: bool
    quizzed: bool
    score: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProgressUpdate(BaseModel):
    read: bool | None = None
    quizzed: bool | None = None
    score: int | None = None


class GenerateTopicsRequest(BaseModel):
    prompt: str
