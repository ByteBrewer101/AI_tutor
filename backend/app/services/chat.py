import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.notebook import Notebook, Topic
from app.schemas.notebook import TopicAIResponse, QuizQuestion, QuizQuestionsResponse
from app.schemas.chat import ChatMessage, ChatReply, ModelConfig, SuggestionItem
from app.services.storage import save_markdown, read_markdown
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_ollama import ChatOllama
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter


class AI_Service:
    @staticmethod
    def _build_llm(llm_config: ModelConfig | None = None) -> BaseChatModel:
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

    async def generate_quiz(
        self,
        topic_title: str,
        markdown_content: str,
        num_questions: int = 5,
        llm_config: ModelConfig | None = None,
    ) -> list[QuizQuestion]:
        system_prompt = (
            "You are an expert quiz creator. Generate a quiz from the provided material.\n"
            "- Mix of MCQ (4 options, 1 correct) and open-ended questions\n"
            "- Test comprehension, not memorization\n"
            "- Vary difficulty levels\n"
            f"- Generate exactly {num_questions} questions"
        )

        llm = self._build_llm(llm_config)
        quiz_structured_llm = llm.with_structured_output(QuizQuestionsResponse)

        result: QuizQuestionsResponse = await quiz_structured_llm.ainvoke(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Topic: {topic_title}\n\nMaterial:\n{markdown_content}"},
            ]
        )

        return result.questions

    async def test_connection(self, llm_config: ModelConfig | None = None) -> str:
        llm = self._build_llm(llm_config)
        response = await llm.ainvoke("Reply with exactly: ok")
        return response.content
