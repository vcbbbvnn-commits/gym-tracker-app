from fastapi import APIRouter, Depends, HTTPException
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new workout based on a template."""
    template = template_service.get_template_by_id(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Create workout
    workout = Workout(
        name=template.name,
        description=template.description,
        user_id=current_user.id,
    )
    db.add(workout)
    db.flush()

    # Add exercises from template
    for template_exercise in template.exercises:
        exercise = Exercise(
            name=template_exercise.name,
            notes=f"Recommended: {template_exercise.recommended_sets} sets x {template_exercise.recommended_reps} reps. {template_exercise.notes or ''}",
            workout_id=workout.id,
        )
        db.add(exercise)

    db.commit()
    db.refresh(workout)

    return {"message": "Workout created from template", "workout_id": workout.id}
