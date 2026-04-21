from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
import os


class Settings(BaseSettings):
    database_url: str = "sqlite:///./gym_tracker.db"
    secret_key: str = "change-this-secret-key"
    access_token_expire_minutes: int = 1440
    jwt_algorithm: str = "HS256"

    # Supports comma-separated list of allowed origins via env var
    # e.g. FRONTEND_URL=https://gym-tracker.vercel.app,http://localhost:5173
    @property
    def frontend_url(self) -> list[str]:
        raw = os.getenv("FRONTEND_URL", "http://localhost:5173")
        return [u.strip() for u in raw.split(",") if u.strip()]

    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent.parent / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


settings = Settings()
