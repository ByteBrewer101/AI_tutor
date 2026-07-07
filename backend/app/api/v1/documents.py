import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.document import Document
from app.models.notebook import Notebook
from app.schemas.document import DocumentResponse

router = APIRouter()


@router.post("/notebooks/{notebook_id}/documents", response_model=DocumentResponse, status_code=201)
async def upload_document(
    notebook_id: uuid.UUID,
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Notebook).where(Notebook.id == notebook_id))
    notebook = result.scalar_one_or_none()
    if notebook is None:
        raise HTTPException(status_code=404, detail="Notebook not found")

    content = await file.read()
    document = Document(
        notebook_id=notebook_id,
        filename=file.filename or "unknown",
        content_type=file.content_type or "application/octet-stream",
        size_bytes=len(content),
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)
    return document


@router.get("/notebooks/{notebook_id}/documents", response_model=list[DocumentResponse])
async def list_documents(
    notebook_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(Document.notebook_id == notebook_id).order_by(Document.created_at.desc())
    )
    return result.scalars().all()


@router.delete("/documents/{document_id}", status_code=204)
async def delete_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(document)
    await db.commit()
