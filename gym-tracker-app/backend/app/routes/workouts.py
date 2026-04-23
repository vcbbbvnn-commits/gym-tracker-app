from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate, SetCreate, SetUpdate
from app.schemas.workout import WorkoutCreate, WorkoutRead, WorkoutUpdate
from app.services.workout_service import (
    add_exercise,
    add_set,
    create_workout,
    delete_exercise,
    delete_set,
    delete_workout,
    get_workout_or_404,
    list_workouts,
    update_exercise,
    update_set,
    update_workout,
)

router = APIRouter()


@router.get("", response_model=list[WorkoutRead])
def get_workouts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[WorkoutRead]:
    return list_workouts(db, current_user)


@router.post("", response_model=WorkoutRead, status_code=status.HTTP_201_CREATED)
def create_new_workout(
    payload: WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkoutRead:
    return create_workout(db, current_user, payload)


@router.get("/{workout_id}", response_model=WorkoutRead)
def get_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkoutRead:
    return get_workout_or_404(db, current_user, workout_id)


@router.put("/{workout_id}", response_model=WorkoutRead)
def update_existing_workout(
    workout_id: int,
    payload: WorkoutUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkoutRead:
    return update_workout(db, current_user, workout_id, payload)


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    delete_workout(db, current_user, workout_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{workout_id}/exercises", response_model=WorkoutRead, status_code=status.HTTP_201_CREATED)
def create_exercise(
    workout_id: int,
    payload: ExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkoutRead:
    return add_exercise(db, current_user, workout_id, payload)


@router.put("/exercises/{exercise_id}", response_model=WorkoutRead)
def edit_exercise(
    exercise_id: int,
    payload: ExerciseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkoutRead:
    return update_exercise(db, current_user, exercise_id, payload)


@router.delete("/exercises/{exercise_id}", response_model=WorkoutRead)
def remove_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkoutRead:
    return delete_exercise(db, current_user, exercise_id)


@router.post("/exercises/{exercise_id}/sets", response_model=WorkoutRead, status_code=status.HTTP_201_CREATED)
def create_set(
    exercise_id: int,
    payload: SetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkoutRead:
    return add_set(db, current_user, exercise_id, payload)


@router.put("/sets/{set_id}", response_model=WorkoutRead)
def edit_set(
    set_id: int,
    payload: SetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkoutRead:
    return update_set(db, current_user, set_id, payload)


@router.delete("/sets/{set_id}", response_model=WorkoutRead)
def remove_set(
    set_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkoutRead:
    return delete_set(db, current_user, set_id)
