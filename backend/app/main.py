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

        # Push/Pull/Legs Split
        ppl_template = WorkoutTemplateCreate(
            name="Push/Pull/Legs Split (6-Day)",
            description="Classic 6-day split. Day 1/4: Push (Chest/Shoulders/Triceps). Day 2/5: Pull (Back/Biceps). Day 3/6: Legs.",
            category="Push/Pull/Legs",
            duration_days=6,
            exercises=[
                # Day 1: Push
                TemplateExerciseCreate(name="Barbell Bench Press", recommended_sets=4, recommended_reps="5-8", day_number=1, order=1),
                TemplateExerciseCreate(name="Incline Dumbbell Press", recommended_sets=3, recommended_reps="8-10", day_number=1, order=2),
                TemplateExerciseCreate(name="Overhead Press", recommended_sets=3, recommended_reps="8-10", day_number=1, order=3),
                TemplateExerciseCreate(name="Lateral Raises", recommended_sets=4, recommended_reps="12-15", day_number=1, order=4),
                TemplateExerciseCreate(name="Tricep Pushdowns", recommended_sets=3, recommended_reps="10-12", day_number=1, order=5),
                TemplateExerciseCreate(name="Overhead Tricep Extensions", recommended_sets=3, recommended_reps="10-12", day_number=1, order=6),
                
                # Day 2: Pull
                TemplateExerciseCreate(name="Deadlifts", recommended_sets=3, recommended_reps="5-8", day_number=2, order=1),
                TemplateExerciseCreate(name="Lat Pulldowns", recommended_sets=3, recommended_reps="8-12", day_number=2, order=2),
                TemplateExerciseCreate(name="Barbell Rows", recommended_sets=3, recommended_reps="8-10", day_number=2, order=3),
                TemplateExerciseCreate(name="Face Pulls", recommended_sets=3, recommended_reps="12-15", day_number=2, order=4),
                TemplateExerciseCreate(name="Barbell Bicep Curls", recommended_sets=3, recommended_reps="10-12", day_number=2, order=5),
                TemplateExerciseCreate(name="Hammer Curls", recommended_sets=3, recommended_reps="10-12", day_number=2, order=6),

                # Day 3: Legs
                TemplateExerciseCreate(name="Barbell Squats", recommended_sets=4, recommended_reps="5-8", day_number=3, order=1),
                TemplateExerciseCreate(name="Leg Press", recommended_sets=3, recommended_reps="10-12", day_number=3, order=2),
                TemplateExerciseCreate(name="Leg Extensions", recommended_sets=3, recommended_reps="12-15", day_number=3, order=3),
                TemplateExerciseCreate(name="Romanian Deadlifts", recommended_sets=3, recommended_reps="8-10", day_number=3, order=4),
                TemplateExerciseCreate(name="Lying Leg Curls", recommended_sets=3, recommended_reps="12-15", day_number=3, order=5),
                TemplateExerciseCreate(name="Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=3, order=6),

                # Day 4: Push B
                TemplateExerciseCreate(name="Dumbbell Bench Press", recommended_sets=4, recommended_reps="8-10", day_number=4, order=1),
                TemplateExerciseCreate(name="Incline Barbell Press", recommended_sets=3, recommended_reps="8-10", day_number=4, order=2),
                TemplateExerciseCreate(name="Seated Dumbbell Press", recommended_sets=3, recommended_reps="8-10", day_number=4, order=3),
                TemplateExerciseCreate(name="Cable Lateral Raises", recommended_sets=4, recommended_reps="12-15", day_number=4, order=4),
                TemplateExerciseCreate(name="Skull Crushers", recommended_sets=3, recommended_reps="10-12", day_number=4, order=5),
                TemplateExerciseCreate(name="Tricep Dips", recommended_sets=3, recommended_reps="8-12", day_number=4, order=6),

                # Day 5: Pull B
                TemplateExerciseCreate(name="Pull-ups", recommended_sets=3, recommended_reps="8-12", day_number=5, order=1),
                TemplateExerciseCreate(name="Seated Cable Rows", recommended_sets=3, recommended_reps="10-12", day_number=5, order=2),
                TemplateExerciseCreate(name="Single Arm Dumbbell Rows", recommended_sets=3, recommended_reps="10-12", day_number=5, order=3),
                TemplateExerciseCreate(name="Rear Delt Flyes", recommended_sets=3, recommended_reps="12-15", day_number=5, order=4),
                TemplateExerciseCreate(name="Preacher Curls", recommended_sets=3, recommended_reps="10-12", day_number=5, order=5),
                TemplateExerciseCreate(name="Reverse Curls", recommended_sets=3, recommended_reps="10-12", day_number=5, order=6),

                # Day 6: Legs B
                TemplateExerciseCreate(name="Front Squats", recommended_sets=4, recommended_reps="8-10", day_number=6, order=1),
                TemplateExerciseCreate(name="Hack Squats", recommended_sets=3, recommended_reps="10-12", day_number=6, order=2),
                TemplateExerciseCreate(name="Walking Lunges", recommended_sets=3, recommended_reps="10-12", day_number=6, order=3),
                TemplateExerciseCreate(name="Seated Leg Curls", recommended_sets=3, recommended_reps="12-15", day_number=6, order=4),
                TemplateExerciseCreate(name="Standing Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=6, order=5),
            ],
        )
        create_workout_template(db, ppl_template)

        # Bro Split
        bro_split = WorkoutTemplateCreate(
            name="Bro Split (5-Day)",
            description="Day 1: Chest, Day 2: Back, Day 3: Shoulders, Day 4: Legs, Day 5: Arms. Focuses entirely on one muscle group per day.",
            category="Bro Split",
            duration_days=5,
            exercises=[
                # Day 1: Chest
                TemplateExerciseCreate(name="Flat Barbell Bench Press", recommended_sets=4, recommended_reps="6-8", day_number=1, order=1),
                TemplateExerciseCreate(name="Incline Dumbbell Press", recommended_sets=4, recommended_reps="8-10", day_number=1, order=2),
                TemplateExerciseCreate(name="Decline Barbell Bench Press", recommended_sets=3, recommended_reps="8-12", day_number=1, order=3),
                TemplateExerciseCreate(name="Pec Deck Flyes", recommended_sets=3, recommended_reps="10-15", day_number=1, order=4),
                TemplateExerciseCreate(name="Cable Crossovers", recommended_sets=3, recommended_reps="12-15", day_number=1, order=5),
                
                # Day 2: Back
                TemplateExerciseCreate(name="Deadlifts", recommended_sets=4, recommended_reps="5-8", day_number=2, order=1),
                TemplateExerciseCreate(name="Pull-ups / Lat Pulldowns", recommended_sets=4, recommended_reps="8-12", day_number=2, order=2),
                TemplateExerciseCreate(name="Bent Over Barbell Rows", recommended_sets=3, recommended_reps="8-10", day_number=2, order=3),
                TemplateExerciseCreate(name="Seated Cable Rows", recommended_sets=3, recommended_reps="10-12", day_number=2, order=4),
                TemplateExerciseCreate(name="Single Arm Dumbbell Rows", recommended_sets=3, recommended_reps="8-12", day_number=2, order=5),
                TemplateExerciseCreate(name="Straight Arm Pulldowns", recommended_sets=3, recommended_reps="12-15", day_number=2, order=6),

                # Day 3: Shoulders
                TemplateExerciseCreate(name="Seated Dumbbell Press", recommended_sets=4, recommended_reps="8-10", day_number=3, order=1),
                TemplateExerciseCreate(name="Overhead Barbell Press", recommended_sets=3, recommended_reps="8-10", day_number=3, order=2),
                TemplateExerciseCreate(name="Dumbbell Lateral Raises", recommended_sets=4, recommended_reps="12-15", day_number=3, order=3),
                TemplateExerciseCreate(name="Cable Front Raises", recommended_sets=3, recommended_reps="10-12", day_number=3, order=4),
                TemplateExerciseCreate(name="Reverse Pec Deck (Rear Delts)", recommended_sets=3, recommended_reps="12-15", day_number=3, order=5),
                TemplateExerciseCreate(name="Dumbbell Shrugs", recommended_sets=4, recommended_reps="10-15", day_number=3, order=6),

                # Day 4: Legs
                TemplateExerciseCreate(name="Barbell Squats", recommended_sets=4, recommended_reps="6-8", day_number=4, order=1),
                TemplateExerciseCreate(name="Leg Press", recommended_sets=4, recommended_reps="10-12", day_number=4, order=2),
                TemplateExerciseCreate(name="Romanian Deadlifts", recommended_sets=3, recommended_reps="8-10", day_number=4, order=3),
                TemplateExerciseCreate(name="Leg Extensions", recommended_sets=3, recommended_reps="12-15", day_number=4, order=4),
                TemplateExerciseCreate(name="Leg Curls", recommended_sets=3, recommended_reps="12-15", day_number=4, order=5),
                TemplateExerciseCreate(name="Standing Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=4, order=6),

                # Day 5: Arms
                TemplateExerciseCreate(name="Barbell Bicep Curls", recommended_sets=4, recommended_reps="8-10", day_number=5, order=1),
                TemplateExerciseCreate(name="Tricep Pushdowns", recommended_sets=4, recommended_reps="10-12", day_number=5, order=2),
                TemplateExerciseCreate(name="Hammer Curls", recommended_sets=3, recommended_reps="10-12", day_number=5, order=3),
                TemplateExerciseCreate(name="Skull Crushers", recommended_sets=3, recommended_reps="8-10", day_number=5, order=4),
                TemplateExerciseCreate(name="Preacher Curls", recommended_sets=3, recommended_reps="10-12", day_number=5, order=5),
                TemplateExerciseCreate(name="Overhead Tricep Extensions", recommended_sets=3, recommended_reps="10-12", day_number=5, order=6),
            ],
        )
        create_workout_template(db, bro_split)

        # Upper/Lower Split
        ul_split = WorkoutTemplateCreate(
            name="Upper/Lower Split (4-Day)",
            description="Day 1: Upper A, Day 2: Lower A, Day 3: Upper B, Day 4: Lower B. Excellent for building strength and size.",
            category="Upper/Lower",
            duration_days=4,
            exercises=[
                # Day 1: Upper A
                TemplateExerciseCreate(name="Flat Barbell Bench Press", recommended_sets=4, recommended_reps="5-8", day_number=1, order=1),
                TemplateExerciseCreate(name="Barbell Rows", recommended_sets=4, recommended_reps="6-8", day_number=1, order=2),
                TemplateExerciseCreate(name="Overhead Press", recommended_sets=3, recommended_reps="8-10", day_number=1, order=3),
                TemplateExerciseCreate(name="Lat Pulldowns", recommended_sets=3, recommended_reps="8-12", day_number=1, order=4),
                TemplateExerciseCreate(name="Lateral Raises", recommended_sets=3, recommended_reps="12-15", day_number=1, order=5),
                TemplateExerciseCreate(name="Tricep Pushdowns", recommended_sets=3, recommended_reps="10-12", day_number=1, order=6),
                TemplateExerciseCreate(name="Bicep Curls", recommended_sets=3, recommended_reps="10-12", day_number=1, order=7),

                # Day 2: Lower A
                TemplateExerciseCreate(name="Barbell Squats", recommended_sets=4, recommended_reps="5-8", day_number=2, order=1),
                TemplateExerciseCreate(name="Romanian Deadlifts", recommended_sets=3, recommended_reps="8-10", day_number=2, order=2),
                TemplateExerciseCreate(name="Leg Press", recommended_sets=3, recommended_reps="10-12", day_number=2, order=3),
                TemplateExerciseCreate(name="Leg Curls", recommended_sets=3, recommended_reps="12-15", day_number=2, order=4),
                TemplateExerciseCreate(name="Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=2, order=5),

                # Day 3: Upper B
                TemplateExerciseCreate(name="Incline Dumbbell Press", recommended_sets=3, recommended_reps="8-10", day_number=3, order=1),
                TemplateExerciseCreate(name="Pull-ups", recommended_sets=3, recommended_reps="8-12", day_number=3, order=2),
                TemplateExerciseCreate(name="Seated Dumbbell Press", recommended_sets=3, recommended_reps="8-10", day_number=3, order=3),
                TemplateExerciseCreate(name="Seated Cable Rows", recommended_sets=3, recommended_reps="10-12", day_number=3, order=4),
                TemplateExerciseCreate(name="Face Pulls", recommended_sets=3, recommended_reps="12-15", day_number=3, order=5),
                TemplateExerciseCreate(name="Overhead Tricep Extensions", recommended_sets=3, recommended_reps="10-12", day_number=3, order=6),
                TemplateExerciseCreate(name="Hammer Curls", recommended_sets=3, recommended_reps="10-12", day_number=3, order=7),

                # Day 4: Lower B
                TemplateExerciseCreate(name="Deadlifts", recommended_sets=4, recommended_reps="5-6", day_number=4, order=1),
                TemplateExerciseCreate(name="Front Squats", recommended_sets=3, recommended_reps="8-10", day_number=4, order=2),
                TemplateExerciseCreate(name="Bulgarian Split Squats", recommended_sets=3, recommended_reps="10-12", day_number=4, order=3),
                TemplateExerciseCreate(name="Lying Leg Curls", recommended_sets=3, recommended_reps="12-15", day_number=4, order=4),
                TemplateExerciseCreate(name="Seated Calf Raises", recommended_sets=4, recommended_reps="15-20", day_number=4, order=5),
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
