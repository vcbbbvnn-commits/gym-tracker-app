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
        from app.models.template import WorkoutTemplate
        # Remove existing presets so the new updated lists take effect
        db.query(WorkoutTemplate).filter(WorkoutTemplate.is_preset == True).delete()
        db.commit()

        # 1. Bro Split (5-Day)
        bro_split = WorkoutTemplateCreate(
            name="Professional Bro Split",
            description="Focus on one muscle group per day: Chest, Back, Shoulders, Legs, Arms (Biceps & Triceps).",
            category="Bro Split",
            duration_days=7,
            exercises=[
                # Day 1: Chest
                TemplateExerciseCreate(name="Flat Bench Press", recommended_sets=4, recommended_reps="8-10", day_number=1, order=1),
                TemplateExerciseCreate(name="Incline DB Press", recommended_sets=3, recommended_reps="10-12", day_number=1, order=2),
                TemplateExerciseCreate(name="Cable Flyes", recommended_sets=3, recommended_reps="12-15", day_number=1, order=3),
                # Day 2: Back
                TemplateExerciseCreate(name="Deadlifts", recommended_sets=4, recommended_reps="5-8", day_number=2, order=1),
                TemplateExerciseCreate(name="Bent Over Rows", recommended_sets=4, recommended_reps="8-10", day_number=2, order=2),
                TemplateExerciseCreate(name="Lat Pulldowns", recommended_sets=3, recommended_reps="10-12", day_number=2, order=3),
                # Day 3: Shoulders
                TemplateExerciseCreate(name="Overhead Press", recommended_sets=4, recommended_reps="8-10", day_number=3, order=1),
                TemplateExerciseCreate(name="Lateral Raises", recommended_sets=4, recommended_reps="12-15", day_number=3, order=2),
                TemplateExerciseCreate(name="Front Raises", recommended_sets=3, recommended_reps="12-15", day_number=3, order=3),
                # Day 4: Legs
                TemplateExerciseCreate(name="Barbell Squats", recommended_sets=4, recommended_reps="6-8", day_number=4, order=1),
                TemplateExerciseCreate(name="Leg Press", recommended_sets=3, recommended_reps="10-12", day_number=4, order=2),
                TemplateExerciseCreate(name="Leg Curls", recommended_sets=3, recommended_reps="12-15", day_number=4, order=3),
                TemplateExerciseCreate(name="Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=4, order=4),
                # Day 5: Arms (Biceps & Triceps)
                TemplateExerciseCreate(name="Barbell Curls", recommended_sets=3, recommended_reps="10-12", day_number=5, order=1),
                TemplateExerciseCreate(name="Skull Crushers", recommended_sets=3, recommended_reps="10-12", day_number=5, order=2),
                TemplateExerciseCreate(name="Hammer Curls", recommended_sets=3, recommended_reps="12-15", day_number=5, order=3),
                TemplateExerciseCreate(name="Tricep Pushdowns", recommended_sets=3, recommended_reps="12-15", day_number=5, order=4),
            ],
        )
        create_workout_template(db, bro_split)

        # 2. Push/Pull/Legs (6-Day Cycle)
        ppl_template = WorkoutTemplateCreate(
            name="Elite Push/Pull/Legs",
            description="Push (Chest/Sh/Tr), Pull (Back/Bi/Rear Delts/Traps), Legs (Quads/Ham/Glute/Calf).",
            category="Push/Pull/Legs",
            duration_days=7,
            exercises=[
                # Day 1: Push (Chest, Shoulders, Triceps)
                TemplateExerciseCreate(name="Bench Press", recommended_sets=4, recommended_reps="8-10", day_number=1, order=1),
                TemplateExerciseCreate(name="Overhead Press", recommended_sets=3, recommended_reps="8-10", day_number=1, order=2),
                TemplateExerciseCreate(name="Tricep Pushdowns", recommended_sets=3, recommended_reps="12-15", day_number=1, order=3),
                # Day 2: Pull (Back, Biceps, Rear Delts, Traps)
                TemplateExerciseCreate(name="Barbell Rows", recommended_sets=4, recommended_reps="8-10", day_number=2, order=1),
                TemplateExerciseCreate(name="Bicep Curls", recommended_sets=3, recommended_reps="10-12", day_number=2, order=2),
                TemplateExerciseCreate(name="Rear Delt Flyes", recommended_sets=3, recommended_reps="12-15", day_number=2, order=3),
                TemplateExerciseCreate(name="Shrugs", recommended_sets=3, recommended_reps="12-15", day_number=2, order=4),
                # Day 3: Legs (Quads, Hamstrings, Glutes, Calves)
                TemplateExerciseCreate(name="Squats", recommended_sets=4, recommended_reps="6-8", day_number=3, order=1),
                TemplateExerciseCreate(name="Leg Extensions", recommended_sets=3, recommended_reps="12-15", day_number=3, order=2),
                TemplateExerciseCreate(name="Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=3, order=3),
                # Day 4: Push (Chest, Shoulders, Triceps)
                TemplateExerciseCreate(name="Incline DB Press", recommended_sets=4, recommended_reps="10-12", day_number=4, order=1),
                TemplateExerciseCreate(name="Lateral Raises", recommended_sets=3, recommended_reps="12-15", day_number=4, order=2),
                TemplateExerciseCreate(name="Skull Crushers", recommended_sets=3, recommended_reps="10-12", day_number=4, order=3),
                # Day 5: Pull (Back, Biceps, Rear Delts, Traps)
                TemplateExerciseCreate(name="Pull-ups", recommended_sets=3, recommended_reps="8-10", day_number=5, order=1),
                TemplateExerciseCreate(name="Seated Rows", recommended_sets=3, recommended_reps="10-12", day_number=5, order=2),
                TemplateExerciseCreate(name="Hammer Curls", recommended_sets=3, recommended_reps="10-12", day_number=5, order=3),
                # Day 6: Legs (Quads, Hamstrings, Glutes, Calves)
                TemplateExerciseCreate(name="Leg Press", recommended_sets=4, recommended_reps="10-12", day_number=6, order=1),
                TemplateExerciseCreate(name="Leg Curls", recommended_sets=3, recommended_reps="12-15", day_number=6, order=2),
                TemplateExerciseCreate(name="Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=6, order=3),
            ],
        )
        create_workout_template(db, ppl_template)

        # 3. Upper/Lower Split
        ul_split = WorkoutTemplateCreate(
            name="Hypertrophy Upper/Lower",
            description="Upper Body Days (Chest/Back/Shoulders/Arms), Lower Body Days (Quads/Hamstrings/Glutes/Calves).",
            category="Upper/Lower",
            duration_days=7,
            exercises=[
                # Day 1: Upper Body
                TemplateExerciseCreate(name="Bench Press", recommended_sets=4, recommended_reps="8-10", day_number=1, order=1),
                TemplateExerciseCreate(name="Barbell Rows", recommended_sets=4, recommended_reps="8-10", day_number=1, order=2),
                TemplateExerciseCreate(name="Overhead Press", recommended_sets=3, recommended_reps="8-10", day_number=1, order=3),
                TemplateExerciseCreate(name="Bicep Curls", recommended_sets=3, recommended_reps="10-12", day_number=1, order=4),
                # Day 2: Lower Body
                TemplateExerciseCreate(name="Squats", recommended_sets=4, recommended_reps="6-8", day_number=2, order=1),
                TemplateExerciseCreate(name="Romanian Deadlifts", recommended_sets=3, recommended_reps="8-10", day_number=2, order=2),
                TemplateExerciseCreate(name="Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=2, order=3),
                # Day 4: Upper Body
                TemplateExerciseCreate(name="Lat Pulldowns", recommended_sets=4, recommended_reps="10-12", day_number=4, order=1),
                TemplateExerciseCreate(name="Incline DB Press", recommended_sets=3, recommended_reps="10-12", day_number=4, order=2),
                TemplateExerciseCreate(name="Tricep Pushdowns", recommended_sets=3, recommended_reps="12-15", day_number=4, order=3),
                # Day 5: Lower Body
                TemplateExerciseCreate(name="Leg Press", recommended_sets=4, recommended_reps="10-12", day_number=5, order=1),
                TemplateExerciseCreate(name="Leg Extensions", recommended_sets=3, recommended_reps="12-15", day_number=5, order=2),
                TemplateExerciseCreate(name="Leg Curls", recommended_sets=3, recommended_reps="12-15", day_number=5, order=3),
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

