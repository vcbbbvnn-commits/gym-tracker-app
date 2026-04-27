from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.body_weight import BodyWeight
from app.models.user import User
from app.models.exercise import Exercise
from app.models.set_entry import SetEntry
from app.models.workout import Workout

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────
class BodyWeightIn(BaseModel):
    weight_kg: float
    logged_at: datetime | None = None


class BodyWeightOut(BaseModel):
    id: int
    weight_kg: float
    logged_at: datetime

    class Config:
        from_attributes = True


# ── Body Weight CRUD ──────────────────────────────────────────────────────────
@router.post("", response_model=BodyWeightOut, status_code=201)
def log_body_weight(
    payload: BodyWeightIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = BodyWeight(
        user_id=current_user.id,
        weight_kg=payload.weight_kg,
        logged_at=payload.logged_at or datetime.utcnow(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("", response_model=list[BodyWeightOut])
def get_body_weights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(BodyWeight)
        .filter(BodyWeight.user_id == current_user.id)
        .order_by(BodyWeight.logged_at.asc())
        .all()
    )


@router.delete("/{entry_id}", status_code=204)
def delete_body_weight(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(BodyWeight).filter(
        BodyWeight.id == entry_id, BodyWeight.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()


# ── Weekly Volume ─────────────────────────────────────────────────────────────
@router.get("/volume/weekly")
def weekly_volume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return total volume (kg) for each of the last 8 weeks."""
    workouts = (
        db.query(Workout)
        .filter(Workout.user_id == current_user.id)
        .all()
    )
    from collections import defaultdict
    weekly: dict[str, float] = defaultdict(float)
    for w in workouts:
        for ex in w.exercises:
            for s in ex.sets:
                if s.set_type == "warmup":
                    continue
                iso = s.performed_at.strftime("%Y-W%W")
                weekly[iso] += s.reps * s.weight
    # Sort and return last 8 weeks
    sorted_weeks = sorted(weekly.items())[-8:]
    return [{"week": w, "volume": round(v, 1)} for w, v in sorted_weeks]


# ── Previous Session for an Exercise ─────────────────────────────────────────
@router.get("/last-session/{exercise_name}")
def last_session_for_exercise(
    exercise_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the sets from the most recent workout containing this exercise."""
    exercise = (
        db.query(Exercise)
        .join(Workout)
        .filter(
            Workout.user_id == current_user.id,
            func.lower(Exercise.name) == exercise_name.lower(),
        )
        .order_by(Exercise.id.desc())
        .first()
    )
    if not exercise:
        return {"sets": [], "date": None}
    sets = [{"reps": s.reps, "weight": s.weight, "set_type": s.set_type} for s in exercise.sets]
    return {"sets": sets, "date": exercise.workout.created_at.isoformat() if exercise.workout else None}
