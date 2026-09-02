
from datetime import datetime

from pydantic import BaseModel


class ChatSessionCreate(BaseModel):
    title: str | None = None


class ChatSessionResponse(BaseModel):
    id: int
    title: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class ChatMessageResponse(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class ChatRequest(BaseModel):
    question: str
    session_id: int | None = None


class SourceResponse(BaseModel):
    filename: str | None
    document_id: int | None
    chunk_index: int | None
    rerank_score: float


class ChatResponse(BaseModel):
    session_id: int
    answer: str
    sources: list[SourceResponse]
