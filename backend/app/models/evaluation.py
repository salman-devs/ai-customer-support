from sqlalchemy import Column, Integer, Text, String, DateTime
from sqlalchemy.sql import func

from app.core.database import Base


class EvaluationCase(Base):
    __tablename__ = "evaluation_cases"

    id = Column(Integer, primary_key=True, index=True)

    question = Column(Text, nullable=False)

    expected_answer = Column(Text, nullable=False)

    expected_document = Column(String(255), nullable=True)

    expected_chunk_index = Column(Integer, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )