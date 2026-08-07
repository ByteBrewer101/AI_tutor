import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.chat import ModelConfig


class NotebookCreate(BaseModel):
    name: str
    description: str | None = None


class NotebookPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    is_public: bool | None = None


class VisibilityUpdate(BaseModel):
    is_public: bool


class NotebookResponse(BaseModel):
    id: uuid.UUID
    owner_id: uuid.UUID | None = Field(validation_alias="user_id")
    name: str
    description: str | None
    is_public: bool
    created_at: datetime
    accessed_at: datetime
    access_count: int

    model_config = {"from_attributes": True}


class FeedNotebookResponse(BaseModel):
    id: uuid.UUID
    owner_id: uuid.UUID | None
    owner_name: str | None
    name: str
    description: str | None
    created_at: datetime
    topic_count: int = 0


class FeedPageResponse(BaseModel):
    items: list[FeedNotebookResponse]
    has_more: bool


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
    """Schema the LLM must fill in when generating a single quiz question."""
    type: str = "mcq"
    question: str
    options: list[str] | None = None
    answer: str
    difficulty: str | None = Field(
        default=None,
        description="Difficulty label of the question: easy, medium, hard, or expert.",
    )


class NextQuestionRequest(BaseModel):
    """Context for generating the next single quiz question."""
    difficulty: int = Field(
        default=1,
        ge=1,
        description="Monotonic difficulty level of the upcoming question; higher means harder.",
    )
    asked_questions: list[str] = Field(
        default_factory=list,
        description="Question texts already asked, so the next one is not repeated.",
    )
    correct_count: int = Field(default=0, ge=0)
    wrong_count: int = Field(default=0, ge=0)
    llm_config: ModelConfig | None = None


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
    llm_config: ModelConfig | None = None
