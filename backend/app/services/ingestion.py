from app.models.document import Document


async def process_document(document: Document) -> list[str]:
    chunks = [document.filename]
    return chunks
