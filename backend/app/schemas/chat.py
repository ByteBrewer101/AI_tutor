import uuid

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    topic_id: uuid.UUID
    message: str
    chat_history: list[ChatMessage] = []


class ChatReply(BaseModel):
    """Structured output the LLM returns for chat responses."""
    reply: str = Field(
        description="Conversational response. Use plain text for short casual replies. "
        "Use markdown for detailed explanations when the user asks to explain something in depth."
    )
    response_type: str = Field(
        default="conversational",
        description="Type of response: 'conversational' for short replies, "
        "'explanation' for detailed concept explanations, "
        "'takeaway' for summary with key learning points, "
        "'exercise' for interactive questions or challenges.",
    )
    suggestions: list[str] = Field(
        default_factory=list,
        description="2-3 follow-up questions the user might naturally want to ask next. "
        "Base these on what was just discussed and what hasn't been covered yet.",
    )
    key_takeaways: list[str] = Field(
        default_factory=list,
        description="1-3 bullet points summarizing the most important insight. "
        "Empty array for casual replies.",
    )


class ChatResponse(BaseModel):
    topic_id: uuid.UUID
    reply: str
    response_type: str = "conversational"
    suggestions: list[str] = []
    key_takeaways: list[str] = []


class SummarizeRequest(BaseModel):
    topic_id: uuid.UUID
    chat_history: list[ChatMessage]


class SummarizeResponse(BaseModel):
    topic_id: uuid.UUID
    content: str
