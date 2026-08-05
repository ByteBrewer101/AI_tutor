import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.notebook import Topic
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ModelConfig,
    SummarizeRequest,
    SummarizeResponse,
)
from app.services.chat import AI_Service

router = APIRouter()
ai_service = AI_Service()


@router.post("/models/test")
async def test_model_connection(body: ModelConfig):
    try:
        await ai_service.test_connection(body)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {e}")
    return {"ok": True, "provider": body.provider, "model": body.model or "default"}


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Topic).where(Topic.id == body.topic_id))
    topic = result.scalar_one_or_none()
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")

    try:
        result = await ai_service.chat_with_topic(
            topic_title=topic.title,
            topic_id=body.topic_id,
            user_message=body.message,
            chat_history=body.chat_history,
            llm_config=body.llm_config,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return ChatResponse(
        topic_id=body.topic_id,
        reply=result.reply,
        response_type=result.response_type,
        suggestions=[{"text": s.text} for s in result.suggestions],
        key_takeaways=result.key_takeaways,
    )


@router.post("/chat/stream")
async def chat_stream(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Topic).where(Topic.id == body.topic_id))
    topic = result.scalar_one_or_none()
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")

    async def event_stream():
        async for event in ai_service.chat_with_topic_stream(
            topic_title=topic.title,
            topic_id=body.topic_id,
            user_message=body.message,
            chat_history=body.chat_history,
            llm_config=body.llm_config,
        ):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/topics/{topic_id}/summarize", response_model=SummarizeResponse)
async def summarize_chat(
    topic_id: uuid.UUID,
    body: SummarizeRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")

    if not body.chat_history:
        raise HTTPException(status_code=400, detail="Chat history is empty")

    try:
        content = await ai_service.summarize_chat_to_content(
            topic_title=topic.title,
            topic_id=topic_id,
            chat_history=body.chat_history,
            llm_config=body.llm_config,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return SummarizeResponse(topic_id=topic_id, content=content)
