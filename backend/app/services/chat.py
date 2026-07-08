import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.notebook import Notebook, Topic
from app.schemas.notebook import TopicAIResponse
from langchain_ollama import ChatOllama


class AI_Service:
    def __init__(self) -> None:
        self.llm = ChatOllama(
            model=settings.OLLAMA_MODEL,
            base_url=settings.OLLAMA_BASE_URL,
            temperature=0.7,
        )
        # Bind the schema so the model returns TopicAIResponse-shaped output
        self.structured_llm = self.llm.with_structured_output(TopicAIResponse)

    async def generate_topics(
            
        self, prompt: str, notebook_id: uuid.UUID, db: AsyncSession
    ) -> list[Topic]:
        result = await db.execute(select(Notebook).where(Notebook.id == notebook_id))
        notebook = result.scalar_one_or_none()
        if notebook is None:
            raise ValueError(f"Notebook {notebook_id} not found")

        system_prompt = (
           "You are an expert curriculum designer. Given a learning topic, generate a "
"complete list of subtopics that together cover the entire scope of the "
"subject — from foundational concepts to advanced applications — with no "
"significant gaps or redundant overlap between entries.\n\n"
"Guidelines:\n"
"- Break the topic into mutually exclusive, collectively exhaustive (MECE) "
"subtopics.\n"
"- Order subtopics logically, progressing from fundamentals to advanced "
"material (or in a natural learning sequence).\n"
"- Include prerequisite or foundational concepts even if not explicitly "
"mentioned in the topic.\n"
"- Keep titles concise (3-6 words), using clear, standard terminology.\n"
"- Avoid overly narrow or overly broad subtopics — each should represent a "
"distinct, teachable unit.\n"
"- Do not omit any major branch, subfield, or commonly taught component of "
"the topic."
        )

        ai_response: TopicAIResponse = await self.structured_llm.ainvoke(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ]
        )

        topics = []
        for title in ai_response.topics:
            title = title.strip()
            if title:
                topic = Topic(notebook_id=notebook_id, title=title)
                db.add(topic)
                topics.append(topic)

        await db.commit()
        for topic in topics:
            await db.refresh(topic)
        return topics