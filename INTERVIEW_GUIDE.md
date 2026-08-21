# 🧠 MindMate AI Therapist — Interview Guide

> **Project**: MindMate — AI-powered conversational mental health companion  
> **Stack**: Python 3.11, FastAPI, Google Gemini API, OpenAI API, Next.js  
> **Resume Line**: *AI Therapist Agent — Python, LLM APIs (OpenAI/Gemini), FastAPI*

---

## 1. Project Overview (30-Second Pitch)

> *"MindMate is an AI-powered mental health companion. I built a FastAPI backend that acts as an autonomous agent — it classifies the user's emotional intent, runs safety guardrails to detect crisis signals, then orchestrates a prompt pipeline to Gemini or OpenAI. If both APIs fail, a deterministic heuristic fallback engine kicks in so the system has 0% downtime. Responses are streamed in real-time via Server-Sent Events to give a natural, low-latency conversational feel."*

---

## 2. Architecture Deep Dive

```
User Browser (Next.js)
        │
        │  POST /api/v1/chat/send   (JSON payload: messages[])
        │  GET  /api/v1/chat/stream (SSE streaming endpoint)
        ▼
FastAPI ASGI Server (uvicorn)
        │
        ├── Middleware Layer
        │     ├── CORSMiddleware      (allow cross-origin from frontend)
        │     └── Timing Middleware   (X-Process-Time header on every response)
        │
        ├── Router Layer (APIRouter)
        │     ├── /api/v1/chat    → chat.py     (chat + stream endpoints)
        │     ├── /api/v1/analyze → analyze.py  (sentiment analysis endpoint)
        │     └── /api/v1/health  → health.py   (health check endpoint)
        │
        └── Agent Layer (TherapistAgent)
              │
              ├── Step 1: Safety Guardrails — inspect_input()
              │     - Detect crisis keywords: "kill myself", "suicide", etc.
              │     - If crisis → intercept → return 988 Lifeline override
              │
              ├── Step 2: Intent Classification — classify_intent()
              │     - CRISIS_URGENT → immediate safety response
              │     - ANXIETY_STRESS → grounding techniques
              │     - COPING_EXERCISE → breathing exercises
              │     - WORK_BURNOUT → boundary-setting guidance
              │     - VENTING → active listening, validation
              │     - GENERAL → open-ended empathetic response
              │
              ├── Step 3: Sentiment Analysis — SentimentAnalyzer.analyze()
              │     - Keyword-based emotion scoring
              │     - Returns: score (-1.0 to +1.0), emotion tags
              │
              ├── Step 4: Context Window Pruning — _prepare_history()
              │     - Keeps last MAX_CONVERSATION_HISTORY messages
              │     - Prevents token bloat → controls LLM API costs
              │
              └── Step 5: LLM Orchestration with Fallback Chain
                    ├── Primary:   Google Gemini (gemini-1.5-flash)
                    ├── Secondary: OpenAI (gpt-4o-mini)
                    └── Fallback:  Local heuristic engine (offline-safe)
```

---

## 3. Resume Bullet Deep Dives

### 📌 Bullet 1: *"Built AI-powered conversational agent using LLM APIs for real-time interaction"*

**What's in the code**:
- [`therapist_agent.py`](backend/app/agent/therapist_agent.py) — `TherapistAgent` class
- Connects to Google Gemini (`google.generativeai`) and OpenAI (`AsyncOpenAI`) APIs
- `generate_response()` — full synchronous response for simple chat
- `stream_response()` — async generator, yields token chunks in real-time

**How to explain it**:
> *"The agent talks to LLM APIs — Gemini is the primary, OpenAI is the secondary fallback. Both are real integrations, not mock code. For streaming, I use Python's `AsyncGenerator` to yield token chunks as they arrive, and FastAPI's `StreamingResponse` + `EventSourceResponse` delivers them as Server-Sent Events to the browser. This is how ChatGPT-style streaming works — the UI renders each word as it arrives rather than waiting for the full response."*

---

### 📌 Bullet 2: *"Orchestrated prompt pipelines and response handling for structured conversations"*

