# ============================================================
# Dockerfile — MindMate AI Therapist Backend (FastAPI / Python)
#
# Why multi-stage for Python?
#   Stage 1 (builder): Install dependencies in a build environment
#   Stage 2 (runtime): Copy only installed packages + source code
#   Result: No pip, setuptools, or wheel tools in production image
#
# Build:  docker build -t mindmate-backend:latest .
# Run:    docker run -p 8000:8000 --env-file .env mindmate-backend:latest
# ============================================================

# STAGE 1: Builder — install Python dependencies
FROM python:3.11-slim AS builder

WORKDIR /install

# Install build dependencies (needed for some Python packages with C extensions)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install to a specific target directory
# This lets us copy only installed packages to the runtime stage
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install/deps -r requirements.txt

# STAGE 2: Runtime — lightweight, no build tools
FROM python:3.11-slim AS runtime

# Security: run as non-root user
RUN groupadd -r mindmate && useradd -r -g mindmate mindmate

WORKDIR /app

# Copy installed Python packages from builder stage
COPY --from=builder /install/deps /usr/local

# Copy application source code
COPY app/ ./app/
COPY run.py .

# Change ownership to non-root user
RUN chown -R mindmate:mindmate /app
USER mindmate

EXPOSE 8000

# Health check — polls /api/v1/health every 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health')" || exit 1

# Use uvicorn ASGI server (production-grade async server)
# --workers 1: use 1 worker (scale horizontally via container replicas)
# --loop uvloop: ultra-fast event loop (2x faster than asyncio default)
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
