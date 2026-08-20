/**
 * Next.js API Route Handler: Chat Orchestrator & BFF (Backend-For-Frontend)
 *
 * Concept Explanation:
 * --------------------
 * In modern web architectures, the Next.js API route acts as a "Backend-for-Frontend" (BFF) proxy.
 * It coordinates communication between the browser client and backend microservices (FastAPI / Gemini LLM).
 *
 * Fallback & Resilience Strategy (High Availability):
 * 1. Primary: Forward the chat stream request to the dedicated Python FastAPI Backend (`http://localhost:8000/api/v1/chat/stream`).
 * 2. Secondary: If FastAPI is offline or not deployed, directly invoke Google's Gemini SDK in Node.js.
 * 3. Tertiary: If external API limits or network issues occur, trigger a deterministic local heuristic response generator.
 *
 * This guarantees 100% service uptime during live demos and interviews without crashes.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Configures maximum serverless execution duration (30 seconds)
export const maxDuration = 30;

// Configurable FastAPI backend URL (defaults to standard local port 8000)
const FASTAPI_BACKEND_URL = process.env.FASTAPI_BACKEND_URL || "http://127.0.0.1:8000/api/v1/chat/stream";

/**
 * Deterministic Topic-Based Fallback Responses
 *
 * Concept:
 * When third-party AI APIs face rate limits, network outages, or missing credentials,
 * having a localized rule-based engine ensures the user still receives helpful, empathetic support.
 */
const keywordResponses: Record<string, string[]> = {
  stress: [
    "Stress can be overwhelming. Have you tried breaking your tasks into smaller, manageable pieces?",
    "I hear you're under stress. What's one thing you could do today to relieve even a little of that pressure?",
    "Stress management is important. Have you considered techniques like deep breathing or meditation?",
  ],
  anxiety: [
    "Anxiety can feel very real. Sometimes grounding techniques help - can you name 5 things you see around you?",
    "That anxiety sounds challenging. Have you found any calming activities that help you?",
    "Anxiety is common, and it's great you're talking about it. What triggers your anxiety most?",
  ],
  depression: [
    "I'm sorry you're feeling this way. Speaking with someone is a positive step. How long have you felt this?",
    "Depression is serious. Have you been able to engage in activities you usually enjoy?",
    "It's important to reach out, like you're doing now. What would even a small improvement look like for you?",
  ],
  work: [
    "Work can be demanding. What aspects of your job are most challenging right now?",
    "Career concerns are real. Do you feel supported in your workplace?",
    "Work-life balance is important. How much time are you spending on work versus personal time?",
  ],
  relationship: [
    "Relationships are complex. What's the main challenge you're facing?",
    "Communication is key in relationships. How do you usually handle conflicts?",
    "It sounds like there's tension. Have you been able to talk openly with the other person?",
  ],
  help: [
    "I'm here to help! You can ask me for advice, solutions to problems, or just to talk things through.",
    "I can help with a wide range of topics. What would you like to explore?",
    "Feel free to ask me anything - I'm here to support you and provide helpful guidance.",
  ],
  hello: [
    "Hello! I'm happy to chat with you. What's on your mind today?",
    "Hi there! Feel free to share anything you'd like to talk about.",
    "Hey! How can I help you today?",
  ],
  game: [
    "Great idea! I have a Games section where you can play mini-games. Click the gamepad icon to check them out!",
    "Games can be a fun way to unwind! You'll find several arcade and puzzle games available.",
    "Want to take a break and play? I have games for you - just tap the game controller button!",
  ],
};

let responseIndex = 0;

/**
 * Evaluates the user's message against keywords to select a tailored fallback response.
 *
 * @param userMessage - The latest message text sent by the user
 * @returns An empathetic string response
 */
function getKeywordResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  for (const [keyword, responses] of Object.entries(keywordResponses)) {
    if (lowerMessage.includes(keyword)) {
      const response = responses[responseIndex % responses.length];
      responseIndex++;
      return response;
    }
  }

  const defaultResponses = [
    "That's an interesting point. Can you tell me more about that?",
    "I'd like to understand better. What specifically is on your mind?",
    "That sounds important to you. What do you think is the best way forward?",
    "I'm listening. What would help you most right now?",
    "That's worth exploring. Have you thought about what you'd like to change?",
  ];

  const response = defaultResponses[responseIndex % defaultResponses.length];
  responseIndex++;
  return response;
}

/**
 * System instruction defining the personality and safety boundaries for Gemini.
 */
const systemPrompt = `You are MindMate, a warm, empathetic, and supportive AI mental health companion.
Your goal is to listen non-judgmentally, offer general coping strategies (like mindfulness, box breathing, or journaling), and act as a safe space for the user to share their thoughts.
IMPORTANT RULES:
1. You are NOT a licensed therapist or a replacement for professional clinical care. Do not diagnose conditions or prescribe treatments.
2. Keep your responses concise, comforting, and focused on open-ended listening.
3. If the user expresses thoughts of self-harm, suicide, or severe crisis, gently encourage them to reach out to a professional or use the Suicide & Crisis Lifeline (988). Remind them that they are not alone.
4. Keep the tone warm, conversational, and caring.`;

/**
 * Next.js App Router POST Handler
 *
 * Receives the chat history, attempts streaming via FastAPI Backend,
 * then falls back to Node Gemini SDK, and finally to local heuristics.
 */
export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1]?.content || "";

  // --------------------------------------------------------------------------
  // STEP 1: Attempt to stream from the FastAPI Backend Microservice
  // --------------------------------------------------------------------------
  try {
    const fastApiResponse = await fetch(FASTAPI_BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
        stream: true,
      }),
      // Fast timeout: if FastAPI backend isn't running locally, fail fast to next layer
      signal: AbortSignal.timeout(3000),
    });

    if (fastApiResponse.ok && fastApiResponse.body) {
      // Forward the backend event stream directly to the frontend browser
      return new Response(fastApiResponse.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Backend-Source": "fastapi-microservice",
        },
      });
    }
  } catch (backendError) {
    // FastAPI server is offline or unreachable; smoothly fall through to direct Gemini SDK
    console.log("[Chat Proxy] FastAPI backend unavailable, transitioning to direct Gemini SDK...");
  }

  // --------------------------------------------------------------------------
  // STEP 2: Direct Google Gemini SDK Invocation (Edge / Node.js)
  // --------------------------------------------------------------------------
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt,
      });

      // Prepare conversation history in Gemini's expected format
      const history = messages.slice(0, -1).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessageStream(lastMessage);

      const encoder = new TextEncoder();

      // Create a ReadableStream that enqueues chunks as Gemini produces them
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            }
          } catch (streamErr) {
            console.error("Stream generation error:", streamErr);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Backend-Source": "direct-gemini-sdk",
        },
      });
    } catch (error: any) {
      console.error("Gemini API call error, falling back to local response:", error);
    }
  }

  // --------------------------------------------------------------------------
  // STEP 3: Local Deterministic Heuristic Streamer (Zero-Dependency Fallback)
  // --------------------------------------------------------------------------
  try {
    const demoResponse = getKeywordResponse(lastMessage);
    const encoder = new TextEncoder();
    let charIndex = 0;

    const stream = new ReadableStream({
      start(controller) {
        // Simulates natural typing cadence (30ms per character)
        const interval = setInterval(() => {
          if (charIndex < demoResponse.length) {
            controller.enqueue(encoder.encode(demoResponse[charIndex]));
            charIndex++;
          } else {
            clearInterval(interval);
            controller.close();
          }
        }, 25);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Backend-Source": "local-fallback-engine",
      },
    });
  } catch (error: any) {
    console.error("[Chat] Fallback error:", error);

    return new Response(
      JSON.stringify({ error: "Failed to generate response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
