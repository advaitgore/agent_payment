from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "agent-payment-api"
    environment: str = Field(default="development", alias="ENVIRONMENT")
    debug: bool = Field(default=False, alias="DEBUG")
    database_url: str = Field(
        default="postgresql+psycopg2://postgres:postgres@localhost:5432/agent_payment",
        alias="DATABASE_URL",
    )
    auth_secret_key: str = Field(default="dev-change-me", alias="AUTH_SECRET_KEY")
    auth_token_expire_minutes: int = Field(default=60 * 24, alias="AUTH_TOKEN_EXPIRE_MINUTES")
    allowed_origins: list[str] = Field(
        default=["http://localhost:5173", "http://localhost:5174"],
        alias="ALLOWED_ORIGINS",
    )

    def __init__(self, **data):
        super().__init__(**data)
        if "ALLOWED_ORIGINS" in data or (hasattr(self, "allowed_origins") and isinstance(self.allowed_origins, str)):
            origins_str = data.get("ALLOWED_ORIGINS") or self.allowed_origins
            if isinstance(origins_str, str):
                self.allowed_origins = [origin.strip() for origin in origins_str.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()
