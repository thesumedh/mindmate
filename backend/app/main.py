"""
FastAPI Application Entry Point

Concept Explanation:
--------------------
FastAPI is a high-performance Python web framework based on ASGI (Asynchronous Server Gateway Interface),
Starlette, and Pydantic. It is particularly well-suited for Agentic AI and microservices because:
1. **Asynchronous Concurrency**: Handles thousands of simultaneous streaming connections using non-blocking I/O (`async`/`await`).
2. **Type Safety & Auto-Documentation**: Automatically generates interactive Swagger UI docs at `/docs` and ReDoc at `/redoc`.
3. **Microservice Modularity**: Uses `APIRouter` to cleanly separate domain concerns (Chat, Analytics, Health).
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time

from app.config import settings
from app.routers import chat_router, analyze_router, health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifespan Context Manager.
    
    Concept:
    Handles startup and shutdown lifecycle events in ASGI applications.
    - On startup: Log configuration status, warm up connections.
    - On shutdown: Clean up open database/HTTP client connection pools.
    """
    print(f"🚀 [Startup] Starting {settings.PROJECT_NAME} v{settings.VERSION} ({settings.ENVIRONMENT})")
    print(f"📡 [Startup] API Documentation available at: http://localhost:{settings.PORT}/docs")
    yield
    print(f"🛑 [Shutdown] Gracefully shutting down {settings.PROJECT_NAME}...")


# Instantiate the FastAPI core application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Agentic AI Backend for MindMate Mental Health Companion with Safety Guardrails and SSE Streaming",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)


# Configure Cross-Origin Resource Sharing (CORS)
# Crucial for allowing frontend applications (e.g. Next.js on port 3000) to communicate with FastAPI on port 8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Request Timing Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """
    Measures processing duration for every API request and attaches the latency metric
    to the response header `X-Process-Time`. Useful for observability and performance benchmarking.
    """
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response


# Global Exception Handler for unhandled errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catches unexpected exceptions to prevent leaking server tracebacks in production,
    returning a clean JSON error response instead.
    """
    print(f"❌ [Unhandled Error] Path: {request.url.path} | Error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Our team has been notified."}
    )


# Register domain-specific routers under /api/v1 prefix
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(analyze_router, prefix=settings.API_V1_STR)
app.include_router(health_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
async def root():
    """
    Root landing endpoint directing developers to the interactive API documentation.
    """
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
