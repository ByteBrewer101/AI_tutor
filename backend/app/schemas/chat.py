import uuid

from pydantic import BaseModel


class ChatRequest(BaseModel):
    topic_id: uuid.UUID
    message: str


class ChatResponse(BaseModel):
    topic_id: uuid.UUID
    reply: str
    should_regenerate: bool = False
