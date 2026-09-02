from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, Text, Boolean
from sqlalchemy.sql import func

from app.core.database import Base


class EvaluationResult(Base):
    __tablename__ = "evaluation_results"

    id = Column(Integer, primary_key=True, index=True)

    evaluation_case_id = Column(
        Integer,
        ForeignKey("evaluation_cases.id"),
        nullable=False,
    )

    generated_answer = Column(Text, nullable=False)

    retrieval_relevant = Column(Boolean, nullable=True)

    answer_similarity = Column(Float, nullable=False)

    answer_correct = Column(Boolean, nullable=False)

    faithfulness_score = Column(Float, nullable=False)

    faithful = Column(Boolean, nullable=False)

    latency_ms = Column(Float, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )