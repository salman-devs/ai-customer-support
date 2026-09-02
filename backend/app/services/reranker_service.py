from sentence_transformers import CrossEncoder


MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"

model = CrossEncoder(MODEL_NAME)


def rerank_documents(
    query: str,
    documents: list[dict],
    top_k: int = 5,
) -> list[dict]:
    if not documents:
        return []

    pairs = [
        [query, document["document"]]
        for document in documents
    ]

    scores = model.predict(pairs)

    ranked_documents = []

    for document, score in zip(documents, scores):
        ranked_documents.append({
            **document,
            "rerank_score": float(score),
        })

    ranked_documents.sort(
        key=lambda item: item["rerank_score"],
        reverse=True,
    )

    return ranked_documents[:top_k]