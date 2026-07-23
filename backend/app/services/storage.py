import uuid
from pathlib import Path

from app.config import settings


def _get_content_dir() -> Path:
    content_dir = Path(settings.CONTENT_DIR)
    content_dir.mkdir(parents=True, exist_ok=True)
    return content_dir


def _get_file_path(topic_id: uuid.UUID) -> Path:
    return _get_content_dir() / f"{topic_id}.md"


async def save_markdown(topic_id: uuid.UUID, content: str) -> str:
    file_path = _get_file_path(topic_id)
    file_path.write_text(content, encoding="utf-8")
    return file_path.name


async def read_markdown(topic_id: uuid.UUID) -> str | None:
    file_path = _get_file_path(topic_id)
    if not file_path.exists():
        return None
    return file_path.read_text(encoding="utf-8")


async def delete_markdown(topic_id: uuid.UUID) -> None:
    file_path = _get_file_path(topic_id)
    if file_path.exists():
        file_path.unlink()
