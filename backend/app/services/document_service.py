from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.document import Document


ALLOWED_FILE_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def validate_file(file: UploadFile, file_size: int) -> str:
    if file.content_type not in ALLOWED_FILE_TYPES:
        raise ValueError("Only PDF, DOCX, and TXT files are allowed")

    if file_size > MAX_FILE_SIZE:
        raise ValueError("File size cannot exceed 10 MB")

    return ALLOWED_FILE_TYPES[file.content_type]


def save_document(
    db: Session,
    file: UploadFile,
    file_size: int,
    uploaded_by: int,
):
    file_type = validate_file(file, file_size)

    upload_dir = Path("uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)

    stored_filename = f"{uuid4().hex}.{file_type}"
    file_path = upload_dir / stored_filename

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    document = Document(
        filename=file.filename,
        file_path=str(file_path),
        file_type=file_type,
        file_size=file_size,
        status="pending",
        uploaded_by=uploaded_by,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document