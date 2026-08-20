"""
Autonomous AI Therapist Agent Core

Concept Explanation:
--------------------
Unlike a simple LLM wrapper, an **Agentic System** executes a structured decision loop:
1. **Perception / Interception**: Receives multi-turn messages and inspects them through Security Guardrails.
2. **Intent Classification**: Evaluates whether the user needs acute crisis intervention, active listening, 
   a guided coping exercise (e.g. box breathing), or reflective dialogue.
3. **Context Memory Optimization**: Manages the conversation window to retain critical context while avoiding token bloat.
4. **Multi-Model Orchestration & Fallback**:
   - Primary: Google Gemini (`gemini-1.5-flash` / `gemini-pro`).
   - Secondary: OpenAI (`gpt-4o-mini`).
   - Resilient Fallback: Offline heuristic response engine (ensuring 0% downtime even during API network failures).
5. **Streaming Execution (ASGI Generator)**: Asynchronously streams token chunks via Server-Sent Events (SSE) 
   to provide a smooth, sub-100ms perceived latency for the user.
"""

import asyncio
from typing import AsyncGenerator, List, Dict, Any, Optional
import os

from app.config import settings
from app.models.schemas import ChatMessage, ChatResponse, UserIntent, MessageRole, SafetyEvaluation
from app.agent.guardrails import SafetyGuardrails
from app.agent.sentiment import SentimentAnalyzer

# Lazy-loaded LLM clients to support offline/test modes without startup crashes
try:
    import google.generativeai as genai
    HAS_GEMINI_LIB = True
except ImportError:
    HAS_GEMINI_LIB = False

try:
    from openai import AsyncOpenAI
    HAS_OPENAI_LIB = True
except ImportError:
    HAS_OPENAI_LIB = False


# Core System Prompt instructing therapeutic style and safety constraints
SYSTEM_PROMPT = """You are MindMate, a warm, compassionate, and empathetic AI mental health companion.
Your mission is to provide a safe, non-judgmental space for users to express their thoughts, navigate stress, 
and learn evidence-based coping mechanisms (such as mindfulness, cognitive reframing, and box breathing).

Key Operational Guidelines:
1. **Role Boundary**: You are an AI companion, NOT a licensed medical doctor or clinical psychiatrist. 
   Do not provide medical diagnoses or prescribe medications.
2. **Empathetic Listening**: Validate emotions first before jumping into problem-solving. Use warm, reflective phrasing.
3. **Pacing & Brevity**: Keep responses thoughtful yet concise (1-3 paragraphs) so the user does not feel overwhelmed.
4. **Crisis Safety Protocol**: If the user indicates imminent self-harm, immediately encourage professional help 
   and reference the 988 Suicide & Crisis Lifeline.
5. **Tone**: Warm, supportive, gentle, and grounded.
"""

# Deterministic Fallback Knowledge Base (guarantees uptime if third-party LLMs fail)
FALLBACK_RESPONSES: Dict[str, List[str]] = {
    "stress": [
        "Stress can feel really heavy when everything piles up at once. Have you been able to take a brief 5-minute pause today?",
        "I hear how much pressure you are under. What is one small thing on your plate that we could break down together?",
        "When stress peaks, our bodies often hold tension. Let's take a slow, deep breath in... and release it."
    ],
    "anxiety": [
        "Anxiety can make everything feel urgent and overwhelming. Let's try grounding: can you name 3 things you can see around you right now?",
        "I'm right here with you. It is completely okay to feel anxious. You don't have to face this alone.",
        "Your feelings are valid. Take your time, there is no rush. What is making you feel most uneasy at this moment?"
    ],
    "depression": [
        "I'm so glad you reached out today. Even sharing how you feel is a brave step. How long have you been carrying this weight?",
        "It's completely okay if all you did today was get through it. Be gentle with yourself.",
        "I'm listening with an open heart. What would give you even a tiny bit of comfort right now?"
    ],
    "work": [
        "Workplace stress can be deeply exhausting. Do you feel like you are able to disconnect after your workday ends?",
        "It sounds like work is demanding a lot from you right now. How are your energy levels holding up?",
        "Setting boundaries at work is difficult but essential. What is causing the most friction at your job?"
    ],
    "default": [
        "Thank you for sharing that with me. I'm listening. Could you tell me a little more about what's been on your mind?",
        "I appreciate you opening up. How has this been making you feel throughout the day?",
        "I'm here to support you through whatever you're going through. What feels most important to talk about right now?"
    ]
}


