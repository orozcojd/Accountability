"""
Core configuration for the Accountability Platform backend.
Manages environment variables and application settings.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "Accountability Platform API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    LOG_LEVEL: str = "info"

    # AWS Configuration
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str = "us-east-1"
    S3_BUCKET: str = "accountability-platform-data"

    # External API Keys
    PROPUBLICA_API_KEY: str
    OPENSECRETS_API_KEY: str
    FEC_API_KEY: str
    GOVTRACK_API_KEY: Optional[str] = None

    # AI Configuration
    ANTHROPIC_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    AI_PROVIDER: str = "anthropic"  # "anthropic" or "openai"
    AI_MODEL: str = "claude-3-5-sonnet-20241022"  # or "gpt-4"

    # Authentication
    ADMIN_EMAIL: str = "admin@example.com"
    JWT_SECRET: str
    SESSION_SECRET: str
    MAGIC_LINK_EXPIRY_MINUTES: int = 15
    SESSION_EXPIRY_DAYS: int = 7

    # Frontend Integration
    VERCEL_DEPLOYMENT_URL: str = "https://accountability.vercel.app"
    REVALIDATE_SECRET: str
    FRONTEND_URL: str = "https://accountability.com"

    # Email Configuration
    SENDGRID_API_KEY: Optional[str] = None
    FROM_EMAIL: str = "noreply@accountability.com"

    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list = ["http://localhost:3000", "https://accountability.com"]

    # Performance
    MAX_CONCURRENT_SCRAPES: int = 10
    REQUEST_TIMEOUT: int = 30
    RETRY_ATTEMPTS: int = 3

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
