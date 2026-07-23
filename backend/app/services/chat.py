import json
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.notebook import Notebook, Topic
from app.schemas.notebook import TopicAIResponse, QuizQuestion
from app.schemas.chat import ChatMessage, ChatReply
from app.services.storage import save_markdown, read_markdown
from langchain_ollama import ChatOllama
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter


class AI_Service:
    def __init__(self) -> None:
        self.llm = ChatOllama(
            model=settings.OLLAMA_MODEL,
            base_url=settings.OLLAMA_BASE_URL,
            temperature=0.7,
        )
        self.structured_llm = self.llm.with_structured_output(TopicAIResponse)
        self.chat_structured_llm = self.llm.with_structured_output(ChatReply)

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
            file_name = await save_markdown(topic.id, "")
            topic.content_file_path = file_name

        await db.commit()
        for topic in topics:
            await db.refresh(topic)

        return topics

    async def chat_with_topic(
        self,
        topic_title: str,
        topic_id: uuid.UUID,
        user_message: str,
        chat_history: list[ChatMessage],
    ) -> ChatReply:
        content = await read_markdown(topic_id)
        content_context = (
            f"\n\nEXISTING STUDY NOTES for this topic:\n---\n{content}\n---"
            if content and content.strip()
            else ""
        )

        is_first_message = len(chat_history) == 0

        if is_first_message:
            system_prompt = (
                f"You are a friendly study companion helping the user learn about: {topic_title}."
                f"{content_context}\n\n"
                "This is the user's first message in this session. "
                "Welcome them warmly, reference the topic specifically, and "
                "offer 3 good starter questions as suggestions.\n\n"
                "RULES:\n"
                "- Keep your greeting to 1-2 sentences max\n"
                "- Be warm but not over-the-top\n"
                "- Reference something specific about the topic if notes exist\n"
                "- response_type should be 'conversational'\n"
                "- key_takeaways should be an empty array\n"
                "- suggestions should be exactly 3 diverse starter questions"
            )
        else:
            system_prompt = (
                f"You are a friendly study companion helping the user learn about: {topic_title}."
                f"{content_context}\n\n"
                "PERSONALITY:\n"
                "- Be conversational and warm, like a knowledgeable study buddy\n"
                "- Keep responses SHORT (2-4 sentences) unless the user explicitly asks for detail\n"
                "- Use plain text for casual replies; use markdown only for structured explanations\n"
                "- Reference specific concepts from the topic material when relevant\n"
                "- Be encouraging but honest — don't sugarcoat misunderstandings\n\n"
                "RESPONSE GUIDELINES:\n"
                "- response_type: 'conversational' (default), 'explanation' (when user asks to "
                "explain something in depth — use markdown), 'takeaway' (when summarizing a "
                "concept), or 'exercise' (when presenting a challenge or quiz)\n"
                "- suggestions: 2-3 follow-up questions the user might naturally want to ask. "
                "Mix question types: 'tell me more about X', 'how does X relate to Y?', "
                "'can you give an example of Z?'. Base these on what was just discussed AND "
                "what hasn't been covered yet from the topic material.\n"
                "- key_takeaways: 1-3 bullet points for the most important insight. Empty array "
                "for casual back-and-forth.\n\n"
                "RULES:\n"
                "- When the user says something vague, ask a clarifying question\n"
                "- When the user seems confused, offer to explain differently or give an example\n"
                "- When the user demonstrates understanding, acknowledge it and suggest going deeper\n"
                "- Never repeat information already covered in the conversation\n"
                "- If notes exist, reference them naturally ('Based on what we've noted about X...')"
            )

        messages = [{"role": "system", "content": system_prompt}]
        for msg in chat_history:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": user_message})

        result: ChatReply = await self.chat_structured_llm.ainvoke(messages)
        return result

    async def summarize_chat_to_content(
        self,
        topic_title: str,
        topic_id: uuid.UUID,
        chat_history: list[ChatMessage],
    ) -> str:
        existing_content = await read_markdown(topic_id) or ""

        documents = []
        if existing_content.strip():
            documents.append(
                Document(
                    page_content=existing_content,
                    metadata={"source": "existing_notes"},
                )
            )

        formatted_chat = "\n\n".join(
            f"{'**User:**' if msg.role == 'user' else '**Tutor:**'} {msg.content}"
            for msg in chat_history
        )
        if formatted_chat.strip():
            documents.append(
                Document(
                    page_content=formatted_chat,
                    metadata={"source": "chat_conversation"},
                )
            )

        if not documents:
            return ""

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=4000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ". ", " "],
        )
        split_docs = splitter.split_documents(documents)

        map_prompt = ChatPromptTemplate.from_template(
            "Summarize the following content into clear, well-structured Markdown notes "
            "for the topic: {topic_title}.\n\n"
            "Format guidelines:\n"
            "- Use ## for section headers\n"
            "- Use **bold** for key terms\n"
            "- Use bullet points for lists\n"
            "- Use > blockquotes for important notes\n"
            "- Keep content educational and reference-ready\n\n"
            "Content to summarize:\n{context}\n\n"
            "Summary in Markdown:"
        )

        reduce_prompt = ChatPromptTemplate.from_template(
            "Combine the following summaries into a single, comprehensive Markdown "
            "reference document for the topic: {topic_title}.\n\n"
            "The final document should:\n"
            "1. Start with a # heading for the topic title\n"
            "2. Organize content into clear ## sections\n"
            "3. Incorporate insights from the chat conversation\n"
            "4. Be a complete standalone study guide\n"
            "5. Use proper Markdown formatting throughout\n\n"
            "Do NOT include chat transcripts. Only include educational content.\n\n"
            "Combined summaries:\n{context}\n\n"
            "Final Markdown document:"
        )

        map_chain = map_prompt | self.llm
        reduce_chain = reduce_prompt | self.llm

        async def _mapReduce(docs: list[Document]) -> str:
            mapped = []
            for doc in docs:
                result = await map_chain.ainvoke(
                    {"context": doc.page_content, "topic_title": topic_title}
                )
                mapped.append(result.content)

            combined = "\n\n---\n\n".join(mapped)
            result = await reduce_chain.ainvoke(
                {"context": combined, "topic_title": topic_title}
            )
            return result.content

        summary = await _mapReduce(split_docs)

        await save_markdown(topic_id, summary)
        return summary

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
