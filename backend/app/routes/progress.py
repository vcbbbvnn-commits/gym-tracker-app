from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.progress import ExerciseProgressItem, ProgressSummary
from app.services.progress_service import get_exercise_progress, get_progress_summary, get_weekly_comparison
from app.services.workout_service import list_workouts
from app.schemas.workout import WorkoutRead

router = APIRouter()


@router.get("/summary", response_model=ProgressSummary)
def summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> ProgressSummary:
    return get_progress_summary(db, current_user)


@router.get("/exercises", response_model=list[ExerciseProgressItem])
def exercise_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ExerciseProgressItem]:
    return get_exercise_progress(db, current_user)


@router.get("/weekly/{exercise_name}")
def weekly_comparison(
    exercise_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get week-by-week comparison for a specific exercise."""
    return get_weekly_comparison(db, current_user, exercise_name)


@router.get("/history", response_model=list[WorkoutRead])
def history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[WorkoutRead]:
    return list_workouts(db, current_user)
