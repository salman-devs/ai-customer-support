import time

from sqlalchemy.orm import Session

from app.repositories.evaluation_result_repository import (
    create_evaluation_result,
)
from app.services.answer_evaluation_service import (
    calculate_answer_similarity,
    is_answer_correct,
)
from app.services.faithfulness_evaluation_service import (
    calculate_faithfulness,
    is_faithful,
)
from app.services.hybrid_search_service import hybrid_search
from app.services.rag_service import ask_question
from app.services.reranker_service import rerank_documents


def evaluate_case(
    db: Session,
    evaluation_case_id: int,
    question: str,
    expected_answer: str,
    expected_document: str | None = None,
):
    start_time = time.perf_counter()

    result = ask_question(
        question=question,
        conversation_history=[],
    )

    latency_ms = (time.perf_counter() - start_time) * 1000

    candidates = hybrid_search(
        query=question,
        top_k=10,
    )

    reranked_documents = rerank_documents(
        query=question,
        documents=candidates,
        top_k=5,
    )

    retrieved_filenames = [
        document["metadata"].get("filename")
        for document in reranked_documents
    ]

    retrieval_relevant = None

    if expected_document:
        retrieval_relevant = (
            expected_document in retrieved_filenames
        )

    answer_similarity = calculate_answer_similarity(
        generated_answer=result["answer"],
        expected_answer=expected_answer,
    )

    answer_correct = is_answer_correct(
        generated_answer=result["answer"],
        expected_answer=expected_answer,
    )

    context = "\n\n".join(
        document["document"]
        for document in reranked_documents
    )

    faithfulness_score = calculate_faithfulness(
        generated_answer=result["answer"],
        context=context,
    )

    faithful = is_faithful(
        generated_answer=result["answer"],
        context=context,
    )

    evaluation_result = create_evaluation_result(
        db=db,
        evaluation_case_id=evaluation_case_id,
        generated_answer=result["answer"],
        retrieval_relevant=retrieval_relevant,
        answer_similarity=answer_similarity,
        answer_correct=answer_correct,
        faithfulness_score=faithfulness_score,
        faithful=faithful,
        latency_ms=latency_ms,
    )

    return evaluation_result