**What's in the code**:
- `SYSTEM_PROMPT` constant in `therapist_agent.py` — the therapeutic persona instruction
- `_prepare_history()` — context window management (prunes to `MAX_CONVERSATION_HISTORY` turns)
- `classify_intent()` → selects appropriate response strategy
- `SafetyGuardrails.sanitize_output()` — post-processes LLM output before returning to user

**Prompt Pipeline flow**:
```
Raw user message
      ↓
[Safety Pre-check] → if crisis → override, skip LLM
      ↓
[Intent Classification] → classify emotional state
      ↓
[Context Pruning] → last N messages → fit in context window
      ↓
[System Prompt + History + User Message] → sent to LLM
      ↓
[LLM Response] → raw text
      ↓
[Output Sanitization] → remove harmful content
      ↓
User receives clean, safe, empathetic response
```

**How to explain it**:
> *"A 'prompt pipeline' means we don't just forward user messages to the LLM blindly. We first classify intent, prepend a detailed system prompt that defines the therapeutic persona, prune the conversation history to fit within token limits, then send the structured message. After getting the LLM response, we sanitize it through output guardrails before it reaches the user. Each step in this pipeline is independently testable — I have unit tests for guardrails and sentiment separately from LLM calls."*

---

### 📌 Bullet 3: *"Designed backend workflow for context management and session continuity"*

**What's in the code**:
- [`schemas.py`](backend/app/models/schemas.py) — `ChatMessage` model with `role: MessageRole` (user/assistant)
- [`chat.py`](backend/app/routers/chat.py) — `/chat/send` accepts `messages[]` array (full history)
- `_prepare_history()` — slides a window over the message history

**The Session Continuity Pattern**:
```python
# Client sends the ENTIRE conversation history each request (Stateless REST)
{
  "messages": [
    {"role": "user",      "content": "I feel overwhelmed at work"},
    {"role": "assistant", "content": "I hear you. Workplace stress can be exhausting..."},
    {"role": "user",      "content": "Yeah, my manager keeps adding more tasks"}
  ]
}
```

> *"MindMate uses a stateless session design — the client sends the full conversation history on each request. The backend takes only the last N messages (context window pruning) to control token costs, then constructs a structured message array for the LLM. This is exactly how the OpenAI Chat Completions API works — you always send the full history, the model 'remembers' by reading it. The tradeoff is client-side storage vs. server-side session state — stateless is more scalable."*

---

### 📌 Bullet 4: *"Authored research paper on agentic conversational AI architecture"*

**What makes this an 'Agentic' system** (vs. a simple LLM wrapper):

| Simple LLM Wrapper | Agentic System (MindMate) |
|---|---|
| Forwards message to LLM | Classifies intent before choosing behavior |
| No safety checks | Pre-execution guardrails + post-processing |
| Single LLM only | Multi-model orchestration with fallback chain |
| Context = last message | Context window management with pruning |
| Fails if API is down | Deterministic offline heuristic fallback |
| No structured output | Structured response with `intent`, `sentiment_score`, `model_used` |

**Talking point**:
> *"The research paper documented how an agentic system differs from a simple LLM wrapper. The key insight is that a true agent has a perception-reasoning-action loop. In MindMate: perception = reading user messages + safety inspection; reasoning = intent classification + sentiment analysis + model selection; action = LLM API call with structured prompt. The agent also has resilience — it doesn't break when external APIs fail. This architectural thinking is what separates production AI systems from demos."*

---

## 4. Technical Deep Dives — Interview Q&A

### Q: "What is FastAPI and why did you choose it over Flask or Django?"

**A**:
> *"FastAPI is built on Starlette (ASGI framework) and uses Python's `async`/`await` natively. The key advantages over Flask:*
> *1. Async I/O: LLM API calls are network-bound — with Flask (WSGI), each request blocks a thread while waiting. With FastAPI (ASGI), thousands of concurrent LLM API calls can run concurrently on a single thread.*
> *2. Automatic OpenAPI docs: FastAPI generates `/docs` (Swagger UI) and `/redoc` automatically from Pydantic type annotations — zero extra work.*
> *3. Pydantic validation: Request/response models are validated automatically. If the client sends wrong types, FastAPI returns a clear 422 error — I don't write validation code manually.*
> *Django would be overkill — it's a full-stack framework with ORM, admin, template engine. MindMate only needs a lightweight API server."*

