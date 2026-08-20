"""
Health & Telemetry Router

Concept Explanation:
--------------------
In cloud-native microservice architectures (like ReliaQuest's 140+ microservices environment):
- **Liveness Probes**: Ensure the container process is running and not deadlocked.
- **Readiness Probes**: Ensure dependencies and upstream configurations (e.g. Gemini/OpenAI API keys)
  are initialized before the API Gateway routes traffic to the pod.
"""

from fastapi import APIRouter
from app.models.schemas import HealthStatus
from app.config import settings
from app.agent.therapist_agent import agent_instance

router = APIRouter(tags=["Health & Monitoring"])


@router.get(
    "/health",
    response_model=HealthStatus,
    summary="Microservice Health & Readiness Probe",
    description="Returns service uptime status and LLM provider readiness."
)
async def health_check() -> HealthStatus:
    """
    Health check endpoint for Docker / Kubernetes / Cloud Run health probes.
    """
    return HealthStatus(
        status="healthy",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        gemini_configured=agent_instance.gemini_configured,
        openai_configured=agent_instance.openai_client is not None
    )
