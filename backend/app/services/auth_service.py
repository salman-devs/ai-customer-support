from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.user_repository import create_user, get_user_by_email
from app.schemas.auth import UserCreate, UserLogin


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


def login_user(db: Session, user_data: UserLogin):
    user = get_user_by_email(db, user_data.email)

    if not user:
        return None

    if not verify_password(user_data.password, user.password_hash):
        return None

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "role": user.role
        }
    )

    return access_token