from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import TokenResponse, UserCreate, UserLogin
from app.services.auth_service import login_user, register_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    user = register_user(db, user_data)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }


@router.post("/login", response_model=TokenResponse)
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    access_token = login_user(db, user_data)

    if access_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }