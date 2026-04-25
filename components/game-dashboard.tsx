"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import SnakeGame from "./snake-game"
import TicTacToeGame from "./tic-tac-toe-game"
import MemoryMatchGame from "./memory-match-game"
import MinesweeperGame from "./minesweeper-game"
import ReactionGame from "./reaction-game"
import {
  ArrowLeft,
  Play,
  Triangle,
  PawPrint,
  Grid3X3,
  Gamepad2,
  Timer,
  Zap,
  Target,
  Square,
  Palette,
  Rocket,
  Brain,
  Bomb,
  BookOpen,
  Sparkles,
  Coins,
  Circle,
  Wind,
  Hash,
} from "lucide-react"
import GamePlaceholder from "./game-placeholder"
import BreathingGame from "./breathing-game"
import AimTrainerGame from "./aim-trainer-game"
import NumberMemoryGame from "./number-memory-game"

type GameType =
  | "menu"
  | "breathing"
  | "aim-trainer"
  | "number-memory"
  | "2048"
  | "simon-says"
  | "whack-a-mole"
  | "coin-collector"
  | "bubble-pop"
  | "word-scramble"
  | "flappy"
  | "dino"
  | "snake"
  | "pong"
  | "reaction"
  | "tetris"
  | "breakout"
  | "orbit-defense"
  | "color-match"
  | "space-invaders"
  | "tic-tac-toe"
  | "memory-match"
  | "minesweeper"
  | "connect-four"

type Category = "All" | "Wellness" | "Arcade" | "Puzzle" | "Strategy" | "Action"

