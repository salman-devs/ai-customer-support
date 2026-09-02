from rank_bm25 import BM25Okapi

from app.services.embedding_service import generate_embedding
from app.services.vector_store_service import collection


def semantic_search(query: str, top_k: int = 10):
    query_embedding = generate_embedding(query)

    return collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
    )


def keyword_search(query: str, top_k: int = 10):
    stored_data = collection.get(
        include=["documents", "metadatas"]
    )

    documents = stored_data["documents"]

    if not documents:
        return {
            "documents": [[]],
            "metadatas": [[]],
            "ids": [[]],
            "scores": [[]],
        }

    tokenized_documents = [
        document.lower().split()
        for document in documents
    ]

    bm25 = BM25Okapi(tokenized_documents)

    query_tokens = query.lower().split()

    scores = bm25.get_scores(query_tokens)

    ranked_indexes = sorted(
        range(len(scores)),
        key=lambda index: scores[index],
        reverse=True
    )[:top_k]

    return {
        "documents": [
            [documents[index] for index in ranked_indexes]
        ],
        "metadatas": [
            [stored_data["metadatas"][index] for index in ranked_indexes]
        ],
        "ids": [
            [stored_data["ids"][index] for index in ranked_indexes]
        ],
        "scores": [
            [float(scores[index]) for index in ranked_indexes]
        ],
    }


def hybrid_search(query: str, top_k: int = 5):
    semantic_results = semantic_search(
        query=query,
        top_k=top_k
    )

    keyword_results = keyword_search(
        query=query,
        top_k=top_k
    )

    combined = {}

    for rank, document_id in enumerate(semantic_results["ids"][0]):
        combined.setdefault(
            document_id,
            {
                "id": document_id,
                "document": semantic_results["documents"][0][rank],
                "metadata": semantic_results["metadatas"][0][rank],
                "score": 0.0,
            }
        )

        combined[document_id]["score"] += 1 / (rank + 1)

    for rank, document_id in enumerate(keyword_results["ids"][0]):
        combined.setdefault(
            document_id,
            {
                "id": document_id,
                "document": keyword_results["documents"][0][rank],
                "metadata": keyword_results["metadatas"][0][rank],
                "score": 0.0,
            }
        )

        combined[document_id]["score"] += 1 / (rank + 1)

    ranked_results = sorted(
        combined.values(),
        key=lambda item: item["score"],
        reverse=True
    )

    return ranked_results[:top_k]