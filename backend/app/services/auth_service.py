from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.repositories.user_repository import create_user, get_user_by_email
from app.schemas.auth import UserCreate


def register_user(db: Session, user_data: UserCreate):
    existing_user = get_user_by_email(db, user_data.email)

    if existing_user:
        return None

    password_hash = hash_password(user_data.password)

    return create_user(
        db=db,
        name=user_data.name,
        email=user_data.email,
        password_hash=password_hash
    )