---

### Q: "What is Server-Sent Events (SSE)? How does streaming work?"

**A**:
> *"SSE is a one-way, server-to-client streaming protocol over a single HTTP connection. Unlike WebSockets (bidirectional), SSE is simpler — the server pushes data chunks, the client only reads.*
> 
> *In MindMate's `/chat/stream` endpoint:*
> *1. Client opens a long-lived GET request*
> *2. FastAPI returns `EventSourceResponse` (content-type: text/event-stream)*
> *3. As Gemini generates tokens, our `stream_response()` async generator yields each chunk*
> *4. FastAPI writes `data: <chunk>\n\n` to the HTTP response incrementally*
> *5. Browser's `EventSource` API reads each chunk and renders it immediately*
> 
> *This gives the ChatGPT-style typing effect — users see words appear as the model generates them rather than waiting 2-3 seconds for the full response."*

---

### Q: "How does your safety guardrail system work?"

**A**:
> *"Safety is a two-stage process:*
>
> *Pre-execution (input guardrail):*
> - Inspect the user's message for crisis keywords (suicide, self-harm)
> - If detected → intercept BEFORE the LLM is called
> - Return a pre-written safety response with 988 Lifeline reference
> - The LLM never sees the message — avoids potential harmful continuations
>
> *Post-execution (output guardrail):*
> - After LLM generates a response, `sanitize_output()` reviews it
> - Removes any content that might inadvertently reinforce harmful thoughts
>
> *This is a safety-by-design approach — not relying on the LLM to handle crisis scenarios correctly, since LLMs can hallucinate or give inappropriate responses under edge cases."*

---

### Q: "What is the fallback chain and why is it important?"

**A**:
> *"The fallback chain is: Gemini → OpenAI → Local Heuristic Engine.*
>
> *Gemini is primary because it's free-tier generous and fast for conversational use. If Gemini's API returns an error (rate limit, network timeout, API key issue), we try OpenAI's gpt-4o-mini.*
>
> *If both external APIs fail, a local deterministic engine kicks in — keyword-based response selection from a curated response bank (no API call needed). This guarantees the app is never 'broken' even during API outages.*
>
> *This is important for a mental health app specifically — users may be in distress. An 'Internal Server Error' at the wrong moment is unacceptable. The fallback engine ensures the app always responds with something empathetic and safe."*

---

### Q: "How did you handle context window limits / token management?"

**A**:
> *"LLMs have a maximum context window — Gemini 1.5 Flash supports 1M tokens, GPT-4o-mini supports 128K. For most conversations, this isn't a problem. But at scale (long sessions), we need to prune.*
>
> *The `_prepare_history()` method slides a window: if the conversation has more than `MAX_CONVERSATION_HISTORY` messages (configurable, default ~20 turns), it discards the oldest ones and keeps only the most recent. The system prompt is always included — it's prepended fresh on every request.*
>
> *A more sophisticated approach (used in production systems) is 'summary memory': periodically summarize older context rather than discarding it. That's a planned enhancement — for the scope of this project, sliding window is sufficient and simple."*

---

### Q: "What does your Pydantic schema look like and why does it matter?"

**A**:
> *"Pydantic models define the contract for the API. `ChatMessage` has `role: MessageRole` (an enum: user/assistant) and `content: str`. `ChatResponse` returns `message`, `intent`, `safety`, `sentiment_score`, `detected_emotions`, and `model_used`.*
>
> *Why it matters: FastAPI validates every incoming request against the Pydantic schema automatically. If a client sends `role: 'administrator'` — not in the enum — FastAPI returns a 422 Unprocessable Entity with a clear error message, before my code runs. This means I never need to write `if 'role' not in ['user', 'assistant']: return 400`.*
>
> *The `model_used` field in the response is useful for observability — in production, you'd log this to see what % of traffic is served by Gemini vs OpenAI vs fallback."*

