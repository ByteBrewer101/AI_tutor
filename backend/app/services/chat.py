import json
import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.message import Message
from app.models.notebook import Notebook, Topic
from app.schemas.notebook import TopicAIResponse, QuizQuestion
from app.services.storage import save_markdown, read_markdown
from langchain_ollama import ChatOllama


class AI_Service:
    def __init__(self) -> None:
        self.llm = ChatOllama(
            model=settings.OLLAMA_MODEL,
            base_url=settings.OLLAMA_BASE_URL,
            temperature=0.7,
        )
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

        for topic in topics:
            content = await self.generate_topic_content(
                topic.title, notebook.name
            )
            file_name = await save_markdown(topic.id, content)
            topic.content_file_path = file_name

        await db.commit()
        for topic in topics:
            await db.refresh(topic)

        return topics

    async def generate_topic_content(
        self, topic_title: str, notebook_name: str
    ) -> str:
        system_prompt = (
            "You are an expert educator creating comprehensive learning material. "
            "Given a topic, generate a detailed lesson in proper Markdown format.\n\n"
            "The content should include:\n"
            "1. A clear introduction explaining what the topic is about\n"
            "2. Key concepts with explanations\n"
            "3. Important definitions and formulas if applicable\n"
            "4. Practical examples or use cases\n"
            "5. Key takeaways or summary\n\n"
            "Format the content using proper Markdown:\n"
            "- Use # for main title, ## for sections, ### for subsections\n"
            "- Use **bold** for key terms\n"
            "- Use `code` for code snippets or technical terms\n"
            "- Use bullet points and numbered lists where appropriate\n"
            "- Use > blockquotes for important notes\n"
            "- Keep the content educational, clear, and well-structured\n"
            "- Aim for 500-800 words of content"
        )

        response = await self.llm.ainvoke(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Topic: {topic_title}\nPart of: {notebook_name}"},
            ]
        )

        return response.content

    async def regenerate_content_from_chat(
        self, topic_title: str, chat_history: list[dict]
    ) -> str:
        formatted_history = "\n".join(
            f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
            for msg in chat_history
        )

        system_prompt = (
            "You are an expert educator. Based on the conversation history about a topic, "
            "create a comprehensive, updated lesson in proper Markdown format.\n\n"
            "The updated content should:\n"
            "1. Incorporate insights and questions from the conversation\n"
            "2. Clarify any confusing points that were discussed\n"
            "3. Expand on areas that were explored in detail\n"
            "4. Maintain a clear, educational structure\n"
            "5. Be a complete standalone reference for the topic\n\n"
            "Format the content using proper Markdown:\n"
            "- Use # for main title, ## for sections, ### for subsections\n"
            "- Use **bold** for key terms\n"
            "- Use `code` for code snippets or technical terms\n"
            "- Use bullet points and numbered lists where appropriate\n"
            "- Use > blockquotes for important notes\n"
            "- Keep the content educational, clear, and well-structured\n"
            "- Aim for 600-1000 words of content"
        )

        response = await self.llm.ainvoke(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Topic: {topic_title}\n\nConversation History:\n{formatted_history}"},
            ]
        )

        return response.content

    async def generate_quiz(
        self, topic_title: str, markdown_content: str, num_questions: int = 5
    ) -> list[QuizQuestion]:
        system_prompt = (
            "You are an expert quiz creator. Based on the provided learning material, "
            "generate a quiz to test understanding of the topic.\n\n"
            "For each question:\n"
            "- Create a mix of multiple-choice (MCQ) and open-ended questions\n"
            "- For MCQ, provide 4 options with one correct answer\n"
            "- For open-ended, provide a suggested answer\n"
            "- Questions should test comprehension, not just memorization\n"
            "- Vary difficulty levels\n\n"
            "Return exactly the number of questions requested."
        )

        response = await self.llm.ainvoke(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": (
                    f"Topic: {topic_title}\n"
                    f"Number of questions: {num_questions}\n\n"
                    f"Learning Material:\n{markdown_content}"
                )},
            ]
        )

        try:
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            questions_data = json.loads(content.strip())
            return [QuizQuestion(**q) for q in questions_data.get("questions", [])]
        except (json.JSONDecodeError, KeyError, TypeError):
            return []

    async def chat_with_topic(
        self,
        topic_id: uuid.UUID,
        user_message: str,
        db: AsyncSession,
    ) -> str:
        result = await db.execute(select(Topic).where(Topic.id == topic_id))
        topic = result.scalar_one_or_none()
        if topic is None:
            raise ValueError(f"Topic {topic_id} not found")

        existing_messages = await db.execute(
            select(Message)
            .where(Message.topic_id == topic_id)
            .order_by(Message.created_at)
        )
        messages = existing_messages.scalars().all()

        content = await read_markdown(topic_id)
        content_context = f"\n\nTopic Content:\n{content}" if content else ""

        system_prompt = (
            f"You are a helpful tutor specializing in the topic: {topic.title}. "
            "Answer questions, explain concepts, and help the user learn. "
            "Be educational, clear, and encouraging. "
            "Use markdown formatting when it helps clarity."
            f"{content_context}"
        )

        chat_history = []
        for msg in messages:
            chat_history.append({"role": msg.role, "content": msg.content})
        chat_history.append({"role": "user", "content": user_message})

        response = await self.llm.ainvoke(
            [{"role": "system", "content": system_prompt}] + chat_history
        )

        ai_reply = response.content

        db.add(Message(topic_id=topic_id, role="user", content=user_message))
        db.add(Message(topic_id=topic_id, role="assistant", content=ai_reply))
        await db.commit()

        return ai_reply

    async def should_regenerate_content(
        self, topic_id: uuid.UUID, db: AsyncSession
    ) -> bool:
        count_result = await db.execute(
            select(func.count()).select_from(Message).where(Message.topic_id == topic_id)
        )
        message_count = count_result.scalar()
        return message_count > 0 and message_count % settings.CHAT_SUMMARY_THRESHOLD == 0
