import GameDashboard from "@/components/game-dashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "MindMate – Arcade Games",
  description: "Play mini games to relax, focus, and reset your mind. Includes breathing exercises, aim trainer, memory games, and more.",
}

export default function GamesPage() {
  return <GameDashboard />
}
