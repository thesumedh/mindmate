"use client"
import Header from "@/components/header"
import HeroContent from "@/components/hero-content"
import PulsingCircle from "@/components/pulsing-circle"
import ShaderBackground from "@/components/shader-background"
import MoodWidget from "@/components/mood-widget"
import AffirmationWidget from "@/components/affirmation-widget"

export default function HomePage() {
  return (
    <ShaderBackground>
      <Header />
      <AffirmationWidget />
      <HeroContent />
      <PulsingCircle />
      <MoodWidget />
    </ShaderBackground>
  )
}
