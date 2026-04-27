from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.routes import auth, progress, workouts, templates, body_weight
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

        # 1. Bro Split (5-Day) — Mon Chest, Tue Back, Wed Shoulders, Thu Legs, Fri Arms
        bro_split = WorkoutTemplateCreate(
            name="Professional Bro Split",
            description="One muscle group per day. Mon: Chest · Tue: Back · Wed: Shoulders · Thu: Legs · Fri: Arms",
            category="Bro Split",
            duration_days=5,
            exercises=[
                # Day 1: Chest
                TemplateExerciseCreate(name="Flat Bench Press", recommended_sets=4, recommended_reps="8-10", day_number=1, order=1),
                TemplateExerciseCreate(name="Incline DB Press", recommended_sets=3, recommended_reps="10-12", day_number=1, order=2),
                TemplateExerciseCreate(name="Cable Flyes", recommended_sets=3, recommended_reps="12-15", day_number=1, order=3),
                TemplateExerciseCreate(name="Chest Dips", recommended_sets=3, recommended_reps="8-12", day_number=1, order=4),
                # Day 2: Back
                TemplateExerciseCreate(name="Deadlifts", recommended_sets=4, recommended_reps="5-8", day_number=2, order=1),
                TemplateExerciseCreate(name="Bent Over Rows", recommended_sets=4, recommended_reps="8-10", day_number=2, order=2),
                TemplateExerciseCreate(name="Pull-ups", recommended_sets=3, recommended_reps="8-10", day_number=2, order=3),
                TemplateExerciseCreate(name="Lat Pulldowns", recommended_sets=3, recommended_reps="10-12", day_number=2, order=4),
                # Day 3: Shoulders
                TemplateExerciseCreate(name="Overhead Press", recommended_sets=4, recommended_reps="8-10", day_number=3, order=1),
                TemplateExerciseCreate(name="Lateral Raises", recommended_sets=4, recommended_reps="12-15", day_number=3, order=2),
                TemplateExerciseCreate(name="Rear Delt Flyes", recommended_sets=3, recommended_reps="12-15", day_number=3, order=3),
                TemplateExerciseCreate(name="Face Pulls", recommended_sets=3, recommended_reps="12-15", day_number=3, order=4),
                # Day 4: Legs
                TemplateExerciseCreate(name="Barbell Squats", recommended_sets=4, recommended_reps="6-8", day_number=4, order=1),
                TemplateExerciseCreate(name="Romanian Deadlifts", recommended_sets=3, recommended_reps="8-10", day_number=4, order=2),
                TemplateExerciseCreate(name="Leg Press", recommended_sets=3, recommended_reps="10-12", day_number=4, order=3),
                TemplateExerciseCreate(name="Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=4, order=4),
                # Day 5: Arms (Biceps & Triceps)
                TemplateExerciseCreate(name="Barbell Curls", recommended_sets=3, recommended_reps="10-12", day_number=5, order=1),
                TemplateExerciseCreate(name="Hammer Curls", recommended_sets=3, recommended_reps="12-15", day_number=5, order=2),
                TemplateExerciseCreate(name="Skull Crushers", recommended_sets=3, recommended_reps="10-12", day_number=5, order=3),
                TemplateExerciseCreate(name="Tricep Pushdowns", recommended_sets=3, recommended_reps="12-15", day_number=5, order=4),
            ],
        )
        create_workout_template(db, bro_split)

        # 2. Push/Pull/Legs (6-Day) — PPL × 2 then rest
        ppl_template = WorkoutTemplateCreate(
            name="Elite Push/Pull/Legs",
            description="Day 1: Push · Day 2: Pull · Day 3: Legs · Day 4: Push · Day 5: Pull · Day 6: Legs",
            category="Push/Pull/Legs",
            duration_days=6,
            exercises=[
                # Day 1: Push (Chest, Shoulders, Triceps)
                TemplateExerciseCreate(name="Bench Press", recommended_sets=4, recommended_reps="8-10", day_number=1, order=1),
                TemplateExerciseCreate(name="Incline DB Press", recommended_sets=3, recommended_reps="10-12", day_number=1, order=2),
                TemplateExerciseCreate(name="Overhead Press", recommended_sets=3, recommended_reps="8-10", day_number=1, order=3),
                TemplateExerciseCreate(name="Tricep Pushdowns", recommended_sets=3, recommended_reps="12-15", day_number=1, order=4),
                # Day 2: Pull (Back, Biceps, Rear Delts, Traps)
                TemplateExerciseCreate(name="Pull-ups", recommended_sets=3, recommended_reps="8-10", day_number=2, order=1),
                TemplateExerciseCreate(name="Barbell Rows", recommended_sets=4, recommended_reps="8-10", day_number=2, order=2),
                TemplateExerciseCreate(name="Lat Pulldowns", recommended_sets=3, recommended_reps="10-12", day_number=2, order=3),
                TemplateExerciseCreate(name="Bicep Curls", recommended_sets=3, recommended_reps="10-12", day_number=2, order=4),
                # Day 3: Legs (Quads, Hamstrings, Glutes, Calves)
                TemplateExerciseCreate(name="Squats", recommended_sets=4, recommended_reps="6-8", day_number=3, order=1),
                TemplateExerciseCreate(name="Romanian Deadlifts", recommended_sets=3, recommended_reps="8-10", day_number=3, order=2),
                TemplateExerciseCreate(name="Leg Press", recommended_sets=3, recommended_reps="10-12", day_number=3, order=3),
                TemplateExerciseCreate(name="Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=3, order=4),
                # Day 4: Push (Chest, Shoulders, Triceps)
                TemplateExerciseCreate(name="Incline DB Press", recommended_sets=4, recommended_reps="10-12", day_number=4, order=1),
                TemplateExerciseCreate(name="Shoulder Press", recommended_sets=3, recommended_reps="8-10", day_number=4, order=2),
                TemplateExerciseCreate(name="Lateral Raises", recommended_sets=3, recommended_reps="12-15", day_number=4, order=3),
                TemplateExerciseCreate(name="Skull Crushers", recommended_sets=3, recommended_reps="10-12", day_number=4, order=4),
                # Day 5: Pull (Back, Biceps, Rear Delts, Traps)
                TemplateExerciseCreate(name="Deadlifts", recommended_sets=3, recommended_reps="5-8", day_number=5, order=1),
                TemplateExerciseCreate(name="Seated Rows", recommended_sets=3, recommended_reps="10-12", day_number=5, order=2),
                TemplateExerciseCreate(name="Face Pulls", recommended_sets=3, recommended_reps="12-15", day_number=5, order=3),
                TemplateExerciseCreate(name="Hammer Curls", recommended_sets=3, recommended_reps="10-12", day_number=5, order=4),
                # Day 6: Legs (Quads, Hamstrings, Glutes, Calves)
                TemplateExerciseCreate(name="Leg Press", recommended_sets=4, recommended_reps="10-12", day_number=6, order=1),
                TemplateExerciseCreate(name="Leg Curls", recommended_sets=3, recommended_reps="12-15", day_number=6, order=2),
                TemplateExerciseCreate(name="Leg Extensions", recommended_sets=3, recommended_reps="12-15", day_number=6, order=3),
                TemplateExerciseCreate(name="Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=6, order=4),
            ],
        )
        create_workout_template(db, ppl_template)

        # 3. Upper/Lower (4-Day) — Mon Upper, Tue Lower, Wed Rest, Thu Upper, Fri Lower
        ul_split = WorkoutTemplateCreate(
            name="Hypertrophy Upper/Lower",
            description="Day 1: Upper · Day 2: Lower · Day 3: Rest · Day 4: Upper · Day 5: Lower",
            category="Upper/Lower",
            duration_days=5,
            exercises=[
                # Day 1: Upper Body
                TemplateExerciseCreate(name="Bench Press", recommended_sets=4, recommended_reps="8-10", day_number=1, order=1),
                TemplateExerciseCreate(name="Barbell Rows", recommended_sets=4, recommended_reps="8-10", day_number=1, order=2),
                TemplateExerciseCreate(name="Overhead Press", recommended_sets=3, recommended_reps="8-10", day_number=1, order=3),
                TemplateExerciseCreate(name="Lat Pulldowns", recommended_sets=3, recommended_reps="10-12", day_number=1, order=4),
                TemplateExerciseCreate(name="Bicep Curls", recommended_sets=3, recommended_reps="10-12", day_number=1, order=5),
                TemplateExerciseCreate(name="Tricep Pushdowns", recommended_sets=3, recommended_reps="12-15", day_number=1, order=6),
                # Day 2: Lower Body
                TemplateExerciseCreate(name="Squats", recommended_sets=4, recommended_reps="6-8", day_number=2, order=1),
                TemplateExerciseCreate(name="Romanian Deadlifts", recommended_sets=3, recommended_reps="8-10", day_number=2, order=2),
                TemplateExerciseCreate(name="Leg Press", recommended_sets=3, recommended_reps="10-12", day_number=2, order=3),
                TemplateExerciseCreate(name="Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=2, order=4),
                # Day 4: Upper Body
                TemplateExerciseCreate(name="Pull-ups", recommended_sets=3, recommended_reps="8-10", day_number=4, order=1),
                TemplateExerciseCreate(name="Incline DB Press", recommended_sets=3, recommended_reps="10-12", day_number=4, order=2),
                TemplateExerciseCreate(name="Seated Rows", recommended_sets=3, recommended_reps="10-12", day_number=4, order=3),
                TemplateExerciseCreate(name="Lateral Raises", recommended_sets=3, recommended_reps="12-15", day_number=4, order=4),
                TemplateExerciseCreate(name="Hammer Curls", recommended_sets=3, recommended_reps="10-12", day_number=4, order=5),
                TemplateExerciseCreate(name="Skull Crushers", recommended_sets=3, recommended_reps="10-12", day_number=4, order=6),
                # Day 5: Lower Body
                TemplateExerciseCreate(name="Deadlifts", recommended_sets=3, recommended_reps="5-8", day_number=5, order=1),
                TemplateExerciseCreate(name="Leg Press", recommended_sets=4, recommended_reps="10-12", day_number=5, order=2),
                TemplateExerciseCreate(name="Leg Curls", recommended_sets=3, recommended_reps="12-15", day_number=5, order=3),
                TemplateExerciseCreate(name="Leg Extensions", recommended_sets=3, recommended_reps="12-15", day_number=5, order=4),
                TemplateExerciseCreate(name="Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=5, order=5),
            ],
        )
        create_workout_template(db, ul_split)

    finally:
        db.close()


def run_migrations():
    """Apply any schema changes that create_all won't handle (ALTER TABLE)."""
    with engine.connect() as conn:
        from sqlalchemy import text
        # Detect dialect
        dialect = engine.dialect.name  # 'postgresql' or 'sqlite'

        # ── Add set_type to set_entries ──────────────────────────────
        if dialect == "postgresql":
            conn.execute(text("""
                ALTER TABLE set_entries
                ADD COLUMN IF NOT EXISTS set_type VARCHAR(20) NOT NULL DEFAULT 'normal';
            """))
        else:  # sqlite doesn't support IF NOT EXISTS on ADD COLUMN
            try:
                conn.execute(text("ALTER TABLE set_entries ADD COLUMN set_type VARCHAR(20) NOT NULL DEFAULT 'normal';"))
            except Exception:
                pass  # column already exists

        conn.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    run_migrations()
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
app.include_router(body_weight.router, prefix="/api/body-weight", tags=["body-weight"])


@app.get("/api/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
