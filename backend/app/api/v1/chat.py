from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.message import Message
from app.models.notebook import Topic
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat import AI_Service
from app.services.storage import save_markdown

router = APIRouter()
ai_service = AI_Service()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        reply = await ai_service.chat_with_topic(body.topic_id, body.message, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    should_regenerate = await ai_service.should_regenerate_content(body.topic_id, db)

    if should_regenerate:
        result = await db.execute(select(Topic).where(Topic.id == body.topic_id))
        topic = result.scalar_one_or_none()
        if topic:
            messages_result = await db.execute(
                select(Message)
                .where(Message.topic_id == body.topic_id)
                .order_by(Message.created_at)
            )
            messages = messages_result.scalars().all()
            chat_history = [{"role": msg.role, "content": msg.content} for msg in messages]
            new_content = await ai_service.regenerate_content_from_chat(
                topic.title, chat_history
            )
            await save_markdown(body.topic_id, new_content)

    return ChatResponse(
        topic_id=body.topic_id,
        reply=reply,
        should_regenerate=should_regenerate,
    )
