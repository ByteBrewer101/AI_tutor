import uuid

from pydantic import BaseModel, Field


class ModelConfig(BaseModel):
    provider: str = Field(
        default="ollama",
        description="Provider to use: 'ollama' (local) or 'gemini' (Google Gemini).",
    )
    model: str | None = Field(
        default=None,
        description="Model name. Falls back to server default when unset.",
    )
    api_key: str | None = Field(
        default=None,
        description="API key for cloud providers. Never persisted server-side.",
    )
    base_url: str | None = Field(
        default=None,
        description="Base URL for self-hosted providers like Ollama.",
    )


class ChatMessage(BaseModel):
    role: str
    content: str
    suggestion_hints: list[str] = Field(
        default_factory=list,
        description="Hint values from suggestions offered in this assistant turn.",
    )


class ChatRequest(BaseModel):
    topic_id: uuid.UUID
    message: str
    chat_history: list[ChatMessage] = []
    llm_config: ModelConfig | None = None


class SuggestionItem(BaseModel):
    text: str = Field(description="Natural follow-up question the student might ask next.")


class ChatReply(BaseModel):
    reply: str = Field(description="Response text. Use markdown formatting.")
    response_type: str = Field(
        default="conversational",
        description="conversational, explanation, takeaway, or exercise.",
    )
    suggestions: list[SuggestionItem] = Field(
        default_factory=list,
        description="2-4 natural follow-up questions.",
    )
    key_takeaways: list[str] = Field(
        default_factory=list,
        description="1-3 key points. Empty for casual replies.",
    )


class SuggestionItemResponse(BaseModel):
    text: str


class ChatResponse(BaseModel):
    topic_id: uuid.UUID
    reply: str
    response_type: str = "conversational"
    suggestions: list[SuggestionItemResponse] = []
    key_takeaways: list[str] = []


class SummarizeRequest(BaseModel):
    topic_id: uuid.UUID
    chat_history: list[ChatMessage]
    llm_config: ModelConfig | None = None


class SummarizeResponse(BaseModel):
    topic_id: uuid.UUID
    content: str
