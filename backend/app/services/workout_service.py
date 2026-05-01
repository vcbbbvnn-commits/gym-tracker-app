from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.exercise import Exercise
from app.models.set_entry import SetEntry
from app.models.user import User
from app.models.workout import Workout
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate, SetCreate, SetUpdate
from app.schemas.workout import WorkoutCreate, WorkoutUpdate


def list_workouts(db: Session, user: User) -> list[Workout]:
    return (
        db.query(Workout)
        .options(joinedload(Workout.exercises).joinedload(Exercise.sets))
        .filter(Workout.user_id == user.id)
        .order_by(Workout.created_at.desc())
        .all()
    )


def get_workout_or_404(db: Session, user: User, workout_id: int) -> Workout:
    workout = (
        db.query(Workout)
        .options(joinedload(Workout.exercises).joinedload(Exercise.sets))
        .filter(Workout.id == workout_id, Workout.user_id == user.id)
        .first()
    )
    if not workout:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout not found")
    return workout


def create_workout(db: Session, user: User, payload: WorkoutCreate) -> Workout:
    workout = Workout(
        name=payload.name.strip(),
        description=payload.description,
        user_id=user.id,
    )
    if payload.performed_at is not None:
        workout.created_at = payload.performed_at
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return get_workout_or_404(db, user, workout.id)


def update_workout(db: Session, user: User, workout_id: int, payload: WorkoutUpdate) -> Workout:
    workout = get_workout_or_404(db, user, workout_id)
    if payload.name is not None:
        workout.name = payload.name.strip()
    if payload.description is not None:
        workout.description = payload.description
    db.commit()
    db.refresh(workout)
    return get_workout_or_404(db, user, workout.id)


def delete_workout(db: Session, user: User, workout_id: int) -> None:
    workout = get_workout_or_404(db, user, workout_id)
    db.delete(workout)
    db.commit()


def add_exercise(db: Session, user: User, workout_id: int, payload: ExerciseCreate) -> Workout:
    workout = get_workout_or_404(db, user, workout_id)
    exercise = Exercise(name=payload.name.strip(), notes=payload.notes, workout_id=workout.id)
    db.add(exercise)
    db.commit()
    return get_workout_or_404(db, user, workout.id)


def _get_exercise_or_404(db: Session, user: User, exercise_id: int) -> Exercise:
    exercise = (
        db.query(Exercise)
        .join(Workout)
        .options(joinedload(Exercise.sets), joinedload(Exercise.workout))
        .filter(Exercise.id == exercise_id, Workout.user_id == user.id)
        .first()
    )
    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found")
    return exercise


def update_exercise(db: Session, user: User, exercise_id: int, payload: ExerciseUpdate) -> Workout:
    exercise = _get_exercise_or_404(db, user, exercise_id)
    if payload.name is not None:
        exercise.name = payload.name.strip()
    if payload.notes is not None:
        exercise.notes = payload.notes
    db.commit()
    return get_workout_or_404(db, user, exercise.workout_id)


def delete_exercise(db: Session, user: User, exercise_id: int) -> Workout:
    exercise = _get_exercise_or_404(db, user, exercise_id)
    workout_id = exercise.workout_id
    db.delete(exercise)
    db.commit()
    return get_workout_or_404(db, user, workout_id)


def add_set(db: Session, user: User, exercise_id: int, payload: SetCreate) -> Workout:
    exercise = _get_exercise_or_404(db, user, exercise_id)
    set_entry = SetEntry(
        exercise_id=exercise.id,
        reps=payload.reps,
        weight=payload.weight,
        set_type=payload.set_type or "normal",
        performed_at=payload.performed_at or datetime.now(timezone.utc),
    )
    db.add(set_entry)
    db.commit()
    return get_workout_or_404(db, user, exercise.workout_id)


def _get_set_or_404(db: Session, user: User, set_id: int) -> SetEntry:
    set_entry = (
        db.query(SetEntry)
        .join(Exercise)
        .join(Workout)
        .options(joinedload(SetEntry.exercise))
        .filter(SetEntry.id == set_id, Workout.user_id == user.id)
        .first()
    )
    if not set_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Set not found")
    return set_entry


def update_set(db: Session, user: User, set_id: int, payload: SetUpdate) -> Workout:
    set_entry = _get_set_or_404(db, user, set_id)
    if payload.reps is not None:
        set_entry.reps = payload.reps
    if payload.weight is not None:
        set_entry.weight = payload.weight
    if payload.set_type is not None:
        set_entry.set_type = payload.set_type
    if payload.performed_at is not None:
        set_entry.performed_at = payload.performed_at
    db.commit()
    return get_workout_or_404(db, user, set_entry.exercise.workout_id)


def delete_set(db: Session, user: User, set_id: int) -> Workout:
    set_entry = _get_set_or_404(db, user, set_id)
    workout_id = set_entry.exercise.workout_id
    db.delete(set_entry)
    db.commit()
    return get_workout_or_404(db, user, workout_id)
