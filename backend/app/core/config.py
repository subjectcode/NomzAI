from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "Nomz API"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api"
    DATABASE_URL: str = "sqlite:///./nomz.db"
    CORS_ORIGINS: Union[List[str], str] = ["*"]
    ENVIRONMENT: str = "development"
    GEMINI_API_KEY: str = ""
    VISION_MODEL: str = "gemini-3.8-flash"
    MAX_IMAGE_SIZE_MB: int = 10

    # Langflow Workflow Configuration (Milestone 3)
    LANGFLOW_BASE_URL: str = "http://127.0.0.1:7860"
    LANGFLOW_FLOW_ID: str = "2e514b81-21d7-49b9-9fae-a981f95a8029"
    LANGFLOW_API_KEY: str = ""
    LANGFLOW_TIMEOUT_SECONDS: float = 60.0

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=(str(BASE_DIR / ".env"), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
