from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./gym_tracker.db"
    secret_key: str = "change-this-secret-key"
    access_token_expire_minutes: int = 1440
    frontend_url: list[str] = ["http://localhost:5173"]
    jwt_algorithm: str = "HS256"

    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent.parent / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


settings = Settings()
