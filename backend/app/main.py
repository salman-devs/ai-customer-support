from fastapi import FastAPI

from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.documents import router as documents_router
from app.routers.chat import router as chat_router


app = FastAPI(
    title="AI Customer Support API",
    description="RAG-based AI customer support platform",
    version="1.0.0"
)


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(documents_router)
app.include_router(chat_router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "AI Customer Support API is running"
    }