"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Brain, RotateCcw } from "lucide-react"

interface NumberMemoryGameProps {
  onBack: () => void
  themeColor?: string
}

type Phase = "show" | "input" | "correct" | "wrong"

function generateSequence(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("")
}

export default function NumberMemoryGame({ onBack }: NumberMemoryGameProps) {
  const [gameState, setGameState] = useState<"idle" | "playing" | "done">("idle")
  const [phase, setPhase] = useState<Phase>("show")
  const [level, setLevel] = useState(1)
  const [bestLevel, setBestLevel] = useState(0)
  const [sequence, setSequence] = useState("")
  const [userInput, setUserInput] = useState("")
  const [showTimer, setShowTimer] = useState(0)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [attempts, setAttempts] = useState(0)

  const startLevel = useCallback((lvl: number) => {
    const seq = generateSequence(lvl)
    setSequence(seq)
    setUserInput("")
    setPhase("show")
    setFeedback(null)
    const displayTime = Math.max(1500, lvl * 600)
    setShowTimer(Math.ceil(displayTime / 1000))

    const countdown = setInterval(() => {
      setShowTimer((t) => {
        if (t <= 1) {
          clearInterval(countdown)
          return 0
        }
        return t - 1
      })
    }, 1000)

    setTimeout(() => {
      setPhase("input")
    }, displayTime)
  }, [])

  const startGame = useCallback(() => {
    setGameState("playing")
    setLevel(1)
    setAttempts(0)
    startLevel(1)
  }, [startLevel])

  const handleSubmit = () => {
    if (userInput === sequence) {
      setFeedback("correct")
      const nextLevel = level + 1
      setBestLevel((b) => Math.max(b, level))
      setTimeout(() => {
        setLevel(nextLevel)
        startLevel(nextLevel)
      }, 1200)
    } else {
      setFeedback("wrong")
      setAttempts((a) => a + 1)
      setBestLevel((b) => Math.max(b, level - 1))
      setTimeout(() => {
        setGameState("done")
      }, 2000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userInput.length > 0) {
      handleSubmit()
    }
  }

  const displaySequence = (seq: string) => {
    // Group in chunks of 3 for readability
    return seq.match(/.{1,3}/g)?.join(" ") ?? seq
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Button onClick={onBack} variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <h1 className="text-white font-bold text-lg">Number Memory</h1>
        </div>
        <div className="text-sm text-white/40">Best: Level <span className="text-white/70 font-bold">{bestLevel}</span></div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        {gameState === "idle" && (
          <div className="text-center max-w-sm">
            <div className="text-7xl mb-6">🔢</div>
            <h2 className="text-3xl font-bold text-white mb-3">Number Memory</h2>
            <p className="text-white/50 mb-2">Memorize the number sequence, then type it back.</p>
            <p className="text-white/30 text-sm mb-8">Sequences grow longer each level — how far can you go?</p>
            <Button
              onClick={startGame}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full px-8 py-3"
            >
              Start Game
            </Button>
          </div>
        )}

        {gameState === "playing" && (
          <div className="text-center w-full max-w-md">
            {/* Level indicator */}
            <div className="mb-6">
              <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">Level {level}</span>
              <div className="text-white/30 text-xs mt-1">{level} digit{level !== 1 ? "s" : ""}</div>
            </div>

            {phase === "show" && (
              <div className="space-y-8">
                <div
                  className="text-5xl sm:text-6xl font-bold text-white tracking-widest py-10 px-6 rounded-2xl"
                  style={{
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    letterSpacing: "0.15em",
                  }}
                >
                  {displaySequence(sequence)}
                </div>
                <div className="flex items-center justify-center gap-2 text-white/40">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-purple-500 flex items-center justify-center text-xs font-bold text-purple-400"
                  >
                    {showTimer}
                  </div>
                  <span className="text-sm">Memorize!</span>
                </div>
              </div>
            )}

            {phase === "input" && (
              <div className="space-y-6">
                <p className="text-white/60 text-sm">What was the number?</p>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoFocus
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={handleKeyDown}
                  className={`w-full text-center text-3xl font-bold py-6 px-4 rounded-2xl bg-white/5 border outline-none transition-all ${
                    feedback === "correct"
                      ? "border-green-500 text-green-400"
                      : feedback === "wrong"
                      ? "border-red-500 text-red-400"
                      : "border-white/20 text-white focus:border-purple-500"
                  }`}
                  placeholder="Type the number..."
                  disabled={feedback !== null}
                />

                {feedback === null && (
                  <Button
                    onClick={handleSubmit}
                    disabled={userInput.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full py-3 disabled:opacity-40"
                  >
                    Submit
                  </Button>
                )}

                {feedback === "correct" && (
                  <div className="text-green-400 font-semibold animate-pulse">✓ Correct! Next level...</div>
                )}
                {feedback === "wrong" && (
                  <div className="space-y-1">
                    <div className="text-red-400 font-semibold">✗ Wrong!</div>
                    <div className="text-white/40 text-sm">
                      The sequence was: <span className="text-white font-mono">{displaySequence(sequence)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {gameState === "done" && (
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
            <p className="text-white/50 mb-1">
              You reached <span className="text-purple-400 font-bold text-xl">Level {level}</span>
            </p>
            {level === bestLevel + 1 || bestLevel === 0 ? (
              <p className="text-yellow-400 text-sm font-semibold mt-1">🏆 New Personal Best!</p>
            ) : (
              <p className="text-white/30 text-sm mt-1">Personal Best: Level {bestLevel}</p>
            )}

            <div className="mt-8 flex gap-3 justify-center">
              <Button
                onClick={startGame}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full px-6"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
