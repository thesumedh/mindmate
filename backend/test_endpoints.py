"""
Endpoint Integration Test Suite for FastAPI Application

Verifies:
- GET /
- GET /api/v1/health
- POST /api/v1/analyze
- POST /api/v1/chat
"""

import sys
import asyncio
from pathlib import Path
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.main import app


async def test_api_routes():
    print("==================================================")
    print("[HTTP TEST] Testing FastAPI App Endpoints")
    print("==================================================")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Test Root
        res = await client.get("/")
        assert res.status_code == 200
        print(f"  [PASS] GET / -> {res.json()['message']}")

        # Test Health
        res = await client.get("/api/v1/health")
        assert res.status_code == 200
        health_data = res.json()
        assert health_data["status"] == "healthy"
        print(f"  [PASS] GET /api/v1/health -> Status: {health_data['status']}, Service: {health_data['service']}")

        # Test Analyze
        res = await client.post("/api/v1/analyze", json={"text": "I feel happy and grateful today."})
        assert res.status_code == 200
        analyze_data = res.json()
        print(f"  [PASS] POST /api/v1/analyze -> Sentiment: {analyze_data['sentiment']}, Score: {analyze_data['score']}")

        # Test Chat
        res = await client.post("/api/v1/chat", json={
            "messages": [{"role": "user", "content": "I am feeling stressed."}],
            "stream": False
        })
        assert res.status_code == 200
        chat_data = res.json()
        assert "message" in chat_data
        print(f"  [PASS] POST /api/v1/chat -> Intent: {chat_data['intent']}, Model: {chat_data['model_used']}")

    print("\n==================================================")
    print("[SUCCESS] ALL HTTP ENDPOINT TESTS PASSED!")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(test_api_routes())
