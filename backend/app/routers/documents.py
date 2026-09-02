from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from pathlib import Path

from app.core.database import get_db
from app.core.rbac import require_role
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentResponse
from app.services.document_service import save_document
from app.repositories.document_repository import (
    get_all_documents,
    get_document_by_id
)
from app.repositories.document_repository import delete_document


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED
)
def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    try:
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)

        document = save_document(
            db=db,
            file=file,
            file_size=file_size,
            uploaded_by=current_user.id
        )

        return document

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )

@router.get("/", response_model=list[DocumentResponse])
def list_documents(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    return get_all_documents(db)

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    document = get_document_by_id(db, document_id)

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    return document

@router.delete("/{document_id}")
def remove_document(
    document_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    document = get_document_by_id(db, document_id)

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    file_path = Path(document.file_path)

    if file_path.exists():
        file_path.unlink()

    delete_document(db, document)

    return {
        "message": "Document deleted successfully",
        "document_id": document_id
    }