from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.exercise import Exercise
from app.models.set_entry import SetEntry
from app.models.user import User
from app.models.workout import Workout
from app.schemas.progress import ExerciseProgressItem, ProgressSummary


def get_progress_summary(db: Session, user: User) -> ProgressSummary:
    total_workouts = db.query(func.count(Workout.id)).filter(Workout.user_id == user.id).scalar() or 0
    total_exercises = (
        db.query(func.count(Exercise.id))
        .join(Workout, Exercise.workout_id == Workout.id)
        .filter(Workout.user_id == user.id)
        .scalar()
        or 0
    )
    total_sets = (
        db.query(func.count(SetEntry.id))
        .join(Exercise, SetEntry.exercise_id == Exercise.id)
        .join(Workout, Exercise.workout_id == Workout.id)
        .filter(Workout.user_id == user.id)
        .scalar()
        or 0
    )
    total_volume = (
        db.query(func.coalesce(func.sum(SetEntry.weight * SetEntry.reps), 0.0))
        .join(Exercise, SetEntry.exercise_id == Exercise.id)
        .join(Workout, Exercise.workout_id == Workout.id)
        .filter(Workout.user_id == user.id)
        .scalar()
        or 0.0
    )

    return ProgressSummary(
        total_workouts=total_workouts,
        total_exercises=total_exercises,
        total_sets=total_sets,
        total_volume=float(total_volume),
    )


def get_exercise_progress(db: Session, user: User) -> list[ExerciseProgressItem]:
    rows = (
        db.query(
            Exercise.name.label("exercise_name"),
            func.count(SetEntry.id).label("total_sets"),
            func.coalesce(func.max(SetEntry.weight), 0.0).label("best_weight"),
            func.coalesce(func.sum(SetEntry.weight * SetEntry.reps), 0.0).label("total_volume"),
        )
        .join(Workout, Exercise.workout_id == Workout.id)
        .outerjoin(SetEntry, SetEntry.exercise_id == Exercise.id)
        .filter(Workout.user_id == user.id)
        .group_by(Exercise.name)
        .order_by(func.coalesce(func.sum(SetEntry.weight * SetEntry.reps), 0.0).desc(), Exercise.name.asc())
        .all()
    )

    return [
        ExerciseProgressItem(
            exercise_name=row.exercise_name,
            total_sets=int(row.total_sets),
            best_weight=float(row.best_weight),
            total_volume=float(row.total_volume),
        )
        for row in rows
    ]
