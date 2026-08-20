# MindMate AI Agent - FastAPI Backend Microservice

An enterprise-ready **FastAPI Backend** powering the **MindMate AI Therapist Agent**. Designed with modular microservice architecture, multi-tiered safety guardrails, intent classification, and real-time Server-Sent Events (SSE) token streaming.

---

## 🌟 Key Architectural Features

1. **Agentic Decision Loop**:
   - **Perception**: Multi-turn message parsing with context-window management.
   - **Intent Classification**: Categorizes user turns into `VENTING`, `ANXIETY_STRESS`, `COPING_EXERCISE`, `WORK_BURNOUT`, or `CRISIS_URGENT`.
   - **Multi-Model Orchestration**: Primary (Google Gemini), Secondary (OpenAI), and Heuristic Fallback for zero downtime.
2. **Security & Safety Guardrail Engine** *(Key for SecOps / ReliaQuest)*:
   - **Crisis Triage**: Intercepts suicidal/self-harm indicators and routes immediately to 988 Lifeline.
   - **Prompt Injection Defense**: Defends against adversarial jailbreak attempts and system prompt extraction.
   - **Boundary Enforcement**: Prevents clinical diagnoses or medication prescription hallucinations.
3. **Real-time SSE Streaming**:
   - Streams LLM output chunks asynchronously over HTTP with low latency.
4. **Sentiment & Emotion Telemetry**:
   - Quantifies emotional valence (-1.0 to +1.0) and primary emotion states.
5. **Production Microservice Ready**:
   - Centralized Pydantic BaseSettings configuration (12-Factor App).
   - `/api/v1/health` readiness and liveness probes for Docker/Kubernetes.
   - Interactive Swagger docs at `/docs` and ReDoc at `/redoc`.

---

## 🚀 Quickstart Guide

### 1. Create and Activate Virtual Environment
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate on Windows:
.venv\Scripts\activate
# Activate on Linux/macOS:
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```
*(Optionally add your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/))*

### 4. Start the Server
```bash
python run.py
# Or directly with uvicorn:
uvicorn app.main:app --reload --port 8000
```

### 5. Interactive API Documentation
Open your browser to:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/chat/stream` | Real-time SSE streaming chat completion |
| `POST` | `/api/v1/chat` | Standard REST JSON chat with safety metadata |
| `POST` | `/api/v1/analyze` | Sentiment & emotional analysis for journal/text |
| `GET` | `/api/v1/health` | Service health, model status, and readiness probe |
