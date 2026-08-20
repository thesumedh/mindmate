# 🧠 MindMate – AI Mental Health & Wellness Companion

> **AI Therapist Agent** built with a clean **FastAPI backend microservice** and **Next.js** frontend. Features safety guardrails, intent detection, and real-time streaming.

![MindMate](https://img.shields.io/badge/MindMate-AI%20Companion-orange?style=for-the-badge&logo=brain)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-Frontend-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

---

## 🏛️ The Architecture (Simple & Clear)

```
[ Frontend: Next.js / React ]
              │
              ▼  (HTTP / Server-Sent Events Streaming)
[ Backend: FastAPI Microservice ]
              │
              ├── 🛡️ Layer 1: Security Guardrails (Crisis Triage + Prompt Injection Defense)
              │
              ├── 🧠 Layer 2: Agent Decision Engine (Intent Classification + Context Pruner)
              │
              └── ⚡ Layer 3: AI Streamer & Fallback (Google Gemini 1.5 ──► Heuristic Backup)
```

### The 3 Layers Explained Simply:

- **Layer 1: Security Guardrails (`app/agent/guardrails.py`)**
  - **Crisis Triage:** Deterministically detects self-harm keywords $\to$ bypasses model $\to$ immediately returns 24/7 **988 Crisis Lifeline**.
  - **Prompt Injection Defense:** Blocks adversarial attempts to hijack the system (e.g., *"ignore previous instructions"*).
  - *Why interviewers love this:* It proves you understand defense-in-depth and never trust raw user input.

- **Layer 2: Agent Decision Engine (`app/agent/therapist_agent.py`)**
  - **Intent Classification:** Understands what the user needs:
    - `COPING_EXERCISE` $\to$ Guides through Box Breathing (4-4-4-4).
    - `ANXIETY_STRESS` $\to$ Offers grounding techniques (5-4-3-2-1).
    - `VENTING` $\to$ Provides non-judgmental active listening.
  - **Context Memory Pruning:** Keeps the last 15 messages so the context stays relevant without token bloat.

- **Layer 3: AI Streamer & Fallback Engine**
  - **SSE Streaming:** Yields tokens asynchronously chunk-by-chunk for an instant, real-time typing feel.
  - **Circuit Breaker Fallback:** If the Gemini API is rate-limited or offline, a local rule-based response engine takes over. The user never sees a broken page or 500 error.

---

## 🗺️ Code Map & Key Talking Points

| File Path | What It Does | Key Talking Point |
|---|---|---|
| [`backend/app/main.py`](file:///f:/hackthon/Resume_%20Projects/mindmate/backend/app/main.py) | FastAPI app entry point | ASGI async event loop, CORS middleware, latency tracking (`X-Process-Time`). |
| [`backend/app/agent/guardrails.py`](file:///f:/hackthon/Resume_%20Projects/mindmate/backend/app/agent/guardrails.py) | Security & safety firewall | Deterministic regex triage for emergency 988 dispatch & jailbreak prevention. |
| [`backend/app/agent/therapist_agent.py`](file:///f:/hackthon/Resume_%20Projects/mindmate/backend/app/agent/therapist_agent.py) | Core Agent brain | Intent classification, context window management, and async streaming generator. |
| [`backend/app/routers/chat.py`](file:///f:/hackthon/Resume_%20Projects/mindmate/backend/app/routers/chat.py) | Chat streaming endpoint | Server-Sent Events (`text/event-stream`) with `StreamingResponse`. |
| [`backend/app/routers/health.py`](file:///f:/hackthon/Resume_%20Projects/mindmate/backend/app/routers/health.py) | Health probe | Standard readiness probe for Kubernetes / container orchestration. |
| [`hooks/use-chat-hook.ts`](file:///f:/hackthon/Resume_%20Projects/mindmate/hooks/use-chat-hook.ts) | React streaming client | Uses Web Streams API (`ReadableStream.getReader()`) and `TextDecoder`. |

---

## ✨ Key Features (Simple Summary)

1. **Safety First:** If a user expresses self-harm or crisis, it immediately provides the 24/7 **988 Suicide & Crisis Lifeline**.
2. **Intent Detection:** Understands whether the user needs breathing exercises, stress advice, or just someone to listen.
3. **High Reliability & Fallback:** If the external AI API is unreachable or rate-limited, built-in backup responses prevent the app from ever crashing.
4. **Live Streaming:** Streams text token-by-token for a smooth, conversational typing feel.
5. **Private Journal & Wellness Games:** Local-first encrypted storage for private thoughts and stress-relief arcade games.

---

## 🚀 Quick Start Guide

### 1. Start Backend (FastAPI)
```bash
cd backend
.venv\Scripts\activate
python run.py
```
- API Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 2. Start Frontend (Next.js)
```bash
npm run dev
```
- Web App: [http://localhost:3000](http://localhost:3000)

### 3. Run Backend Verification Tests
```bash
cd backend
.venv\Scripts\activate
python test_api.py
```

---

## 📁 Simple Folder Structure

```
mindmate/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── agent/            # Agent logic, safety filter, intent detection
│   │   ├── models/           # Pydantic request/response schemas
│   │   ├── routers/          # API endpoints (/chat, /analyze, /health)
│   │   └── main.py           # FastAPI app entry point
│   ├── test_api.py           # Automated tests
│   └── run.py                # Server runner
│
├── app/                      # Next.js App Router (Pages & BFF API)
│   ├── api/chat/route.ts     # Proxy to FastAPI with fallback
│   ├── chat/page.tsx         # Chat page
│   ├── journal/page.tsx      # Private journal page
│   ├── resources/page.tsx    # Crisis hotlines
│   └── docs/page.tsx         # Research paper
│
├── components/               # React UI components
└── hooks/                    # Custom React hooks (streaming chat hook)
```

---

## 👥 Authors
Developed as an engineering research project by:
- **Sumedh Chandanshive**
- **Ketan Choraghe**
- **Tejas Khairnar**
- **Krushna Bayas**

*Parvatibai Genba Sopanrao Moze College of Engineering, Wagholi, Pune.*  
*Advisor: Prof. Vrushali Dhanokar*
