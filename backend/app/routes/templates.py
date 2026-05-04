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


@router.post("/templates", response_model=WorkoutTemplateResponse)
def create_custom_template(
    payload: WorkoutTemplateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a reusable custom workout template."""
    template = template_service.create_workout_template(db, payload)
    template.is_preset = False
    db.commit()
    db.refresh(template)
    return template


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
    """Identify the primary focus, prioritizing specific muscle groups for Bro Splits."""
    if not exercises:
        return "REST"
        
    scores = {
        "CHEST": 0, "BACK": 0, "LEGS": 0, "SHOULDERS": 0, 
        "BICEPS": 0, "TRICEPS": 0
    }
    
    for ex in exercises:
        name = ex.name.lower()
        # LEGS
        if any(w in name for w in ["squat", "leg press", "lunge", "hack squat"]): scores["LEGS"] += 3
        elif any(w in name for w in ["leg extension", "leg curl", "calf", "romanian deadlift"]): scores["LEGS"] += 1
        # CHEST
        if any(w in name for w in ["bench press", "chest press", "incline press", "db press"]): scores["CHEST"] += 3
        elif any(w in name for w in ["fly", "pec deck", "crossover", "dip"]): scores["CHEST"] += 1
        # BACK
        if any(w in name for w in ["deadlift", "row", "pull-up", "pulldown", "t-bar"]): scores["BACK"] += 3
        elif any(w in name for w in ["face pull", "shrug", "lat"]): 
            if "lateral" not in name: scores["BACK"] += 1
        # SHOULDERS
        if any(w in name for w in ["overhead press", "shoulder press", "military press"]): scores["SHOULDERS"] += 3
        elif any(w in name for w in ["lateral raise", "front raise", "rear delt"]): scores["SHOULDERS"] += 1
        # ARMS
        if "bicep" in name or ("curl" in name and "leg" not in name): scores["BICEPS"] += 1
        if "tricep" in name or any(w in name for w in ["skull crusher", "pushdown", "extension"]):
            if "leg" not in name: scores["TRICEPS"] += 1

    # Determine winner
    top_focus = max(scores, key=scores.get)
    max_score = scores[top_focus]
    if max_score == 0:
        return "TRAINING"
        
    # Only use complex labels if there's a strong secondary muscle (at least 50% of top score)
    # This prevents Bro Split days from being mislabeled as PUSH/UPPER
    secondary_muscles = [m for m, s in scores.items() if s >= (max_score * 0.5) and m != top_focus]
    
    if not secondary_muscles:
        return top_focus

    # Mix detection for PPL/Upper-Lower
    has_chest = scores["CHEST"] > 0
    has_back = scores["BACK"] > 0
    has_shoulders = scores["SHOULDERS"] > 0
    
    if has_chest and has_shoulders and not has_back:
        return "PUSH"
    if has_back and scores["BICEPS"] > 0 and not has_chest:
        return "PULL"
    if has_chest and has_back:
        return "UPPER"
    
    # If primarily legs and no upper body, return LOWER to match UPPER
    if scores["LEGS"] > 0 and not has_chest and not has_back:
        return "LOWER"
        
    return top_focus
