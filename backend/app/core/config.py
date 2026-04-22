from pathlib import Path
from typing import List
from pydantic import field_validator, Field, ConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./gym_tracker.db"
    secret_key: str = "change-this-secret-key"
    access_token_expire_minutes: int = 1440
    jwt_algorithm: str = "HS256"

    # Supports comma-separated list of allowed origins via env var
    # e.g. FRONTEND_URL=https://gym-tracker.vercel.app,http://localhost:5173
    frontend_url: str = "http://localhost:5173"

    @field_validator("frontend_url", mode="before")
    @classmethod
    def parse_frontend_url(cls, v):
        if isinstance(v, str):
            return v
        return v
    
    def get_frontend_urls(self) -> List[str]:
        """Parse frontend_url string into a list of URLs."""
        return [u.strip() for u in self.frontend_url.split(",") if u.strip()]

    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent.parent / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


settings = Settings()
