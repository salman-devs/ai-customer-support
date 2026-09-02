
from app.services.hybrid_search_service import hybrid_search
from app.services.llm_service import generate_answer
from app.services.reranker_service import rerank_documents


MIN_RERANK_SCORE = -8.0


def build_context(documents: list[dict]) -> str:
    context_parts = []

    for index, document in enumerate(documents, start=1):
        context_parts.append(
            f"[Source {index}]\n"
            f"Document: {document['metadata'].get('filename', 'Unknown')}\n"
            f"Content: {document['document']}"
        )

    return "\n\n".join(context_parts)


def ask_question(question: str, top_k: int = 5) -> dict:
    candidates = hybrid_search(
        query=question,
        top_k=10,
    )

    reranked_documents = rerank_documents(
        query=question,
        documents=candidates,
        top_k=top_k,
    )

    if not reranked_documents:
        return {
            "answer": "I don't have enough information to answer that.",
            "sources": [],
        }

    # Keep only sufficiently relevant documents.
    relevant_documents = [
        document
        for document in reranked_documents
        if document["rerank_score"] >= MIN_RERANK_SCORE
    ]

    if not relevant_documents:
        return {
            "answer": "I don't have enough information to answer that.",
            "sources": [],
        }

    context = build_context(relevant_documents)

    answer = generate_answer(
        question=question,
        context=context,
    )

    sources = [
        {
            "filename": document["metadata"].get("filename"),
            "document_id": document["metadata"].get("document_id"),
            "chunk_index": document["metadata"].get("chunk_index"),
            "rerank_score": document["rerank_score"],
        }
        for document in relevant_documents
    ]

    return {
        "answer": answer,
        "sources": sources,
    }