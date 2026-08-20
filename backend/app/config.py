"""
Application Configuration Module

Concept Explanation:
--------------------
In production microservices (following the 12-Factor App methodology), configuration 
must be strictly separated from code. We use Pydantic's `BaseSettings` because it provides:
1. Automatic type validation (e.g., ensuring PORT is an integer).
2. Environment variable parsing from `.env` files or container environment variables.
3. Default values for local development with strict overrides in production.
"""

from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field
import os
from pathlib import Path

# Resolve base directory to locate .env file dynamically
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """
    Central application settings class.
    
    FastAPI reads these values during startup. If an environment variable exists,
    it overrides the default value defined here.
    """

    # Project metadata
    PROJECT_NAME: str = "MindMate AI Therapist Agent API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = Field(default="development", description="Environment: development, staging, or production")
    
    # Server Binding
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # AI Provider Keys
    GOOGLE_GENERATIVE_AI_API_KEY: str = Field(
        default="", 
        description="Google Gemini API key for conversational intelligence"
    )
    OPENAI_API_KEY: str = Field(
        default="", 
        description="Optional OpenAI API key for backup LLM provider"
    )
    
    # Preferred Default Models
    DEFAULT_GEMINI_MODEL: str = "gemini-1.5-flash"
    DEFAULT_OPENAI_MODEL: str = "gpt-4o-mini"
    
    # Security: Allowed CORS origins for Cross-Origin Resource Sharing
    # In production, specify exact frontend domains (e.g. https://mindmate.app)
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Guardrail thresholds
    ENABLE_STRICT_SAFETY_GUARDRAILS: bool = True
    MAX_CONVERSATION_HISTORY: int = 15  # Keep last 15 messages for context window management

    class Config:
        env_file = os.path.join(BASE_DIR, ".env")
        env_file_encoding = "utf-8"
        case_sensitive = True


# Singleton instance of settings to avoid reloading .env on every request
settings = Settings()
