from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EvaluationResultResponse(BaseModel):
    id: int
    evaluation_case_id: int
    generated_answer: str
    retrieval_relevant: bool | None
    latency_ms: float
    created_at: datetime
    answer_similarity: float
    answer_correct: bool

    model_config = ConfigDict(from_attributes=True)