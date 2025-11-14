export const maxDuration = 30;

// Mock responses for demo purposes
const demoResponses = [
  "That sounds challenging. Can you tell me more about what you've been experiencing?",
  "I'm hearing that this has been difficult for you. What's been the most challenging part?",
  "It's important that you're taking time to reflect on this. How are you feeling about it right now?",
  "That's a really insightful observation. Have you thought about what might help in this situation?",
  "It sounds like you're carrying quite a bit. Let's explore this together - what would feel most helpful to focus on?",
  "Thank you for sharing that with me. I'm curious - what do you think might be a first step forward?",
  "I appreciate your openness. Sometimes when we're facing challenges, it helps to break them down. What feels most urgent?",
  "That takes courage to recognize. Have you been able to talk to anyone else about this?",
  "I notice something important in what you've shared. How do you think this might be connected to other areas of your life?",
  "That's valuable self-awareness. What would change if you approached this differently?",
];

let responseIndex = 0;

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    // Simulate a thoughtful therapist response
    const demoResponse = demoResponses[responseIndex % demoResponses.length];
    responseIndex++;

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
        }, 30); // Adjust speed here (lower = faster)
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
