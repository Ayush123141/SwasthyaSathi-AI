"""
SwasthyaSathi AI - Application Settings

Loads all configuration from environment variables using Pydantic BaseSettings.
Never hardcode secrets — always use .env files.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    app_name: str = Field(default="SwasthyaSathi AI", alias="APP_NAME")
    app_version: str = Field(default="1.0.0", alias="APP_VERSION")
    debug: bool = Field(default=False, alias="DEBUG")
    cors_origins: str = Field(
        default="http://localhost:5173,http://localhost:3000",
        alias="CORS_ORIGINS",
    )

    # Supabase
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    supabase_anon_key: str = Field(default="", alias="SUPABASE_ANON_KEY")
    supabase_service_role_key: str = Field(
        default="", alias="SUPABASE_SERVICE_ROLE_KEY"
    )

    # Gemini AI
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")

    # ML Models
    risk_model_path: str = Field(
        default="ml/models/risk_model.json", alias="RISK_MODEL_PATH"
    )
    whisper_model_size: str = Field(default="small", alias="WHISPER_MODEL_SIZE")
    whisper_device: str = Field(default="cpu", alias="WHISPER_DEVICE")
    whisper_compute_type: str = Field(default="int8", alias="WHISPER_COMPUTE_TYPE")

    # File Upload
    max_upload_size_mb: int = Field(default=10, alias="MAX_UPLOAD_SIZE_MB")
    upload_dir: str = Field(default="uploads", alias="UPLOAD_DIR")
    reports_dir: str = Field(default="generated_reports", alias="REPORTS_DIR")

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "populate_by_name": True,
    }


@lru_cache()
def get_settings() -> Settings:
    """
    Cached settings instance.
    Creates the Settings object once and reuses it for all requests.
    """
    return Settings()
