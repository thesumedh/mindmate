"""
FastAPI Server Runner Script

Concept Explanation:
--------------------
Uvicorn is a lightning-fast ASGI web server implementation for Python.
This script launches Uvicorn with:
- `app.main:app`: The FastAPI app instance.
- `reload=True`: Auto-reload on code changes (ideal for local development).
- Host & Port loaded from our centralized settings.

Usage:
    python run.py
"""

import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"Starting server on http://{settings.HOST}:{settings.PORT} ...")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
        log_level="info"
    )
