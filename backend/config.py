import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator


class Settings(BaseSettings):
    # Server & Environment
    PORT: int = Field(default=8000, alias="PORT")
    ENVIRONMENT: str = Field(default="development", alias="ENVIRONMENT")
    CORS_ORIGINS: str = Field(
        default="http://localhost:5173,http://localhost:8000,http://127.0.0.1:5173,http://127.0.0.1:8000",
        alias="CORS_ORIGINS"
    )

    # AI Provider Settings
    # Options: 'ollama', 'hosted_openai_compatible', 'demo_offline'
    AI_PROVIDER: str = Field(default="ollama", alias="AI_PROVIDER")
    
    # Local Ollama
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434", alias="OLLAMA_BASE_URL")
    OLLAMA_MODEL: str = Field(default="gemma3:1b", alias="OLLAMA_MODEL")
    
    # Hosted OpenAI-compatible (for Render or cloud open-weight inference)
    OPENAI_COMPATIBLE_BASE_URL: Optional[str] = Field(default=None, alias="OPENAI_COMPATIBLE_BASE_URL")
    OPENAI_COMPATIBLE_API_KEY: Optional[str] = Field(default=None, alias="OPENAI_COMPATIBLE_API_KEY")
    OPENAI_COMPATIBLE_MODEL: Optional[str] = Field(default=None, alias="OPENAI_COMPATIBLE_MODEL")

    # Database Settings (MongoDB Atlas)
    MONGODB_URI: Optional[str] = Field(default=None, alias="MONGODB_URI")
    DATABASE_NAME: str = Field(default="open_list_db", alias="DATABASE_NAME")

    # Vector Search & Embeddings
    EMBEDDING_PROVIDER: str = Field(default="ollama", alias="EMBEDDING_PROVIDER")
    EMBEDDING_MODEL: str = Field(default="gemma3:1b", alias="EMBEDDING_MODEL")
    VECTOR_SEARCH_INDEX_NAME: str = Field(default="vector_index", alias="VECTOR_SEARCH_INDEX_NAME")

    # Static Assets & Frontend Path
    STATIC_DIR: str = Field(default="frontend/dist", alias="STATIC_DIR")

    # Operational limits
    REQUEST_TIMEOUT_SECONDS: float = 60.0
    MAX_INPUT_LENGTH: int = 4000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ORIGINS or self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
