"""
Chat Router: Conversational Endpoints

Concept Explanation:
--------------------
Real-time conversational AI applications require low latency and high responsiveness.
This router provides two endpoints:
1. `POST /api/v1/chat`: Standard REST JSON endpoint returning the complete AI response
   along with rich metadata (intent classification, safety evaluation, sentiment score).
2. `POST /api/v1/chat/stream`: Server-Sent Events (SSE) streaming endpoint that streams
   tokens asynchronously as they are produced by the LLM.

Why Server-Sent Events (SSE) over WebSockets for LLM Chat?
- SSE operates over standard HTTP/1.1 or HTTP/2, making it easier to route through corporate
  proxies, API gateways (e.g. Kong, Envoy), and cloud load balancers.
- Simpler failure recovery, built-in reconnection mechanisms, and unidirectional data flow.
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, ChatResponse
from app.agent.therapist_agent import agent_instance

router = APIRouter(prefix="/chat", tags=["Conversational AI Agent"])


@router.post(
    "",
    response_model=ChatResponse,
    summary="Standard Chat Completion",
    description="Processes conversation messages through the Agentic loop and returns complete response with safety & sentiment metadata."
)
async def chat_completion(request: ChatRequest) -> ChatResponse:
    """
    Standard non-streaming chat completion.
    
    1. Validates incoming message payload via Pydantic.
    2. Runs through Safety Guardrails.
    3. Executes Agentic Intent Classification & LLM generation.
    4. Returns structured JSON payload.
    """
    try:
        response = await agent_instance.generate_response(request.messages)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating agent response: {str(e)}"
        )


@router.post(
    "/stream",
    summary="Real-time Streaming Chat Completion (SSE)",
    description="Streams tokens in real-time as an event stream (text/event-stream) for smooth UI rendering."
)
async def chat_stream(request: ChatRequest):
    """
    Server-Sent Events (SSE) streaming endpoint.
    
    Returns an async generator yielding text chunks with proper streaming headers:
    - Content-Type: text/event-stream
    - Cache-Control: no-cache
    - Connection: keep-alive
    """
    try:
        return StreamingResponse(
            agent_instance.stream_response(request.messages),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"  # Prevents Nginx/proxy buffer delay
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Streaming generation failed: {str(e)}"
        )
