"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Wind, RotateCcw } from "lucide-react"

interface BreathingGameProps {
  onBack: () => void
  themeColor?: string
}

type Phase = "inhale" | "hold-in" | "exhale" | "hold-out" | "idle"

const PHASES: { phase: Phase; label: string; duration: number; color: string }[] = [
  { phase: "inhale",   label: "Inhale",   duration: 4, color: "#60a5fa" },
  { phase: "hold-in",  label: "Hold",     duration: 4, color: "#a78bfa" },
  { phase: "exhale",   label: "Exhale",   duration: 4, color: "#34d399" },
  { phase: "hold-out", label: "Hold",     duration: 4, color: "#f9a8d4" },
]

export default function BreathingGame({ onBack }: BreathingGameProps) {
  const [started, setStarted] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [cycles, setCycles] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentPhase = PHASES[phaseIndex]
  const progress = elapsed / currentPhase.duration // 0–1

  const tick = useCallback(() => {
    setElapsed((prev) => {
      const next = prev + 0.05
      if (next >= currentPhase.duration) {
        setPhaseIndex((pi) => {
          const nextPi = (pi + 1) % PHASES.length
          if (nextPi === 0) setCycles((c) => c + 1)
          return nextPi
        })
        return 0
      }
      return next
    })
  }, [currentPhase.duration])

  useEffect(() => {
    if (started) {
      intervalRef.current = setInterval(tick, 50)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [started, tick])

  const circleScale = (() => {
    switch (currentPhase.phase) {
      case "inhale":   return 0.55 + progress * 0.45
      case "hold-in":  return 1
      case "exhale":   return 1 - progress * 0.45
      case "hold-out": return 0.55
    }
  })()

  const timeLeft = Math.ceil(currentPhase.duration - elapsed)

  const reset = () => {
    setStarted(false)
    setPhaseIndex(0)
    setElapsed(0)
    setCycles(0)
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Back button */}
      <Button
        onClick={onBack}
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 text-white/60 hover:text-white hover:bg-white/10"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wind className="w-5 h-5 text-blue-400" />
          <h1 className="text-2xl font-semibold text-white">Box Breathing</h1>
        </div>
        <p className="text-white/50 text-sm">4-4-4-4 breathing to calm your nervous system</p>
        <div className="mt-3 text-white/70 text-sm font-medium">
          Cycles completed: <span className="text-blue-400 font-bold text-lg">{cycles}</span>
        </div>
      </div>

      {/* Animated Circle */}
      <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
        {/* Outer glow ring */}
        <div
          className="absolute rounded-full transition-all"
          style={{
            width: 280,
            height: 280,
            background: `radial-gradient(circle, ${currentPhase.color}22 0%, transparent 70%)`,
            transform: `scale(${circleScale})`,
            transition: "transform 0.05s linear, background 0.8s ease",
          }}
        />

        {/* Main breathing circle */}
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: 200,
            height: 200,
            background: `radial-gradient(circle at 35% 35%, ${currentPhase.color}dd, ${currentPhase.color}66)`,
            boxShadow: `0 0 60px ${currentPhase.color}55, 0 0 20px ${currentPhase.color}33`,
            transform: `scale(${circleScale})`,
            transition: "transform 0.05s linear, background 0.8s ease, box-shadow 0.8s ease",
          }}
        >
          <div className="text-center">
            <div className="text-white font-bold text-4xl">{started ? timeLeft : ""}</div>
          </div>
        </div>

        {/* Phase label */}
        <div className="absolute -bottom-12 text-center">
          <div
            className="text-xl font-semibold transition-all duration-500"
            style={{ color: started ? currentPhase.color : "rgba(255,255,255,0.4)" }}
          >
            {started ? currentPhase.label : "Ready?"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-24 flex gap-4">
        {!started ? (
          <Button
            onClick={() => setStarted(true)}
            className="px-8 py-3 rounded-full font-medium text-sm"
            style={{ background: currentPhase.color, color: "#1e1b4b" }}
          >
            Begin Breathing
          </Button>
        ) : (
          <Button
            onClick={reset}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 rounded-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 max-w-xs text-center">
        <p className="text-white/30 text-xs leading-relaxed">
          Follow the circle: expand while it grows, hold when it's still, release as it shrinks. Repeat for 5+ cycles for maximum calm.
        </p>
      </div>

      {/* Phase indicators */}
      <div className="mt-6 flex gap-3">
        {PHASES.map((p, i) => (
          <div
            key={p.phase}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="w-3 h-3 rounded-full transition-all duration-500"
              style={{
                background: started && i === phaseIndex ? p.color : "rgba(255,255,255,0.15)",
                boxShadow: started && i === phaseIndex ? `0 0 8px ${p.color}` : "none",
              }}
            />
            <span className="text-white/30 text-xs">{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
