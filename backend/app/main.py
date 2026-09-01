from fastapi import FastAPI


app = FastAPI(
    title="AI Customer Support API",
    description="RAG-based AI customer support platform",
    version="1.0.0"
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "AI Customer Support API is running"
    }