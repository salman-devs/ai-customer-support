from sqlalchemy.orm import Session

from app.models.evaluation_result import EvaluationResult


def create_evaluation_result(
    db: Session,
    evaluation_case_id: int,
    generated_answer: str,
    retrieval_relevant: bool | None,
    answer_similarity: float,
    answer_correct: bool,
    faithfulness_score: float,
    faithful: bool,
    latency_ms: float,
):
    result = EvaluationResult(
        evaluation_case_id=evaluation_case_id,
        generated_answer=generated_answer,
        retrieval_relevant=retrieval_relevant,
        answer_similarity=answer_similarity,
        answer_correct=answer_correct,
        faithfulness_score=faithfulness_score,
        faithful=faithful,
        latency_ms=latency_ms,
    )

    db.add(result)
    db.commit()
    db.refresh(result)

    return result


def get_results_for_case(
    db: Session,
    evaluation_case_id: int,
):
    return (
        db.query(EvaluationResult)
        .filter(
            EvaluationResult.evaluation_case_id == evaluation_case_id
        )
        .order_by(EvaluationResult.created_at.desc())
        .all()
    )


def get_all_evaluation_results(db: Session):
    return (
        db.query(EvaluationResult)
        .order_by(EvaluationResult.created_at.desc())
        .all()
    )