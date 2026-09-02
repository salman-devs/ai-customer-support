
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.repositories.chat_repository import (
    create_chat_message,
    create_chat_session,
    get_chat_messages,
    get_chat_session,
    get_user_chat_sessions,
)
from app.schemas.chat import (
    ChatMessageResponse,
    ChatRequest,
    ChatResponse,
    ChatSessionCreate,
    ChatSessionResponse,
)
from app.services.rag_service import ask_question


router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post(
    "/sessions",
    response_model=ChatSessionResponse,
)
def create_session(
    session_data: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_chat_session(
        db=db,
        user_id=current_user.id,
        title=session_data.title,
    )


@router.get(
    "/sessions",
    response_model=list[ChatSessionResponse],
)
def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_user_chat_sessions(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/sessions/{session_id}/messages",
    response_model=list[ChatMessageResponse],
)
def get_session_messages(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = get_chat_session(
        db=db,
        session_id=session_id,
        user_id=current_user.id,
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Chat session not found",
        )

    return list(
        reversed(
            get_chat_messages(
                db=db,
                session_id=session_id,
                limit=20,
            )
        )
    )


@router.post(
    "/",
    response_model=ChatResponse,
)
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if request.session_id is None:
        session = create_chat_session(
            db=db,
            user_id=current_user.id,
            title=request.question[:50],
        )
    else:
        session = get_chat_session(
            db=db,
            session_id=request.session_id,
            user_id=current_user.id,
        )

        if session is None:
            raise HTTPException(
                status_code=404,
                detail="Chat session not found",
            )

    history = get_chat_messages(
        db=db,
        session_id=session.id,
        limit=10,
    )

    create_chat_message(
        db=db,
        session_id=session.id,
        role="user",
        content=request.question,
    )

    result = ask_question(
        question=request.question,
        conversation_history=history,
    )

    create_chat_message(
        db=db,
        session_id=session.id,
        role="assistant",
        content=result["answer"],
    )

    return {
        "session_id": session.id,
        "answer": result["answer"],
        "sources": result["sources"],
    }
