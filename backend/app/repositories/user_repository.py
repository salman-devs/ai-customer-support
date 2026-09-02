from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(
    db: Session,
    name: str,
    email: str,
    password_hash: str,
    role: str = "customer"
):
    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        role=role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def update_user_role(db: Session, user_id: int, role: str):
    user = get_user_by_id(db, user_id)

    if user is None:
        return None

    user.role = role

    db.commit()
    db.refresh(user)

    return user