class TherapistAgent:
    """
    Autonomous AI Therapist Agent implementing intent classification,
    safety guardrails, context window management, and multi-provider streaming.
    """

    def __init__(self):
        # Configure Gemini API client if key is provided
        self.gemini_configured = False
        if settings.GOOGLE_GENERATIVE_AI_API_KEY and HAS_GEMINI_LIB:
            try:
                genai.configure(api_key=settings.GOOGLE_GENERATIVE_AI_API_KEY)
                self.gemini_configured = True
            except Exception as e:
                print(f"[Agent Init] Warning: Gemini configuration error: {e}")

        # Configure OpenAI client if key is provided
        self.openai_client = None
        if settings.OPENAI_API_KEY and HAS_OPENAI_LIB:
            try:
                self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            except Exception as e:
                print(f"[Agent Init] Warning: OpenAI configuration error: {e}")

        self._fallback_index = 0

    def classify_intent(self, user_message: str) -> UserIntent:
        """
        Agentic Intent Classification.
        
        Concept:
        Classifies incoming input into a discrete intent category to tailor
        downstream prompt templates and guardrail sensitivity.
        """
        text = user_message.lower()

        if any(w in text for w in ["kill myself", "suicide", "end it all", "don't want to live", "self-harm"]):
            return UserIntent.CRISIS_URGENT
        if any(w in text for w in ["breathe", "breathing", "exercise", "calm down", "meditation", "grounding"]):
            return UserIntent.COPING_EXERCISE
        if any(w in text for w in ["anxious", "panic", "worry", "stress", "stressed", "overwhelmed", "scared"]):
            return UserIntent.ANXIETY_STRESS
        if any(w in text for w in ["job", "work", "boss", "career", "deadline", "burnout", "manager"]):
            return UserIntent.WORK_BURNOUT
        if any(w in text for w in ["relationship", "boyfriend", "girlfriend", "partner", "friend", "lonely", "family"]):
            return UserIntent.RELATIONSHIP
        if any(w in text for w in ["sad", "depressed", "crying", "unhappy", "hopeless", "feel down"]):
            return UserIntent.VENTING
        
        return UserIntent.GENERAL

    def _get_fallback_reply(self, message: str) -> str:
        """
        Deterministic local response generator used if API calls fail or offline.
        """
        lower = message.lower()
        key = "default"
        if "stress" in lower or "overwhelm" in lower:
            key = "stress"
        elif "anxiet" in lower or "panic" in lower:
            key = "anxiety"
        elif "depress" in lower or "sad" in lower:
            key = "depression"
        elif "work" in lower or "job" in lower:
            key = "work"

        responses = FALLBACK_RESPONSES.get(key, FALLBACK_RESPONSES["default"])
        reply = responses[self._fallback_index % len(responses)]
        self._fallback_index += 1
        return reply

    def _prepare_history(self, messages: List[ChatMessage]) -> List[ChatMessage]:
        """
        Context Window Pruning.
        
        Concept:
        Keeps the last N messages to fit comfortably within the LLM context window,
        preventing latency degradation and runaway token costs.
        """
        max_turns = settings.MAX_CONVERSATION_HISTORY
        if len(messages) > max_turns:
            return messages[-max_turns:]
        return messages

    async def generate_response(self, messages: List[ChatMessage]) -> ChatResponse:
        """
        Synchronous / non-streaming complete response generation with full safety evaluation.
        """
        if not messages:
            return ChatResponse(message="Hello! I'm MindMate. How are you feeling today?")

        last_message = messages[-1].content
        
        # Step 1: Pre-execution Guardrail check
        safety_eval, override_message = SafetyGuardrails.inspect_input(last_message)
        if not safety_eval.is_safe and override_message:
            return ChatResponse(
                message=override_message,
                intent=UserIntent.CRISIS_URGENT if safety_eval.flagged_crisis else UserIntent.GENERAL,
                safety=safety_eval,
                sentiment_score=-1.0 if safety_eval.flagged_crisis else 0.0,
                model_used="safety-guardrail-interceptor"
            )

        # Step 2: Intent & Sentiment Classification
        intent = self.classify_intent(last_message)
        sentiment_score, detected_emotions, _ = SentimentAnalyzer.analyze(last_message)

        # Step 3: LLM Generation (Gemini -> OpenAI -> Local Fallback)
        response_text = ""
        model_used = "deterministic-fallback"

        # Try Gemini
        if self.gemini_configured:
            try:
                model = genai.GenerativeModel(
                    model_name=settings.DEFAULT_GEMINI_MODEL,
                    system_instruction=SYSTEM_PROMPT
                )
                
                # Format conversation history for Gemini API
                formatted_history = []
                for msg in self._prepare_history(messages[:-1]):
                    formatted_history.append({
                        "role": "model" if msg.role == MessageRole.ASSISTANT else "user",
                        "parts": [msg.content]
                    })
                
                chat = model.start_chat(history=formatted_history)
                llm_res = await asyncio.to_thread(chat.send_message, last_message)
                response_text = llm_res.text
                model_used = f"google/{settings.DEFAULT_GEMINI_MODEL}"
            except Exception as e:
                print(f"[Agent] Gemini generation error: {e}, attempting fallback...")

        # Try OpenAI if Gemini was not used or failed
        if not response_text and self.openai_client:
            try:
                openai_msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
                for msg in self._prepare_history(messages):
                    openai_msgs.append({"role": msg.role.value, "content": msg.content})

                completion = await self.openai_client.chat.completions.create(
                    model=settings.DEFAULT_OPENAI_MODEL,
                    messages=openai_msgs,
                    temperature=0.7,
                    max_tokens=300
                )
                response_text = completion.choices[0].message.content or ""
                model_used = f"openai/{settings.DEFAULT_OPENAI_MODEL}"
            except Exception as e:
                print(f"[Agent] OpenAI generation error: {e}, falling back to local heuristic...")

        # If external LLMs unavailable, use heuristic fallback
        if not response_text:
            response_text = self._get_fallback_reply(last_message)
            model_used = "mindmate-heuristic-engine"

        # Step 4: Post-processing sanitization guardrail
        final_text = SafetyGuardrails.sanitize_output(response_text)

        return ChatResponse(
            message=final_text,
            intent=intent,
            safety=safety_eval,
            sentiment_score=sentiment_score,
            detected_emotions=detected_emotions,
            model_used=model_used
        )

    async def stream_response(self, messages: List[ChatMessage]) -> AsyncGenerator[str, None]:
        """
        Real-time SSE Token Streamer.
        
        Concept:
        Streams token chunks asynchronously as they are generated. 
        Yields plain text chunks for Server-Sent Events (SSE) consumption.
        """
        if not messages:
            yield "Hello! I'm MindMate. How can I support you today?"
            return

        last_message = messages[-1].content

        # Step 1: Pre-execution Guardrail check
        safety_eval, override_message = SafetyGuardrails.inspect_input(last_message)
        if not safety_eval.is_safe and override_message:
            # Stream override message with natural typing cadence
            for word in override_message.split(" "):
                yield word + " "
                await asyncio.sleep(0.02)
            return

        # Step 2: Stream via Gemini if available
        if self.gemini_configured:
            try:
                model = genai.GenerativeModel(
                    model_name=settings.DEFAULT_GEMINI_MODEL,
                    system_instruction=SYSTEM_PROMPT
                )
                
                formatted_history = []
                for msg in self._prepare_history(messages[:-1]):
                    formatted_history.append({
                        "role": "model" if msg.role == MessageRole.ASSISTANT else "user",
                        "parts": [msg.content]
                    })
                
                chat = model.start_chat(history=formatted_history)
                response = chat.send_message(last_message, stream=True)
                
                for chunk in response:
                    if chunk.text:
                        yield chunk.text
                        await asyncio.sleep(0.01)
                return
            except Exception as e:
                print(f"[Agent Stream] Gemini streaming error: {e}, falling back to local stream...")

        # Step 3: Stream via OpenAI if Gemini unavailable
        if self.openai_client:
            try:
                openai_msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
                for msg in self._prepare_history(messages):
                    openai_msgs.append({"role": msg.role.value, "content": msg.content})

                stream = await self.openai_client.chat.completions.create(
                    model=settings.DEFAULT_OPENAI_MODEL,
                    messages=openai_msgs,
                    temperature=0.7,
                    stream=True
                )
                async for chunk in stream:
                    content = chunk.choices[0].delta.content
                    if content:
                        yield content
                return
            except Exception as e:
                print(f"[Agent Stream] OpenAI streaming error: {e}, falling back...")

        # Step 4: Stream heuristic fallback response token-by-token
        fallback_text = self._get_fallback_reply(last_message)
        for char in fallback_text:
            yield char
            await asyncio.sleep(0.02)


# Singleton instance of the agent
agent_instance = TherapistAgent()
