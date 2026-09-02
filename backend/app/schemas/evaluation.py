from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EvaluationCaseCreate(BaseModel):
    question: str
    expected_answer: str
    expected_document: str | None = None
    expected_chunk_index: int | None = None


class EvaluationCaseResponse(BaseModel):
    id: int
    question: str
    expected_answer: str
    expected_document: str | None
    expected_chunk_index: int | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)