---

## 5. System Design Question

### "Design the MindMate system to handle 100,000 concurrent users"

```
                        ┌─────────────┐
User Browsers ──────────│  CDN / WAF  │ (Cloudflare — static assets, DDoS protection)
                        └──────┬──────┘
                               │
                        ┌──────▼──────┐
                        │  Load Balancer │ (AWS ALB — distributes across app replicas)
                        └──────┬──────┘
                    ┌──────────┼──────────┐
             ┌──────▼───┐ ┌───▼───┐ ┌───▼──────┐
             │ FastAPI  │ │FastAPI│ │  FastAPI │  (Multiple replicas — horizontal scaling)
             │ Pod 1    │ │ Pod 2 │ │  Pod N   │  (Kubernetes HPA auto-scales on CPU/memory)
             └──────┬───┘ └───┬───┘ └───┬──────┘
                    └─────────┼─────────┘
                              │
                ┌─────────────┴─────────────┐
         ┌──────▼──────┐             ┌──────▼──────┐
         │ Redis Cache │             │  PostgreSQL  │
         │ (Sessions,  │             │  (User data, │
         │  Rate Limit)│             │  history)    │
         └─────────────┘             └─────────────┘
                              │
                     ┌────────▼────────┐
                     │ Async Task Queue │  (Celery + Redis)
                     │ (Long analyses,  │  Offload heavy work from API
                     │  report gen)     │
                     └─────────────────┘
```

**Key scaling decisions to mention**:
1. **Stateless API** — each pod is identical, no session state stored in the app
2. **Async I/O** — FastAPI handles thousands of concurrent LLM API calls without blocking
3. **Rate limiting** — Redis-based rate limiter (e.g., 10 requests/min per user) prevents LLM cost explosions
4. **Session storage** — move conversation history to Redis (fast) instead of client-side for logged-in users

---

## 6. Five-Minute Cheat Sheet

```
┌────────────────────────────────────────────────────────────────────────┐
│                  🧠 MINDMATE QUICK REFERENCE                           │
├────────────────────────────────────────────────────────────────────────┤
│ FRAMEWORK  : FastAPI (ASGI) + uvicorn + Pydantic                       │
│ STREAMING  : SSE via EventSourceResponse + AsyncGenerator              │
│ LLM STACK  : Gemini (primary) → OpenAI (fallback) → Heuristic         │
│ SAFETY     : Pre-exec guardrail (input) + post-exec sanitize (output)  │
│ INTENT     : 7 categories — CRISIS, ANXIETY, COPING, BURNOUT, etc.     │
│ CONTEXT    : Sliding window — last N messages to control token cost     │
│ ENDPOINTS  : POST /chat/send | GET /chat/stream | POST /analyze        │
│ PATTERN    : Perception → Intent → Context → LLM → Sanitize → Stream  │
│ vs. FLASK  : ASGI async (FastAPI) vs WSGI sync (Flask) for SSE         │
│ RESEARCH   : Agentic AI = Perception + Reasoning + Action + Fallback   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Key Files Map

| File | What It Does | Resume Bullet |
|---|---|---|
| [`agent/therapist_agent.py`](backend/app/agent/therapist_agent.py) | Core agent: intent, LLM orchestration, streaming | Bullets 1, 2, 4 |
| [`agent/guardrails.py`](backend/app/agent/guardrails.py) | Crisis detection, output sanitization | Bullet 2 |
| [`agent/sentiment.py`](backend/app/agent/sentiment.py) | Emotion analysis (keyword + scoring) | Bullet 3 |
| [`routers/chat.py`](backend/app/routers/chat.py) | Chat + stream API endpoints | Bullet 1 |
| [`models/schemas.py`](backend/app/models/schemas.py) | Pydantic request/response models | Bullet 3 |
| [`main.py`](backend/app/main.py) | FastAPI app, CORS, middleware, lifespan | All bullets |
| [`config.py`](backend/app/config.py) | Settings, env variable loading | Architecture |
| [`Dockerfile`](backend/Dockerfile) | Multi-stage container build | Deployment |
