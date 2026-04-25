export const maxDuration = 30;

// Keyword-based demo responses for different topics
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

function getKeywordResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // Check for keywords
  for (const [keyword, responses] of Object.entries(keywordResponses)) {
    if (lowerMessage.includes(keyword)) {
      const response = responses[responseIndex % responses.length];
      responseIndex++;
      return response;
    }
  }

  // Default response if no keywords match
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

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    // Get the last user message to determine context
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const demoResponse = getKeywordResponse(lastUserMessage);

    // Create a stream that simulates typing
    const encoder = new TextEncoder();
    let charIndex = 0;

    const stream = new ReadableStream({
      start(controller) {
        // Simulate character-by-character streaming for typing effect
        const interval = setInterval(() => {
          if (charIndex < demoResponse.length) {
            controller.enqueue(encoder.encode(demoResponse[charIndex]));
            charIndex++;
          } else {
            clearInterval(interval);
            controller.close();
          }
        }, 30); // Typing speed
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (error: any) {
    console.error("[v0] Chat demo error:", error);

    return new Response(
      JSON.stringify({ error: "Failed to generate demo response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
