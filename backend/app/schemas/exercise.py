from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SetCreate(BaseModel):
    reps: int = Field(gt=0)
    weight: float = Field(ge=0)
    set_type: str = "normal"  # warmup | normal | drop | failure
    performed_at: datetime | None = None


class SetUpdate(BaseModel):
    reps: int | None = Field(default=None, gt=0)
    weight: float | None = Field(default=None, ge=0)
    set_type: str | None = None
    performed_at: datetime | None = None


class SetRead(BaseModel):
    id: int
    reps: int
    weight: float
    set_type: str
    performed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExerciseCreate(BaseModel):
    name: str
    notes: str | None = None


class ExerciseUpdate(BaseModel):
    name: str | None = None
    notes: str | None = None


class ExerciseRead(BaseModel):
    id: int
    name: str
    notes: str | None
    created_at: datetime
    sets: list[SetRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
