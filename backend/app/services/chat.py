import asyncio
import uuid
from collections.abc import AsyncIterator

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.notebook import Notebook, Topic
from app.schemas.notebook import TopicAIResponse, QuizQuestion
from app.schemas.chat import ChatMessage, ChatReply, ModelConfig, SuggestionItem
from app.services.storage import save_markdown, read_markdown
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_ollama import ChatOllama
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter


def _difficulty_label(difficulty: int) -> str:
    if difficulty <= 2:
        return "easy"
    if difficulty <= 4:
        return "medium"
    if difficulty <= 7:
        return "hard"
    return "expert"


class AI_Service:
    @staticmethod
    def _build_llm(llm_config: ModelConfig | None = None) -> BaseChatModel:
        if settings.AI_PROVIDER == "ollama":
            return ChatOllama(
                model=settings.OLLAMA_MODEL,
                base_url=settings.OLLAMA_BASE_URL,
                temperature=0.7,
            )

        cfg = llm_config or ModelConfig()

        if cfg.provider == "gemini":
            from langchain_google_genai import ChatGoogleGenerativeAI

            if not cfg.api_key:
                raise ValueError("Google Gemini requires an API key")
            return ChatGoogleGenerativeAI(
                model=cfg.model or "gemini-2.5-flash",
                api_key=cfg.api_key,
                temperature=0.7,
            )

        return ChatOllama(
            model=cfg.model or settings.OLLAMA_MODEL,
            base_url=cfg.base_url or settings.OLLAMA_BASE_URL,
            temperature=0.7,
        )

    async def generate_topics(
        self,
        prompt: str,
        notebook_id: uuid.UUID,
        db: AsyncSession,
        llm_config: ModelConfig | None = None,
    ) -> list[Topic]:
        result = await db.execute(select(Notebook).where(Notebook.id == notebook_id))
        notebook = result.scalar_one_or_none()
        if notebook is None:
            raise ValueError(f"Notebook {notebook_id} not found")

        system_prompt = (
            "You are an expert curriculum designer. Given a learning topic, generate "
            "subtopics that cover the full scope — from fundamentals to advanced — "
            "with no gaps or overlap.\n"
            "- MECE (mutually exclusive, collectively exhaustive)\n"
            "- Logical progression from basics to advanced\n"
            "- Include prerequisites even if not explicitly mentioned\n"
            "- Concise titles (3-6 words), standard terminology\n"
            "- Each subtopic = one distinct, teachable unit"
        )

        llm = self._build_llm(llm_config)
        structured_llm = llm.with_structured_output(TopicAIResponse)

        ai_response: TopicAIResponse = await structured_llm.ainvoke(
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
        llm_config: ModelConfig | None = None,
    ) -> ChatReply:
        content = await read_markdown(topic_id)
        content_context = (
            f"\n\nEXISTING STUDY NOTES:\n---\n{content}\n---"
            if content and content.strip()
            else ""
        )

        is_first_message = len(chat_history) == 0

        if is_first_message:
            system_prompt = (
                f"You are a knowledgeable tutor helping a student learn about: {topic_title}.{content_context}\n\n"
                "Welcome the student warmly. Briefly introduce what this topic covers. "
                "Use markdown formatting for clarity (headers, bold, bullet points as appropriate). "
                "End with 2-4 natural follow-up questions the student might want to explore next."
            )
        else:
            system_prompt = (
                f"You are a knowledgeable tutor guiding a student through: {topic_title}.{content_context}\n\n"
                "- Respond thoroughly and in depth. Use markdown formatting naturally.\n"
                "- Generate 2-4 natural follow-up questions the student might want to ask next.\n"
                "- Questions should cover different aspects: deeper exploration, real-world examples, clarifications, connections.\n"
                "- Never repeat topics already covered in the conversation.\n"
                "- If study notes exist, reference them naturally."
            )

        messages = [{"role": "system", "content": system_prompt}]
        for msg in chat_history:
            messages.append({"role": msg.role, "content": msg.content})
            if msg.role == "assistant" and msg.suggestion_hints:
                messages.append({
                    "role": "system",
                    "content": f"[Follow-up questions already offered: {', '.join(msg.suggestion_hints)}. Offer different questions.]",
                })
        messages.append({"role": "user", "content": user_message})

        llm = self._build_llm(llm_config)
        chat_structured_llm = llm.with_structured_output(ChatReply)
        result: ChatReply = await chat_structured_llm.ainvoke(messages)

        if not result.suggestions:
            result.suggestions = [
                SuggestionItem(text="Can you explain this in more detail?"),
                SuggestionItem(text="How is this used in practice?"),
                SuggestionItem(text="Can you clarify that?"),
            ]

        return result

    async def chat_with_topic_stream(
        self,
        topic_title: str,
        topic_id: uuid.UUID,
        user_message: str,
        chat_history: list[ChatMessage],
        llm_config: ModelConfig | None = None,
    ) -> AsyncIterator[dict]:
        content = await read_markdown(topic_id)
        content_context = (
            f"\n\nEXISTING STUDY NOTES:\n---\n{content}\n---"
            if content and content.strip()
            else ""
        )

        system_prompt = (
            f"You are a knowledgeable tutor guiding a student through: {topic_title}.{content_context}\n\n"
            "- Respond thoroughly and in depth. Use markdown formatting naturally "
            "(headers, bold, bullet points, code blocks, tables as appropriate).\n"
            "- This is a chat turn: reply only to the student's latest message.\n"
            "- Do NOT include follow-up questions at the end of your reply.\n"
            "- Do NOT prefix your reply with role labels like 'Tutor:'."
        )

        messages = [{"role": "system", "content": system_prompt}]
        for msg in chat_history:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": user_message})

        llm = self._build_llm(llm_config)

        reply_parts: list[str] = []
        try:
            async for chunk in llm.astream(messages):
                delta = self._content_text(chunk)
                if not delta:
                    continue
                reply_parts.append(delta)
                yield {"type": "chunk", "content": delta}
                await asyncio.sleep(0.015)

            reply = "".join(reply_parts)

            if not reply.strip():
                raise ValueError("Model returned an empty response")

            suggestions, key_takeaways, response_type = await self._extract_metadata(
                llm=llm,
                topic_title=topic_title,
                user_message=user_message,
                reply=reply,
            )

            yield {
                "type": "done",
                "reply": reply,
                "response_type": response_type,
                "suggestions": [{"text": s.text} for s in suggestions],
                "key_takeaways": key_takeaways,
            }
        except Exception as e:
            yield {"type": "error", "detail": str(e)}

    @staticmethod
    def _content_text(chunk) -> str:
        content = chunk.content
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            parts = []
            for block in content:
                if isinstance(block, str):
                    parts.append(block)
                elif isinstance(block, dict):
                    if block.get("type") == "text" and block.get("text"):
                        parts.append(block["text"])
            return "".join(parts)
        return str(content or "")

    @staticmethod
    async def _extract_metadata(
        llm: BaseChatModel,
        topic_title: str,
        user_message: str,
        reply: str,
    ) -> tuple[list[SuggestionItem], list[str], str]:
        system_prompt = (
            "You are an AI tutor's structured post-processing step.\n"
            "Given a student's question and the tutor's reply, produce:\n"
            "- response_type: one of 'conversational', 'explanation', 'takeaway', or 'exercise'.\n"
            "- suggestions: 2-4 natural follow-up questions the student might ask next, "
            "covering deeper exploration, real-world examples, clarifications, and connections. "
            "Do not repeat what was already explained.\n"
            "- key_takeaways: 1-3 concise key points, or an empty list for casual replies."
        )

        structured_llm = llm.with_structured_output(ChatReply)
        result: ChatReply = await structured_llm.ainvoke(
            [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": (
                        f"Topic: {topic_title}\n\n"
                        f"Student's question: {user_message}\n\n"
                        f"Tutor's reply:\n{reply}"
                    ),
                },
            ]
        )

        if not result.suggestions:
            result.suggestions = [
                SuggestionItem(text="Can you explain this in more detail?"),
                SuggestionItem(text="How is this used in practice?"),
                SuggestionItem(text="Can you clarify that?"),
            ]

        return result.suggestions, result.key_takeaways, result.response_type

    async def summarize_chat_to_content(
        self,
        topic_title: str,
        topic_id: uuid.UUID,
        chat_history: list[ChatMessage],
        llm_config: ModelConfig | None = None,
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
            "Format: ## headers, **bold** key terms, bullet lists, > blockquotes for important notes.\n\n"
            "Content:\n{context}\n\nSummary:"
        )

        reduce_prompt = ChatPromptTemplate.from_template(
            "Combine these summaries into a single comprehensive Markdown study guide "
            "for: {topic_title}.\n\n"
            "Requirements:\n"
            "- # heading for topic title\n"
            "- Clear ## sections\n"
            "- Incorporate chat insights\n"
            "- Standalone study guide\n"
            "- Proper Markdown formatting\n"
            "- No chat transcripts\n\n"
            "Summaries:\n{context}\n\nFinal document:"
        )

        llm = self._build_llm(llm_config)
        map_chain = map_prompt | llm
        reduce_chain = reduce_prompt | llm

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

    async def generate_next_question(
        self,
        topic_title: str,
        markdown_content: str,
        difficulty: int = 1,
        asked_questions: list[str] | None = None,
        correct_count: int = 0,
        wrong_count: int = 0,
        llm_config: ModelConfig | None = None,
    ) -> QuizQuestion:
        difficulty_label = _difficulty_label(difficulty)
        asked = asked_questions or []
        avoid_prompt = ""
        if asked:
            avoid_prompt = (
                "- Do NOT repeat any of these already-asked questions:\n"
                + "\n".join(f"  - {q}" for q in asked[-10:])
            )

        system_prompt = (
            "You are an expert quiz creator. Generate exactly ONE multiple-choice question "
            "from the provided material.\n"
            "- The question must have exactly 4 options and exactly one correct answer\n"
            "- The answer must be the exact option text of the correct choice\n"
            "- Test comprehension, not memorization\n"
            "- Do not ask questions that depend on other questions\n"
            f"- This is question #{difficulty} in an ongoing session. Difficulty must strictly "
            f"increase with each question. Current difficulty: {difficulty_label}.\n"
            "  easy = basic recall; medium = understanding/application; "
            "hard = analysis; expert = synthesis and edge cases.\n"
            f"{avoid_prompt}\n"
            f"- Session so far: {correct_count} correct, {wrong_count} wrong.\n"
            'Set the "difficulty" field to the difficulty label of this question.'
        )

        llm = self._build_llm(llm_config)
        quiz_structured_llm = llm.with_structured_output(QuizQuestion)

        result: QuizQuestion = await quiz_structured_llm.ainvoke(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Topic: {topic_title}\n\nMaterial:\n{markdown_content}"},
            ]
        )

        if not result.options or len(result.options) < 2:
            result.options = ["True", "False"]
            result.answer = "True"
        if not result.difficulty:
            result.difficulty = difficulty_label
        return result

    async def test_connection(self, llm_config: ModelConfig | None = None) -> str:
        llm = self._build_llm(llm_config)
        response = await llm.ainvoke("Reply with exactly: ok")
        return response.content
