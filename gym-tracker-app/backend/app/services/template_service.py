from sqlalchemy.orm import Session

from app.models.template import WorkoutTemplate, TemplateExercise
from app.schemas.template import WorkoutTemplateCreate, TemplateExerciseCreate


def create_template_exercise(db: Session, template_id: int, exercise_data: TemplateExerciseCreate) -> TemplateExercise:
    """Create a template exercise."""
    exercise = TemplateExercise(
        template_id=template_id,
        name=exercise_data.name,
        recommended_sets=exercise_data.recommended_sets,
        recommended_reps=exercise_data.recommended_reps,
        notes=exercise_data.notes,
        day_number=exercise_data.day_number,
        order=exercise_data.order,
    )
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise


def create_workout_template(db: Session, template_data: WorkoutTemplateCreate) -> WorkoutTemplate:
    """Create a new workout template."""
    template = WorkoutTemplate(
        name=template_data.name,
        description=template_data.description,
        category=template_data.category,
        duration_days=template_data.duration_days,
    )
    db.add(template)
    db.flush()

    for exercise_data in template_data.exercises:
        create_template_exercise(db, template.id, exercise_data)

    db.commit()
    db.refresh(template)
    return template


def get_all_templates(db: Session) -> list[WorkoutTemplate]:
    """Get all workout templates."""
    return db.query(WorkoutTemplate).order_by(WorkoutTemplate.category).all()


def get_template_by_id(db: Session, template_id: int) -> WorkoutTemplate | None:
    """Get a workout template by ID."""
    return db.query(WorkoutTemplate).filter(WorkoutTemplate.id == template_id).first()


def get_templates_by_category(db: Session, category: str) -> list[WorkoutTemplate]:
    """Get templates by category."""
    return db.query(WorkoutTemplate).filter(WorkoutTemplate.category == category).all()


def delete_template(db: Session, template_id: int) -> bool:
    """Delete a workout template."""
    template = get_template_by_id(db, template_id)
    if template and not template.is_preset:
        db.delete(template)
        db.commit()
        return True
    return False
