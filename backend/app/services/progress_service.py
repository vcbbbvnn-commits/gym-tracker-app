from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

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


def get_weekly_comparison(db: Session, user: User, exercise_name: str) -> dict:
    """Get week-by-week comparison for a specific exercise."""
    today = datetime.utcnow()
    current_week_start = today - timedelta(days=today.weekday())
    previous_week_start = current_week_start - timedelta(days=7)
    previous_week_end = current_week_start

    # Current week data
    current_week = (
        db.query(
            func.count(SetEntry.id).label("total_sets"),
            func.coalesce(func.max(SetEntry.weight), 0.0).label("best_weight"),
            func.coalesce(func.sum(SetEntry.weight * SetEntry.reps), 0.0).label("total_volume"),
            func.coalesce(func.avg(SetEntry.reps), 0).label("avg_reps"),
        )
        .join(Exercise, SetEntry.exercise_id == Exercise.id)
        .join(Workout, Exercise.workout_id == Workout.id)
        .filter(
            Workout.user_id == user.id,
            Exercise.name == exercise_name,
            SetEntry.performed_at >= current_week_start,
        )
        .first()
    )

    # Previous week data
    previous_week = (
        db.query(
            func.count(SetEntry.id).label("total_sets"),
            func.coalesce(func.max(SetEntry.weight), 0.0).label("best_weight"),
            func.coalesce(func.sum(SetEntry.weight * SetEntry.reps), 0.0).label("total_volume"),
            func.coalesce(func.avg(SetEntry.reps), 0).label("avg_reps"),
        )
        .join(Exercise, SetEntry.exercise_id == Exercise.id)
        .join(Workout, Exercise.workout_id == Workout.id)
        .filter(
            Workout.user_id == user.id,
            Exercise.name == exercise_name,
            SetEntry.performed_at >= previous_week_start,
            SetEntry.performed_at < previous_week_end,
        )
        .first()
    )

    def get_change(current_val, prev_val):
        if prev_val == 0:
            return 0
        return ((current_val - prev_val) / prev_val) * 100

    current = {
        "total_sets": int(current_week.total_sets) if current_week else 0,
        "best_weight": float(current_week.best_weight) if current_week else 0,
        "total_volume": float(current_week.total_volume) if current_week else 0,
        "avg_reps": float(current_week.avg_reps) if current_week else 0,
    }
    
    previous = {
        "total_sets": int(previous_week.total_sets) if previous_week else 0,
        "best_weight": float(previous_week.best_weight) if previous_week else 0,
        "total_volume": float(previous_week.total_volume) if previous_week else 0,
        "avg_reps": float(previous_week.avg_reps) if previous_week else 0,
    }

    return {
        "exercise_name": exercise_name,
        "current_week": current,
        "previous_week": previous,
        "improvement": {
            "sets_change_percent": get_change(current["total_sets"], previous["total_sets"]),
            "weight_change_percent": get_change(current["best_weight"], previous["best_weight"]),
            "volume_change_percent": get_change(current["total_volume"], previous["total_volume"]),
        },
    }