export default function GameDashboard() {
  const [currentGame, setCurrentGame] = useState<GameType>("menu")
  const [selectedCategory, setSelectedCategory] = useState<Category>("All")

  const games = [
    // ── Wellness (new therapeutic games) ──────────────────────────
    {
      id: "breathing" as const,
      title: "Box Breathing",
      description: "Follow the 4-4-4-4 breathing pattern to calm your mind and body.",
      icon: Wind,
      color: "bg-blue-500",
      themeColor: "#60a5fa",
      category: "Wellness" as const,
      isNew: true,
    },
    {
      id: "aim-trainer" as const,
      title: "Aim Trainer",
      description: "Click targets before they disappear — sharpen your focus and reflexes.",
      icon: Target,
      color: "bg-yellow-500",
      themeColor: "#fbbf24",
      category: "Wellness" as const,
      isNew: true,
    },
    {
      id: "number-memory" as const,
      title: "Number Memory",
      description: "Memorize growing digit sequences — a fun cognitive exercise.",
      icon: Hash,
      color: "bg-purple-600",
      themeColor: "#a78bfa",
      category: "Wellness" as const,
      isNew: true,
    },
    // ── Puzzle ────────────────────────────────────────────────────
    {
      id: "2048" as const,
      title: "2048",
      description: "Slide numbered tiles to reach 2048 - addictive puzzle challenge!",
      icon: Grid3X3,
      color: "bg-amber-500",
      themeColor: "#f59e0b",
      category: "Puzzle" as const,
    },
    {
      id: "word-scramble" as const,
      title: "Word Scramble",
      description: "Unscramble letters to form words quickly.",
      icon: BookOpen,
      color: "bg-purple-500",
      themeColor: "#8b5cf6",
      category: "Puzzle" as const,
    },
    {
      id: "memory-match" as const,
      title: "Memory Match",
      description: "Match pairs of cards with memory.",
      icon: Brain,
      color: "bg-pink-500",
      themeColor: "#ec4899",
      category: "Puzzle" as const,
    },
    {
      id: "minesweeper" as const,
      title: "Minesweeper",
      description: "Clear the board without hitting mines.",
      icon: Bomb,
      color: "bg-gray-700",
      themeColor: "#374151",
      category: "Puzzle" as const,
    },
    {
      id: "tetris" as const,
      title: "Tetris",
      description: "Stack falling blocks to clear lines and score high.",
      icon: Square,
      color: "bg-purple-500",
      themeColor: "#a855f7",
      category: "Puzzle" as const,
    },
    // ── Action ────────────────────────────────────────────────────
    {
      id: "simon-says" as const,
      title: "Simon Says",
      description: "Watch the pattern and repeat it back - test your memory!",
      icon: Brain,
      color: "bg-purple-600",
      themeColor: "#9333ea",
      category: "Action" as const,
    },
    {
      id: "whack-a-mole" as const,
      title: "Whack-a-Mole",
      description: "Quick reflexes needed - whack the moles before they hide!",
      icon: Target,
      color: "bg-green-500",
      themeColor: "#22c55e",
      category: "Action" as const,
    },
    {
      id: "reaction" as const,
      title: "Reaction Time",
      description: "Test your reflexes. How fast can you click?",
      icon: Timer,
      color: "bg-red-500",
      themeColor: "#ef4444",
      category: "Action" as const,
    },
    {
      id: "color-match" as const,
      title: "Color Match",
      description: "Match the target color as fast as you can!",
      icon: Palette,
      color: "bg-pink-500",
      themeColor: "#ec4899",
      category: "Action" as const,
    },
    {
      id: "space-invaders" as const,
      title: "Space Invaders",
      description: "Defend Earth from waves of alien invaders.",
      icon: Rocket,
      color: "bg-cyan-500",
      themeColor: "#06b6d4",
      category: "Action" as const,
    },
    // ── Strategy ──────────────────────────────────────────────────
    {
      id: "connect-four" as const,
      title: "Connect Four",
      description: "Drop pieces to get four in a row - play vs friends or CPU.",
      icon: Circle,
      color: "bg-red-500",
      themeColor: "#ef4444",
      category: "Strategy" as const,
    },
    {
      id: "tic-tac-toe" as const,
      title: "Tic Tac Toe",
      description: "Classic strategy game - get three in a row to win!",
      icon: Grid3X3,
      color: "bg-emerald-500",
      themeColor: "#10b981",
      category: "Strategy" as const,
    },
    {
      id: "orbit-defense" as const,
      title: "Orbit Defense",
      description: "Strategic tower defense in the vastness of space.",
      icon: Target,
      color: "bg-indigo-500",
      themeColor: "#6366f1",
      category: "Strategy" as const,
    },
    // ── Arcade ────────────────────────────────────────────────────
    {
      id: "flappy" as const,
      title: "Triangle",
      description: "Navigate through obstacles with precise timing.",
      icon: Triangle,
      color: "bg-yellow-500",
      themeColor: "#f59e0b",
      category: "Arcade" as const,
    },
    {
      id: "dino" as const,
      title: "Sheep Run",
      description: "Jump over cacti and dodge flying birds.",
      icon: PawPrint,
      color: "bg-gray-700",
      themeColor: "#374151",
      category: "Arcade" as const,
    },
    {
      id: "snake" as const,
      title: "Snake",
      description: "A modern, minimalistic take on the classic.",
      icon: Grid3X3,
      color: "bg-green-500",
      themeColor: "#22c55e",
      category: "Arcade" as const,
    },
    {
      id: "pong" as const,
      title: "Pong",
      description: "The timeless arcade classic. Play against an AI.",
      icon: Gamepad2,
      color: "bg-blue-500",
      themeColor: "#3b82f6",
      category: "Arcade" as const,
    },
    {
      id: "breakout" as const,
      title: "Breakout",
      description: "Break all the bricks with your ball and paddle.",
      icon: Zap,
      color: "bg-orange-500",
      themeColor: "#f97316",
      category: "Arcade" as const,
    },
    {
      id: "coin-collector" as const,
      title: "Coin Collector",
      description: "Jump and collect coins in this platformer adventure.",
      icon: Coins,
      color: "bg-yellow-500",
      themeColor: "#f59e0b",
      category: "Arcade" as const,
    },
    {
      id: "bubble-pop" as const,
      title: "Bubble Pop",
      description: "Pop colorful bubbles and build combos.",
      icon: Sparkles,
      color: "bg-cyan-500",
      themeColor: "#4ecdc4",
      category: "Arcade" as const,
    },
  ]

  const categories: Category[] = ["All", "Wellness", "Arcade", "Puzzle", "Strategy", "Action"]
  const filteredGames = selectedCategory === "All" ? games : games.filter((g) => g.category === selectedCategory)

  const renderGame = () => {
    const gameData = games.find((g) => g.id === currentGame)
    const commonProps = {
      onBack: () => setCurrentGame("menu"),
      themeColor: gameData?.themeColor ?? "#6366f1",
      gameName: gameData?.title ?? "Game",
    }

    switch (currentGame) {
      case "breathing":      return <BreathingGame {...commonProps} />
      case "aim-trainer":    return <AimTrainerGame {...commonProps} />
      case "number-memory":  return <NumberMemoryGame {...commonProps} />
      case "snake":          return <SnakeGame {...commonProps} />
      case "tic-tac-toe":    return <TicTacToeGame {...commonProps} />
      case "memory-match":   return <MemoryMatchGame {...commonProps} />
      case "minesweeper":    return <MinesweeperGame {...commonProps} />
      case "reaction":       return <ReactionGame {...commonProps} />
      default:
        return <GamePlaceholder {...commonProps} />
    }
  }

  if (currentGame !== "menu") {
    return (
      <div className="relative w-full min-h-screen">
        {renderGame()}
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-14">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs mb-5">
            <Gamepad2 className="w-3.5 h-3.5" />
            {games.length} games available
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            MindMate Arcade
          </h1>
          <p className="text-white/40 text-base max-w-md mx-auto">
            Take a break and play — games are a great way to reset your mind.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-white text-black shadow-lg"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
              variant="ghost"
            >
              {category === "Wellness" && "🧘 "}
              {category}
            </Button>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredGames.map((game) => (
            <Card
              key={game.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20 transition-all duration-200 cursor-pointer"
              onClick={() => setCurrentGame(game.id)}
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              {game.isNew && (
                <div
                  className="absolute top-3 right-3 text-white text-xs font-semibold px-2 py-0.5 rounded-full z-10"
                  style={{ background: game.themeColor }}
                >
                  NEW
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${game.color} text-white`}>
                    <game.icon className="w-5 h-5" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Play className="w-4 h-4 text-white/50" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <CardTitle className="text-base font-semibold text-white">{game.title}</CardTitle>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `${game.themeColor}22`,
                        color: game.themeColor,
                        border: `1px solid ${game.themeColor}33`,
                      }}
                    >
                      {game.category}
                    </span>
                  </div>
                  <CardDescription className="text-white/40 text-xs leading-relaxed">
                    {game.description}
                  </CardDescription>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
