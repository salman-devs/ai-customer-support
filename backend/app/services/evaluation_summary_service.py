from sqlalchemy.orm import Session

from app.repositories.evaluation_result_repository import (
    get_all_evaluation_results,
)


def get_evaluation_summary(db: Session):
    results = get_all_evaluation_results(db)

    total_evaluations = len(results)

    if total_evaluations == 0:
        return {
            "total_evaluations": 0,
            "retrieval_relevance": 0.0,
            "answer_correctness": 0.0,
            "faithfulness": 0.0,
            "average_latency_ms": 0.0,
        }

    retrieval_results = [
        result.retrieval_relevant
        for result in results
        if result.retrieval_relevant is not None
    ]

    retrieval_relevance = (
        sum(retrieval_results) / len(retrieval_results) * 100
        if retrieval_results
        else 0.0
    )

    answer_correctness = (
        sum(result.answer_correct for result in results)
        / total_evaluations
        * 100
    )

    faithfulness = (
        sum(result.faithful for result in results)
        / total_evaluations
        * 100
    )

    average_latency = (
        sum(result.latency_ms for result in results)
        / total_evaluations
    )

    return {
        "total_evaluations": total_evaluations,
        "retrieval_relevance": round(retrieval_relevance, 2),
        "answer_correctness": round(answer_correctness, 2),
        "faithfulness": round(faithfulness, 2),
        "average_latency_ms": round(average_latency, 2),
    }