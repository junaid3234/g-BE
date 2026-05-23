import os
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def normalize_database_url(url: str) -> str:
    """Convert Railway/Heroku postgres URLs to async SQLAlchemy format."""
    if url.startswith("postgres://"):
        return "postgresql+asyncpg://" + url[len("postgres://") :]
    if url.startswith("postgresql://"):
        return "postgresql+asyncpg://" + url[len("postgresql://") :]
    return url


def _default_db() -> str:
    raw = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///./gingiai.db")
    return normalize_database_url(raw)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = _default_db()
    jwt_secret: str = "dev-secret-change-in-production-min-32-chars"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    clerk_secret_key: str = ""
    cors_origins: str = "http://localhost:3000"
    rate_limit_per_minute: int = 60
    model_path: str = "../ml-model/models/gingivitis_rf_model.joblib"
    app_name: str = "GingiAI API"
    debug: bool = False

    @field_validator("database_url", mode="before")
    @classmethod
    def _normalize_db(cls, value: str) -> str:
        return normalize_database_url(value)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
