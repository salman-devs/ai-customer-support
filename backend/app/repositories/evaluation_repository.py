from sqlalchemy.orm import Session

from app.models.evaluation import EvaluationCase


def create_evaluation_case(
    db: Session,
    question: str,
    expected_answer: str,
    expected_document: str | None = None,
    expected_chunk_index: int | None = None,
):
    evaluation_case = EvaluationCase(
        question=question,
        expected_answer=expected_answer,
        expected_document=expected_document,
        expected_chunk_index=expected_chunk_index,
    )

    db.add(evaluation_case)
    db.commit()
    db.refresh(evaluation_case)

    return evaluation_case


def get_all_evaluation_cases(db: Session):
    return (
        db.query(EvaluationCase)
        .order_by(EvaluationCase.created_at.desc())
        .all()
    )


def get_evaluation_case_by_id(
    db: Session,
    case_id: int,
):
    return (
        db.query(EvaluationCase)
        .filter(EvaluationCase.id == case_id)
        .first()
    )


def delete_evaluation_case(
    db: Session,
    evaluation_case: EvaluationCase,
):
    db.delete(evaluation_case)
    db.commit()