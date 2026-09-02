import time

from app.services.rag_service import ask_question


def evaluate_case(
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

    retrieved_documents = result.get("sources", [])

    retrieved_filenames = [
        source.get("filename")
        for source in retrieved_documents
    ]

    retrieval_relevant = None

    if expected_document:
        retrieval_relevant = (
            expected_document in retrieved_filenames
        )

    return {
        "question": question,
        "expected_answer": expected_answer,
        "generated_answer": result["answer"],
        "retrieved_documents": retrieved_documents,
        "retrieval_relevant": retrieval_relevant,
        "latency_ms": round(latency_ms, 2),
    }