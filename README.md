# 🧠 MindMate – AI Mental Health Companion

> Anonymous, empathetic AI mental health support. Chat, play games, and find calm — no account needed.

![MindMate](https://img.shields.io/badge/MindMate-AI%20Companion-orange?style=for-the-badge&logo=brain)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📖 Overview

MindMate is a web-based mental health support application that provides:
- **Anonymous AI Chat** — no account, no data stored, no judgment
- **Evidence-based techniques** — CBT-inspired responses, breathing exercises
- **Mindful Games Arcade** — take a break with therapeutic and classic mini-games
- **Research Documentation** — in-app paper on the science behind AI-assisted mental health

Built as an academic research project by students of **Parvatibai Genba Sopanrao Moze College of Engineering, Pune**.

---

## ✨ Features

### 💬 Anonymous Chat
- AI companion powered by keyword-aware responses (Gemini-ready architecture)
- **Quick action chips** — one-tap prompts for common feelings
- **Typing animation** — real-time streaming character-by-character response
- **Message timestamps**
- **Crisis helpline banner** — immediate access to 988 (Suicide & Crisis Lifeline)
- **Enter to send** keyboard shortcut · Shift+Enter for new line
- Fully anonymous — no login, no account, no tracking

### 🎮 MindMate Arcade (23 Games)

#### 🧘 Wellness Games (NEW)
| Game | Description |
|------|-------------|
| **Box Breathing** | 4-4-4-4 animated breathing circle for anxiety relief |
| **Aim Trainer** | Click targets to sharpen focus and coordination |
| **Number Memory** | Memorize growing digit sequences — cognitive exercise |

#### 🕹️ Classic Arcade
Snake, Pong, Breakout, Flappy Triangle, Sheep Run, Coin Collector, Bubble Pop

#### 🧩 Puzzle
2048, Tetris, Memory Match, Minesweeper, Word Scramble

#### ⚔️ Strategy
Tic Tac Toe, Connect Four, Orbit Defense

#### ⚡ Action
Reaction Time, Whack-a-Mole, Simon Says, Color Match, Space Invaders

### 😊 Mood Widget
- Daily mood check-in on home screen
- Stores mood locally — no server needed
- 5 emoji states from 😔 to 😊

### 📄 Research Docs
- Full academic paper on AI-powered mental health chatbots
- Collapsible sections with table of contents

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | TailwindCSS 4 |
| **UI Components** | shadcn/ui + Radix UI |
| **Animations** | Framer Motion |
| **Shader Effects** | @paper-design/shaders-react |
| **Fonts** | Figtree + Instrument Serif (Google Fonts) + Geist Mono |
| **Icons** | Lucide React |
| **AI Ready** | @ai-sdk/google, @google/generative-ai |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/mindmate.git
cd mindmate

# Install dependencies (legacy-peer-deps needed for React 19 + Next 14)
npm install --legacy-peer-deps

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (Optional)

To enable real AI responses via Google Gemini, create a `.env.local` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

> Without this key, the app uses built-in keyword-based demo responses — perfect for offline use.

---

## 📁 Project Structure

```
mindmate/
├── app/
│   ├── api/chat/          # Chat API route (streaming responses)
│   ├── chat/              # Chat page
│   ├── docs/              # Research paper page
│   ├── games/             # Games arcade page
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout + metadata
│
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── chat-interface.tsx # Main chat UI with quick actions + crisis banner
│   ├── game-dashboard.tsx # Games arcade with 23 games
│   ├── breathing-game.tsx # Box breathing therapeutic game
│   ├── aim-trainer-game.tsx    # Focus training game
│   ├── number-memory-game.tsx  # Cognitive memory game
│   ├── game-placeholder.tsx    # "Coming Soon" stub for future games
│   ├── mood-widget.tsx    # Daily mood check-in widget
│   ├── header.tsx         # Navigation header
│   ├── hero-content.tsx   # Landing page hero section
│   ├── pulsing-circle.tsx # Animated background element
│   └── shader-background.tsx   # WebGL shader background
│
├── hooks/
│   ├── use-chat-hook.ts   # Custom chat state + streaming logic
│   └── use-mobile.ts      # Mobile detection hook
│
└── lib/
    └── utils.ts           # Utility functions
```

---

## 🧪 AI Chat Architecture

The chat API (`/api/chat`) currently uses **keyword-based responses** that stream character-by-character for a realistic typing effect. It recognizes topics including:

- `stress`, `anxiety`, `depression` → empathetic mental health responses
- `work`, `relationship` → situational guidance
- `hello`, `help`, `game` → contextual responses

### Upgrading to Real Gemini AI

Replace the route logic in `app/api/chat/route.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export async function POST(req: Request) {
  const { messages } = await req.json()
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  
  const result = await model.generateContentStream(
    messages.map(m => m.content).join('\n')
  )
  
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        controller.enqueue(new TextEncoder().encode(chunk.text()))
      }
      controller.close()
    }
  })

  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
}
```

---

## 🔒 Privacy & Ethics

- **No authentication** — fully anonymous by design
- **No user data stored** — conversations exist only in browser memory
- **Mood data** — stored only in `localStorage`, never sent to any server
- **Crisis resources** — 988 helpline prominently displayed
- **AI disclaimer** — clearly states MindMate supplements, not replaces, professional care

---

## 📚 Research & Academic Context

This project is based on a research paper: **"MindMate: An AI-Powered Chatbot for Mental Health Support"**

**Authors:** Sumedh Chandanshive, Ketan Choraghe, Tejas Khairnar, Krushna Bayas  
**Institution:** Parvatibai Genba Sopanrao Moze College of Engineering, Wagholi Pune 412207  
**Advisor:** Prof. Vrushali Dhanokar

Key references:
- Woebot randomized trial: AI CBT chatbots reduce anxiety and depression
- WHO: 1 billion+ people worldwide live with anxiety/depression
- Stanford findings on LLM chatbot safety in mental health contexts

View the full paper at [/docs](http://localhost:3000/docs) in the running app.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-game`
3. Commit changes: `git commit -m 'Add: new game component'`
4. Push to branch: `git push origin feature/new-game`
5. Open a Pull Request

---

## ⚠️ Disclaimer

MindMate is a research project and is **not a replacement for professional mental health care**. If you are experiencing a mental health crisis, please contact:

- **988 Suicide & Crisis Lifeline** — Call or text `988` (US)
- **Crisis Text Line** — Text HOME to `741741`
- **International Association for Suicide Prevention** — https://www.iasp.info/resources/Crisis_Centres/

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Made with 💙 for mental wellness
  <br />
  <sub>MindMate · Evidence-based · Anonymous · Always available</sub>
</div>
