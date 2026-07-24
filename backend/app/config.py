"""Application configuration."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Gmail Reply Assistant API"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = True

    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "http://localhost:3000,chrome-extension://*"

    database_url: str = (
        "postgresql+asyncpg://gmail_assistant:gmail_assistant_dev@localhost:5432/gmail_assistant"
    )
    redis_url: str = "redis://localhost:6379/0"

    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/auth/google/callback"
    gmail_scopes: str = (
        "https://www.googleapis.com/auth/gmail.readonly,"
        "https://www.googleapis.com/auth/gmail.compose"
    )

    secret_key: str = "change-me-in-production"
    token_encryption_key: str = ""

    anthropic_api_key: str = ""
    ai_model: str = "claude-3-haiku-20240307"
    rate_limit_generate_per_hour: int = 30

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def gmail_scope_list(self) -> list[str]:
        return [scope.strip() for scope in self.gmail_scopes.split(",") if scope.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
