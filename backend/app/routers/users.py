from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.core.rbac import require_role
from app.models.user import User


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }


@router.get("/admin-test")
def admin_test(
    current_user: User = Depends(require_role("admin"))
):
    return {
        "message": "You have admin access",
        "user": current_user.email,
        "role": current_user.role
    }