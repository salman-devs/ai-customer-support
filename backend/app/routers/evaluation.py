from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rbac import require_role
from app.models.user import User
from app.repositories.evaluation_repository import (
    create_evaluation_case,
    get_all_evaluation_cases,
    get_evaluation_case_by_id,
    delete_evaluation_case,
)
from app.schemas.evaluation import (
    EvaluationCaseCreate,
    EvaluationCaseResponse,
)
from app.schemas.evaluation_result import EvaluationResultResponse
from app.services.evaluation_service import evaluate_case


router = APIRouter(
    prefix="/evaluations",
    tags=["Evaluations"],
)


@router.post(
    "/",
    response_model=EvaluationCaseResponse,
)
def create_case(
    case_data: EvaluationCaseCreate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    return create_evaluation_case(
        db=db,
        question=case_data.question,
        expected_answer=case_data.expected_answer,
        expected_document=case_data.expected_document,
        expected_chunk_index=case_data.expected_chunk_index,
    )


@router.get(
    "/",
    response_model=list[EvaluationCaseResponse],
)
def list_cases(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    return get_all_evaluation_cases(db)


@router.get(
    "/{case_id}",
    response_model=EvaluationCaseResponse,
)
def get_case(
    case_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    evaluation_case = get_evaluation_case_by_id(
        db=db,
        case_id=case_id,
    )

    if evaluation_case is None:
        raise HTTPException(
            status_code=404,
            detail="Evaluation case not found",
        )

    return evaluation_case


@router.post(
    "/{case_id}/run",
    response_model=EvaluationResultResponse,
)
def run_evaluation(
    case_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    evaluation_case = get_evaluation_case_by_id(
        db=db,
        case_id=case_id,
    )

    if evaluation_case is None:
        raise HTTPException(
            status_code=404,
            detail="Evaluation case not found",
        )

    return evaluate_case(
        db=db,
        evaluation_case_id=evaluation_case.id,
        question=evaluation_case.question,
        expected_answer=evaluation_case.expected_answer,
        expected_document=evaluation_case.expected_document,
    )


@router.delete("/{case_id}")
def delete_case(
    case_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    evaluation_case = get_evaluation_case_by_id(
        db=db,
        case_id=case_id,
    )

    if evaluation_case is None:
        raise HTTPException(
            status_code=404,
            detail="Evaluation case not found",
        )

    delete_evaluation_case(
        db=db,
        evaluation_case=evaluation_case,
    )

    return {
        "message": "Evaluation case deleted successfully",
        "case_id": case_id,
    }