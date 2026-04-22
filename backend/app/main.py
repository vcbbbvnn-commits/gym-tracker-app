from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.routes import auth, progress, workouts, templates
from app.services.template_service import create_workout_template
from app.schemas.template import WorkoutTemplateCreate, TemplateExerciseCreate


def seed_templates():
    """Create preset workout templates."""
    db = SessionLocal()
    try:
        # Check if templates already exist
        from app.models.template import WorkoutTemplate
        if db.query(WorkoutTemplate).filter(WorkoutTemplate.is_preset).count() > 0:
            return

        # Push/Pull/Legs Split
        ppl_template = WorkoutTemplateCreate(
            name="Push/Pull/Legs Split",
            description="Classic 3-day split focusing on push (chest, shoulders, triceps), pull (back, biceps), and legs",
            category="Push/Pull/Legs",
            duration_days=6,
            exercises=[
                # Push Day
                TemplateExerciseCreate(name="Bench Press", recommended_sets=4, recommended_reps="6-8", day_number=1, order=1),
                TemplateExerciseCreate(name="Incline Dumbbell Press", recommended_sets=3, recommended_reps="8-10", day_number=1, order=2),
                TemplateExerciseCreate(name="Lateral Raises", recommended_sets=3, recommended_reps="10-15", day_number=1, order=3),
                TemplateExerciseCreate(name="Tricep Dips", recommended_sets=3, recommended_reps="8-12", day_number=1, order=4),
                # Pull Day
                TemplateExerciseCreate(name="Deadlifts", recommended_sets=4, recommended_reps="5-6", day_number=3, order=1),
                TemplateExerciseCreate(name="Barbell Rows", recommended_sets=4, recommended_reps="6-8", day_number=3, order=2),
                TemplateExerciseCreate(name="Weighted Pull-ups", recommended_sets=3, recommended_reps="6-10", day_number=3, order=3),
                TemplateExerciseCreate(name="Barbell Curls", recommended_sets=3, recommended_reps="8-10", day_number=3, order=4),
                # Legs Day
                TemplateExerciseCreate(name="Squats", recommended_sets=4, recommended_reps="6-8", day_number=5, order=1),
                TemplateExerciseCreate(name="Romanian Deadlifts", recommended_sets=3, recommended_reps="8-10", day_number=5, order=2),
                TemplateExerciseCreate(name="Leg Press", recommended_sets=3, recommended_reps="8-12", day_number=5, order=3),
                TemplateExerciseCreate(name="Leg Curls", recommended_sets=3, recommended_reps="10-12", day_number=5, order=4),
            ],
        )
        create_workout_template(db, ppl_template)

        # Bro Split
        bro_split = WorkoutTemplateCreate(
            name="Bro Split (5-Day)",
            description="Classic bodybuilding split with one muscle group per day",
            category="Bro Split",
            duration_days=5,
            exercises=[
                # Chest
                TemplateExerciseCreate(name="Barbell Bench Press", recommended_sets=4, recommended_reps="8-10", day_number=1, order=1),
                TemplateExerciseCreate(name="Incline Dumbbell Press", recommended_sets=3, recommended_reps="8-10", day_number=1, order=2),
                TemplateExerciseCreate(name="Machine Flyes", recommended_sets=3, recommended_reps="10-12", day_number=1, order=3),
                # Back
                TemplateExerciseCreate(name="Barbell Rows", recommended_sets=4, recommended_reps="8-10", day_number=2, order=1),
                TemplateExerciseCreate(name="Lat Pulldowns", recommended_sets=3, recommended_reps="8-10", day_number=2, order=2),
                TemplateExerciseCreate(name="Seated Rows", recommended_sets=3, recommended_reps="10-12", day_number=2, order=3),
                # Shoulders
                TemplateExerciseCreate(name="Overhead Press", recommended_sets=4, recommended_reps="8-10", day_number=3, order=1),
                TemplateExerciseCreate(name="Lateral Raises", recommended_sets=3, recommended_reps="10-15", day_number=3, order=2),
                TemplateExerciseCreate(name="Rear Delt Flyes", recommended_sets=3, recommended_reps="12-15", day_number=3, order=3),
                # Arms
                TemplateExerciseCreate(name="Barbell Curls", recommended_sets=3, recommended_reps="8-10", day_number=4, order=1),
                TemplateExerciseCreate(name="Skull Crushers", recommended_sets=3, recommended_reps="8-10", day_number=4, order=2),
                TemplateExerciseCreate(name="Preacher Curls", recommended_sets=3, recommended_reps="10-12", day_number=4, order=3),
                # Legs
                TemplateExerciseCreate(name="Squats", recommended_sets=4, recommended_reps="8-10", day_number=5, order=1),
                TemplateExerciseCreate(name="Leg Press", recommended_sets=3, recommended_reps="8-10", day_number=5, order=2),
                TemplateExerciseCreate(name="Leg Curls", recommended_sets=3, recommended_reps="10-12", day_number=5, order=3),
            ],
        )
        create_workout_template(db, bro_split)

        # Upper/Lower Split
        ul_split = WorkoutTemplateCreate(
            name="Upper/Lower Split",
            description="4-day split alternating between upper and lower body workouts",
            category="Upper/Lower",
            duration_days=4,
            exercises=[
                # Upper A
                TemplateExerciseCreate(name="Barbell Bench Press", recommended_sets=4, recommended_reps="6-8", day_number=1, order=1),
                TemplateExerciseCreate(name="Barbell Rows", recommended_sets=4, recommended_reps="6-8", day_number=1, order=2),
                TemplateExerciseCreate(name="Overhead Press", recommended_sets=3, recommended_reps="8-10", day_number=1, order=3),
                # Lower A
                TemplateExerciseCreate(name="Squats", recommended_sets=4, recommended_reps="6-8", day_number=2, order=1),
                TemplateExerciseCreate(name="Romanian Deadlifts", recommended_sets=3, recommended_reps="8-10", day_number=2, order=2),
                TemplateExerciseCreate(name="Leg Press", recommended_sets=3, recommended_reps="8-10", day_number=2, order=3),
                # Upper B
                TemplateExerciseCreate(name="Incline Dumbbell Press", recommended_sets=3, recommended_reps="8-10", day_number=3, order=1),
                TemplateExerciseCreate(name="Weighted Pull-ups", recommended_sets=3, recommended_reps="6-10", day_number=3, order=2),
                TemplateExerciseCreate(name="Lateral Raises", recommended_sets=3, recommended_reps="10-15", day_number=3, order=3),
                # Lower B
                TemplateExerciseCreate(name="Deadlifts", recommended_sets=4, recommended_reps="5-6", day_number=4, order=1),
                TemplateExerciseCreate(name="Leg Curls", recommended_sets=3, recommended_reps="10-12", day_number=4, order=2),
                TemplateExerciseCreate(name="Leg Extensions", recommended_sets=3, recommended_reps="12-15", day_number=4, order=3),
            ],
        )
        create_workout_template(db, ul_split)

    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_templates()
    yield


app = FastAPI(
    title="Gym Workout Tracker API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_frontend_urls(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(workouts.router, prefix="/api/workouts", tags=["workouts"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(templates.router, prefix="/api", tags=["templates"])


@app.get("/api/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
