import uuid

from langchain_ollama import ChatOllama
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import Notebook, Topic


class TutorService:
    def __init__(self) -> None:
        self.llm = ChatOllama(
            model=settings.OLLAMA_MODEL,
            base_url=settings.OLLAMA_BASE_URL,
            temperature=0.7,
        )

    async def generate_topics(
        self, prompt: str, notebook_id: uuid.UUID, db: AsyncSession
    ) -> list[Topic]:
        result = await db.execute(select(Notebook).where(Notebook.id == notebook_id))
        notebook = result.scalar_one_or_none()
        if notebook is None:
            raise ValueError(f"Notebook {notebook_id} not found")

        system_prompt = (
            "You are a curriculum designer. Given a learning topic, "
            "generate a list of subtopics. Return each subtopic as a bullet point "
            "with a title. Keep titles concise."
        )
        response = await self.llm.ainvoke(
            [{"role": "system", "content": system_prompt}, {"role": "user", "content": prompt}]
        )
        lines = response.content.strip().split("\n")
        topics = []
        for line in lines:
            title = line.lstrip("- *").strip()
            if title:
                topic = Topic(notebook_id=notebook_id, title=title)
                db.add(topic)
                topics.append(topic)
        await db.commit()
        for topic in topics:
            await db.refresh(topic)
        return topics
