from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str


class SourceResponse(BaseModel):
    filename: str | None
    document_id: int | None
    chunk_index: int | None
    rerank_score: float


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceResponse]