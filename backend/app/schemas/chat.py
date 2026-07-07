import uuid

from pydantic import BaseModel


class ChatRequest(BaseModel):
    notebook_id: uuid.UUID
    message: str


class ChatResponse(BaseModel):
    reply: str
