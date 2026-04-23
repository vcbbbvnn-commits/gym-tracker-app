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

        # 1. Bro Split (6-Day Active + 1 Day OFF)
        # Matches user image: Mon: Shoulders, Tue: Chest, Wed: Triceps, Thu: Back, Fri: Biceps, Sat: Legs, Sun: OFF
        bro_split = WorkoutTemplateCreate(
            name="Professional Bro Split",
            description="A classic 7-day schedule targeting one major muscle group per day for maximum hypertrophy.",
            category="Bro Split",
            duration_days=7,
            exercises=[
                # Day 1: Monday - SHOULDERS
                TemplateExerciseCreate(name="Seated Dumbbell Press", recommended_sets=4, recommended_reps="8-10", day_number=1, order=1),
                TemplateExerciseCreate(name="Overhead Barbell Press", recommended_sets=3, recommended_reps="8-10", day_number=1, order=2),
                TemplateExerciseCreate(name="Dumbbell Lateral Raises", recommended_sets=4, recommended_reps="12-15", day_number=1, order=3),
                TemplateExerciseCreate(name="Front Raises", recommended_sets=3, recommended_reps="10-12", day_number=1, order=4),
                TemplateExerciseCreate(name="Rear Delt Flyes", recommended_sets=3, recommended_reps="12-15", day_number=1, order=5),
                TemplateExerciseCreate(name="Dumbbell Shrugs", recommended_sets=4, recommended_reps="12-15", day_number=1, order=6),

                # Day 2: Tuesday - CHEST
                TemplateExerciseCreate(name="Flat Barbell Bench Press", recommended_sets=4, recommended_reps="6-8", day_number=2, order=1),
                TemplateExerciseCreate(name="Incline Dumbbell Press", recommended_sets=4, recommended_reps="8-10", day_number=2, order=2),
                TemplateExerciseCreate(name="Decline Press", recommended_sets=3, recommended_reps="8-12", day_number=2, order=3),
                TemplateExerciseCreate(name="Pec Deck Flyes", recommended_sets=3, recommended_reps="10-15", day_number=2, order=4),
                TemplateExerciseCreate(name="Cable Crossovers", recommended_sets=3, recommended_reps="12-15", day_number=2, order=5),

                # Day 3: Wednesday - TRICEPS
                TemplateExerciseCreate(name="Close-Grip Bench Press", recommended_sets=3, recommended_reps="8-10", day_number=3, order=1),
                TemplateExerciseCreate(name="Skull Crushers", recommended_sets=3, recommended_reps="10-12", day_number=3, order=2),
                TemplateExerciseCreate(name="Tricep Pushdowns", recommended_sets=4, recommended_reps="12-15", day_number=3, order=3),
                TemplateExerciseCreate(name="Overhead Extension", recommended_sets=3, recommended_reps="10-12", day_number=3, order=4),
                TemplateExerciseCreate(name="Tricep Dips", recommended_sets=3, recommended_reps="10-15", day_number=3, order=5),

                # Day 4: Thursday - BACK (Updated for "Exact Back Workout")
                TemplateExerciseCreate(name="Deadlifts", recommended_sets=4, recommended_reps="5-8", day_number=4, order=1),
                TemplateExerciseCreate(name="Wide-Grip Pull-ups", recommended_sets=3, recommended_reps="8-12", day_number=4, order=2),
                TemplateExerciseCreate(name="Bent Over Barbell Rows", recommended_sets=4, recommended_reps="8-10", day_number=4, order=3),
                TemplateExerciseCreate(name="T-Bar Rows", recommended_sets=3, recommended_reps="8-10", day_number=4, order=4),
                TemplateExerciseCreate(name="Lat Pulldowns", recommended_sets=3, recommended_reps="10-12", day_number=4, order=5),
                TemplateExerciseCreate(name="Seated Cable Rows", recommended_sets=3, recommended_reps="10-12", day_number=4, order=6),

                # Day 5: Friday - BICEPS
                TemplateExerciseCreate(name="Barbell Curls", recommended_sets=4, recommended_reps="8-10", day_number=5, order=1),
                TemplateExerciseCreate(name="Hammer Curls", recommended_sets=4, recommended_reps="10-12", day_number=5, order=2),
                TemplateExerciseCreate(name="Preacher Curls", recommended_sets=3, recommended_reps="10-12", day_number=5, order=3),
                TemplateExerciseCreate(name="Concentration Curls", recommended_sets=3, recommended_reps="12-15", day_number=5, order=4),
                TemplateExerciseCreate(name="Cable Curls", recommended_sets=3, recommended_reps="12-15", day_number=5, order=5),

                # Day 6: Saturday - LEGS
                TemplateExerciseCreate(name="Barbell Squats", recommended_sets=4, recommended_reps="6-8", day_number=6, order=1),
                TemplateExerciseCreate(name="Leg Press", recommended_sets=4, recommended_reps="10-12", day_number=6, order=2),
                TemplateExerciseCreate(name="Romanian Deadlifts", recommended_sets=3, recommended_reps="8-10", day_number=6, order=3),
                TemplateExerciseCreate(name="Leg Extensions", recommended_sets=3, recommended_reps="12-15", day_number=6, order=4),
                TemplateExerciseCreate(name="Leg Curls", recommended_sets=3, recommended_reps="12-15", day_number=6, order=5),
                TemplateExerciseCreate(name="Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=6, order=6),
            ],
        )
        create_workout_template(db, bro_split)

        # 2. Push/Pull/Legs (6-Day Active + 1 Day OFF)
        ppl_template = WorkoutTemplateCreate(
            name="Elite Push/Pull/Legs",
            description="The most effective split for intermediate/advanced lifters. High frequency with recovery days.",
            category="Push/Pull/Legs",
            duration_days=7,
            exercises=[
                # Day 1: Push A
                TemplateExerciseCreate(name="Bench Press", recommended_sets=4, recommended_reps="5-8", day_number=1, order=1),
                TemplateExerciseCreate(name="Overhead Press", recommended_sets=3, recommended_reps="8-10", day_number=1, order=2),
                TemplateExerciseCreate(name="Lateral Raises", recommended_sets=4, recommended_reps="12-15", day_number=1, order=3),
                TemplateExerciseCreate(name="Tricep Dips", recommended_sets=3, recommended_reps="10-12", day_number=1, order=4),
                # Day 2: Pull A
                TemplateExerciseCreate(name="Deadlifts", recommended_sets=3, recommended_reps="5-8", day_number=2, order=1),
                TemplateExerciseCreate(name="Lat Pulldowns", recommended_sets=3, recommended_reps="8-12", day_number=2, order=2),
                TemplateExerciseCreate(name="Face Pulls", recommended_sets=3, recommended_reps="12-15", day_number=2, order=3),
                TemplateExerciseCreate(name="Bicep Curls", recommended_sets=3, recommended_reps="10-12", day_number=2, order=4),
                # Day 3: Legs A
                TemplateExerciseCreate(name="Squats", recommended_sets=4, recommended_reps="5-8", day_number=3, order=1),
                TemplateExerciseCreate(name="Leg Press", recommended_sets=3, recommended_reps="10-12", day_number=3, order=2),
                TemplateExerciseCreate(name="Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=3, order=3),
                # Day 4: Push B
                TemplateExerciseCreate(name="Incline DB Press", recommended_sets=4, recommended_reps="8-10", day_number=4, order=1),
                TemplateExerciseCreate(name="Seated DB Press", recommended_sets=3, recommended_reps="8-10", day_number=4, order=2),
                TemplateExerciseCreate(name="Skull Crushers", recommended_sets=3, recommended_reps="10-12", day_number=4, order=3),
                # Day 5: Pull B
                TemplateExerciseCreate(name="Pull-ups", recommended_sets=3, recommended_reps="8-12", day_number=5, order=1),
                TemplateExerciseCreate(name="Cable Rows", recommended_sets=3, recommended_reps="10-12", day_number=5, order=2),
                TemplateExerciseCreate(name="Hammer Curls", recommended_sets=3, recommended_reps="10-12", day_number=5, order=3),
                # Day 6: Legs B
                TemplateExerciseCreate(name="Romanian Deadlifts", recommended_sets=4, recommended_reps="8-10", day_number=6, order=1),
                TemplateExerciseCreate(name="Leg Curls", recommended_sets=3, recommended_reps="12-15", day_number=6, order=2),
                TemplateExerciseCreate(name="Hack Squats", recommended_sets=3, recommended_reps="10-12", day_number=6, order=3),
            ],
        )
        create_workout_template(db, ppl_template)

        # 3. Upper/Lower Split (4-Day Active + 3 Days OFF)
        # Pattern: Mon: Upper A, Tue: Lower A, Wed: OFF, Thu: Upper B, Fri: Lower B, Sat: OFF, Sun: OFF
        ul_split = WorkoutTemplateCreate(
            name="Hypertrophy Upper/Lower",
            description="Perfect for those who can only train 4 days a week but want maximum results.",
            category="Upper/Lower",
            duration_days=7,
            exercises=[
                # Day 1: Upper A
                TemplateExerciseCreate(name="Barbell Bench Press", recommended_sets=4, recommended_reps="5-8", day_number=1, order=1),
                TemplateExerciseCreate(name="Barbell Rows", recommended_sets=4, recommended_reps="6-8", day_number=1, order=2),
                TemplateExerciseCreate(name="Lateral Raises", recommended_sets=3, recommended_reps="12-15", day_number=1, order=3),
                # Day 2: Lower A
                TemplateExerciseCreate(name="Squats", recommended_sets=4, recommended_reps="5-8", day_number=2, order=1),
                TemplateExerciseCreate(name="Leg Extensions", recommended_sets=3, recommended_reps="12-15", day_number=2, order=2),
                TemplateExerciseCreate(name="Leg Curls", recommended_sets=3, recommended_reps="12-15", day_number=2, order=3),
                # Day 4: Upper B (Thursday)
                TemplateExerciseCreate(name="Incline DB Press", recommended_sets=4, recommended_reps="8-10", day_number=4, order=1),
                TemplateExerciseCreate(name="Lat Pulldowns", recommended_sets=3, recommended_reps="8-12", day_number=4, order=2),
                TemplateExerciseCreate(name="Overhead Press", recommended_sets=3, recommended_reps="8-10", day_number=4, order=3),
                # Day 5: Lower B (Friday)
                TemplateExerciseCreate(name="Romanian Deadlifts", recommended_sets=4, recommended_reps="8-10", day_number=5, order=1),
                TemplateExerciseCreate(name="Leg Press", recommended_sets=3, recommended_reps="10-12", day_number=5, order=2),
                TemplateExerciseCreate(name="Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=5, order=3),
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

