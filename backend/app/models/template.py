from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., "Push/Pull/Leg", "Bro Split", etc.
    duration_days: Mapped[int] = mapped_column(default=7)  # Cycle duration
    is_preset: Mapped[bool] = mapped_column(default=True)  # Distinguish preset from user templates
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    exercises: Mapped[list["TemplateExercise"]] = relationship(
        back_populates="template",
        cascade="all, delete-orphan",
    )


class TemplateExercise(Base):
    __tablename__ = "template_exercises"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    recommended_sets: Mapped[int] = mapped_column(default=3)
    recommended_reps: Mapped[str] = mapped_column(String(50), default="8-12")  # e.g., "8-12" or "5-8"
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    template_id: Mapped[int] = mapped_column(
        ForeignKey("workout_templates.id", ondelete="CASCADE"), nullable=False, index=True
    )
    day_number: Mapped[int] = mapped_column(default=1)  # Which day of the cycle
    order: Mapped[int] = mapped_column(default=0)  # Exercise order within the day
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    template: Mapped["WorkoutTemplate"] = relationship(back_populates="exercises")
