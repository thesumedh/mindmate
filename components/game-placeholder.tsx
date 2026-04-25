"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Construction } from "lucide-react"

interface GamePlaceholderProps {
  onBack: () => void
  themeColor?: string
  gameName?: string
}

export default function GamePlaceholder({ onBack, themeColor = "#6366f1", gameName = "Game" }: GamePlaceholderProps) {
  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6"
      style={{ background: "radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0a 100%)" }}
    >
      <div
        className="p-6 rounded-full"
        style={{ background: `${themeColor}22`, border: `2px solid ${themeColor}44` }}
      >
        <Construction className="w-12 h-12" style={{ color: themeColor }} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{gameName}</h2>
        <p className="text-white/40 text-sm max-w-xs">
          This game is coming soon! Check back later for more fun.
        </p>
      </div>
      <Button
        onClick={onBack}
        variant="outline"
        className="border-white/20 text-white hover:bg-white/10 rounded-full"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Games
      </Button>
    </div>
  )
}
