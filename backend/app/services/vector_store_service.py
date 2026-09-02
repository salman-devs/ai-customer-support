import chromadb


CHROMA_PATH = "chroma_db"

client = chromadb.PersistentClient(path=CHROMA_PATH)

collection = client.get_or_create_collection(
    name="support_documents"
)


def add_documents(
    ids: list[str],
    documents: list[str],
    embeddings: list[list[float]],
    metadatas: list[dict],
):
    collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )


def search_documents(
    query_embedding: list[float],
    top_k: int = 5,
):
    return collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
    )


def delete_documents(ids: list[str]):
    collection.delete(ids=ids)


def delete_document_chunks(document_id: int):
    results = collection.get(
        where={"document_id": document_id},
        include=[]
    )

    if results["ids"]:
        collection.delete(ids=results["ids"])