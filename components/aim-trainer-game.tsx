"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Target, RotateCcw, Zap } from "lucide-react"

interface AimTrainerGameProps {
  onBack: () => void
  themeColor?: string
}

interface TargetObj {
  id: number
  x: number
  y: number
  size: number
  color: string
}

const COLORS = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#fb923c"]
const ROUND_DURATION = 30
const BASE_TARGET_TTL = 1200 // ms

export default function AimTrainerGame({ onBack }: AimTrainerGameProps) {
  const [gameState, setGameState] = useState<"idle" | "playing" | "done">("idle")
  const [targets, setTargets] = useState<TargetObj[]>([])
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION)
  const [bestScore, setBestScore] = useState(0)
  const counterRef = useRef(0)
  const areaRef = useRef<HTMLDivElement>(null)
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const spawnTarget = useCallback(() => {
    if (!areaRef.current) return
    const rect = areaRef.current.getBoundingClientRect()
    const size = 40 + Math.random() * 40
    const x = size / 2 + Math.random() * (rect.width - size)
    const y = size / 2 + Math.random() * (rect.height - size)
    const id = counterRef.current++
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]

    setTargets((prev) => [...prev, { id, x, y, size, color }])

    // Auto-remove (miss) after TTL
    setTimeout(() => {
      setTargets((prev) => {
        const exists = prev.some((t) => t.id === id)
        if (exists) {
          setMisses((m) => m + 1)
          return prev.filter((t) => t.id !== id)
        }
        return prev
      })
    }, BASE_TARGET_TTL)
  }, [])

  const startGame = useCallback(() => {
    setGameState("playing")
    setScore(0)
    setMisses(0)
    setTimeLeft(ROUND_DURATION)
    setTargets([])
    counterRef.current = 0

    spawnRef.current = setInterval(spawnTarget, 800)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(spawnRef.current!)
          clearInterval(timerRef.current!)
          setGameState("done")
          setScore((s) => {
            setBestScore((b) => Math.max(b, s))
            return s
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
  }, [spawnTarget])

  useEffect(() => {
    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const hitTarget = (id: number) => {
    setTargets((prev) => prev.filter((t) => t.id !== id))
    setScore((s) => s + 1)
  }

  const accuracy = score + misses === 0 ? 0 : Math.round((score / (score + misses)) * 100)

  return (
    <div className="w-full min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Button onClick={onBack} variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <h1 className="text-white font-bold text-lg">Aim Trainer</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {gameState === "playing" && (
            <>
              <span className="text-white/60">Score: <span className="text-white font-bold">{score}</span></span>
              <span className="text-red-400">Misses: <span className="font-bold">{misses}</span></span>
              <span className="text-yellow-400 font-mono font-bold">{timeLeft}s</span>
            </>
          )}
          <span className="text-white/40 text-xs">Best: {bestScore}</span>
        </div>
      </div>

      {/* Game Area */}
      <div
        ref={areaRef}
        className="flex-1 relative cursor-crosshair select-none"
        style={{ background: "radial-gradient(ellipse at center, #111827 0%, #030712 100%)" }}
        onClick={() => {
          if (gameState === "playing") setMisses((m) => m + 1)
        }}
      >
        {/* Idle / Done overlay */}
        {gameState !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10">
            {gameState === "done" ? (
              <>
                <div className="text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h2 className="text-3xl font-bold text-white mb-2">Round Over!</h2>
                  <p className="text-white/60 mb-1">Score: <span className="text-white font-bold text-2xl">{score}</span></p>
                  <p className="text-white/40 text-sm">Accuracy: {accuracy}% · Misses: {misses}</p>
                  {score === bestScore && score > 0 && (
                    <p className="text-yellow-400 text-sm mt-2 font-semibold">🏆 New Best!</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button onClick={startGame} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full px-6">
                    <RotateCcw className="w-4 h-4 mr-2" /> Play Again
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <Target className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-2">Aim Trainer</h2>
                  <p className="text-white/50 mb-1">Click targets before they disappear</p>
                  <p className="text-white/30 text-sm">{ROUND_DURATION} seconds · avoid missing!</p>
                </div>
                <Button onClick={startGame} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full px-8 py-3">
                  Start Round
                </Button>
              </>
            )}
          </div>
        )}

        {/* Targets */}
        {targets.map((t) => (
          <button
            key={t.id}
            onClick={(e) => {
              e.stopPropagation()
              hitTarget(t.id)
            }}
            className="absolute rounded-full flex items-center justify-center transition-all hover:brightness-125 active:scale-90"
            style={{
              left: t.x - t.size / 2,
              top: t.y - t.size / 2,
              width: t.size,
              height: t.size,
              background: t.color,
              boxShadow: `0 0 20px ${t.color}88, 0 0 6px ${t.color}`,
              animation: "pop-in 0.15s ease-out",
            }}
          >
            <div className="w-1/3 h-1/3 rounded-full bg-white/30" />
          </button>
        ))}

        {/* Timer arc overlay when playing */}
        {gameState === "playing" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className="text-white/20 text-xs text-center">
              Targets hit: <span className="text-white/60 font-bold">{score}</span>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes pop-in {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
