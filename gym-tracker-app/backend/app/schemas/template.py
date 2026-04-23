from pydantic import BaseModel


class TemplateExerciseBase(BaseModel):
    name: str
    recommended_sets: int = 3
    recommended_reps: str = "8-12"
    notes: str | None = None
    day_number: int = 1
    order: int = 0


class TemplateExerciseCreate(TemplateExerciseBase):
    pass


class TemplateExerciseResponse(TemplateExerciseBase):
    id: int

    class Config:
        from_attributes = True


class WorkoutTemplateBase(BaseModel):
    name: str
    description: str | None = None
    category: str
    duration_days: int = 7


class WorkoutTemplateCreate(WorkoutTemplateBase):
    exercises: list[TemplateExerciseCreate] = []


class WorkoutTemplateResponse(WorkoutTemplateBase):
    id: int
    is_preset: bool
    exercises: list[TemplateExerciseResponse]

    class Config:
        from_attributes = True
