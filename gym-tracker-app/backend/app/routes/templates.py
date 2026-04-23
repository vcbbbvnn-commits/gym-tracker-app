from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.workout import Workout
from app.models.exercise import Exercise
from app.schemas.template import WorkoutTemplateResponse, WorkoutTemplateCreate
from app.services import template_service

router = APIRouter()


@router.get("/templates", response_model=list[WorkoutTemplateResponse])
def get_templates(db: Session = Depends(get_db)):
    """Get all available workout templates."""
    templates = template_service.get_all_templates(db)
    return templates


@router.get("/templates/{template_id}", response_model=WorkoutTemplateResponse)
def get_template(template_id: int, db: Session = Depends(get_db)):
    """Get a specific workout template."""
    template = template_service.get_template_by_id(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.get("/templates/category/{category}", response_model=list[WorkoutTemplateResponse])
def get_templates_by_category(category: str, db: Session = Depends(get_db)):
    """Get templates by category."""
    templates = template_service.get_templates_by_category(db, category)
    return templates


@router.post("/templates/use/{template_id}")
def create_workout_from_template(
    template_id: int,
    day_number: Optional[int] = Query(default=None, description="Specific day to load (1-7). If omitted, loads Day 1."),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new workout session for a specific day of a template."""
    template = template_service.get_template_by_id(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Default to day 1 if no day specified (backward compat)
    if day_number is None:
        day_number = 1

    # Filter exercises for the requested day only
    day_exercises = [e for e in template.exercises if e.day_number == day_number]

    # If no exercises for that day, fall back to day 1
    if not day_exercises:
        day_number = 1
        day_exercises = [e for e in template.exercises if e.day_number == 1]

    if not day_exercises:
        raise HTTPException(
            status_code=400,
            detail=f"No exercises found in this template",
        )

    # Derive a focus label
    focus = _get_day_focus(day_exercises)

    # Create a descriptive workout name
    workout_name = f"{template.name} – Day {day_number}: {focus}"

    workout = Workout(
        name=workout_name,
        description=f"Day {day_number} of {template.name}. Focus: {focus}",
        user_id=current_user.id,
    )
    db.add(workout)
    db.flush()

    # Add only this day's exercises
    for template_exercise in sorted(day_exercises, key=lambda e: e.order):
        exercise = Exercise(
            name=template_exercise.name,
            notes=f"{template_exercise.recommended_sets} sets × {template_exercise.recommended_reps} reps",
            workout_id=workout.id,
        )
        db.add(exercise)

    db.commit()
    db.refresh(workout)

    return {"message": "Workout created from template", "workout_id": workout.id}


def _get_day_focus(exercises) -> str:
    """Guess the muscle group focus from exercise names."""
    names = " ".join(e.name.lower() for e in exercises)
    if any(w in names for w in ["chest", "bench", "pec", "incline"]):
        return "CHEST"
    if any(w in names for w in ["back", "row", "lat", "pull-up", "pulldown"]):
        return "BACK"
    if any(w in names for w in ["shoulder", "press", "lateral", "shrug", "delt", "overhead"]):
        return "SHOULDERS"
    if any(w in names for w in ["leg", "squat", "calf", "lunge", "romanian", "deadlift"]):
        return "LEGS"
    if any(w in names for w in ["bicep", "curl", "hammer"]):
        return "BICEPS"
    if any(w in names for w in ["tricep", "pushdown", "skull", "dip", "close-grip"]):
        return "TRICEPS"
    if any(w in names for w in ["push"]):
        return "PUSH"
    if any(w in names for w in ["pull"]):
        return "PULL"
    return "TRAINING"
