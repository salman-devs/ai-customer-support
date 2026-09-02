import re
from pathlib import Path

from docx import Document as DocxDocument
from pypdf import PdfReader

from app.services.embedding_service import generate_embeddings
from app.services.vector_store_service import add_documents


def extract_text(file_path: str, file_type: str) -> str:
    if file_type == "pdf":
        text = extract_pdf_text(file_path)

    elif file_type == "docx":
        text = extract_docx_text(file_path)

    elif file_type == "txt":
        text = extract_txt_text(file_path)

    else:
        raise ValueError(f"Unsupported file type: {file_type}")

    return clean_text(text)


def extract_pdf_text(file_path: str) -> str:
    reader = PdfReader(file_path)

    text = []

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text.append(page_text)

    return "\n".join(text)


def extract_docx_text(file_path: str) -> str:
    document = DocxDocument(file_path)

    text = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            text.append(paragraph.text)

    return "\n".join(text)


def extract_txt_text(file_path: str) -> str:
    return Path(file_path).read_text(encoding="utf-8")


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = text.strip()

    return text


def chunk_text(
    text: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200
) -> list[str]:
    if chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be smaller than chunk_size")

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]

        if chunk.strip():
            chunks.append(chunk.strip())

        start += chunk_size - chunk_overlap

    return chunks


def create_chunk_metadata(
    chunks: list[str],
    document_id: int,
    filename: str
) -> list[dict]:
    chunk_data = []

    for index, chunk in enumerate(chunks):
        chunk_data.append({
            "chunk_index": index,
            "text": chunk,
            "metadata": {
                "document_id": document_id,
                "filename": filename,
                "chunk_index": index
            }
        })

    return chunk_data


def process_document(
    file_path: str,
    file_type: str,
    document_id: int,
    filename: str
):
    text = extract_text(file_path, file_type)

    if not text:
        raise ValueError("Document contains no extractable text")

    chunks = chunk_text(text)

    embeddings = generate_embeddings(chunks)

    chunk_data = create_chunk_metadata(
        chunks=chunks,
        document_id=document_id,
        filename=filename
    )

    ids = [
        f"document-{document_id}-chunk-{chunk['chunk_index']}"
        for chunk in chunk_data
    ]

    documents = [
        chunk["text"]
        for chunk in chunk_data
    ]

    metadatas = [
        chunk["metadata"]
        for chunk in chunk_data
    ]

    add_documents(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas
    )

    return {
        "document_id": document_id,
        "filename": filename,
        "chunks_created": len(chunks)
    }