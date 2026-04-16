from pydantic import BaseModel


class ProgressSummary(BaseModel):
    total_workouts: int
    total_exercises: int
    total_sets: int
    total_volume: float


class ExerciseProgressItem(BaseModel):
    exercise_name: str
    total_sets: int
    best_weight: float
    total_volume: float
