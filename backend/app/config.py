from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_tutor"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    APP_NAME: str = "AI Tutor"
    CONTENT_DIR: str = "storage/markdown"
    CHAT_SUMMARY_THRESHOLD: int = 5


settings = Settings()
