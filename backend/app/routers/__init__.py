"""
Routers package initialization.
"""
from app.routers.chat import router as chat_router
from app.routers.analyze import router as analyze_router
from app.routers.health import router as health_router

__all__ = ["chat_router", "analyze_router", "health_router"]
