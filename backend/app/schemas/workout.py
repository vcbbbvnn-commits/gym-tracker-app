from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.exercise import ExerciseRead


class WorkoutCreate(BaseModel):
    name: str
    description: str | None = None
    performed_at: datetime | None = None


class WorkoutUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class WorkoutRead(BaseModel):
    id: int
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime
    exercises: list[ExerciseRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
