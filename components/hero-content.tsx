/**
 * Landing Page Hero Content Component
 *
 * Concept Explanation:
 * --------------------
 * The Hero section establishes value proposition, privacy assurances, and direct call-to-actions.
 *
 * Design & UX Highlights:
 * 1. **Immediate Privacy Assurance**: "✨ Anonymous & Confidential" badge reduces user hesitation.
 * 2. **Clear Action Hierarchy**: Primary action ("Start Chat") highlighted in high-contrast white,
 *    secondary action ("Play Games" for stress relief) styled with transparent glassmorphism.
 * 3. **Non-Clinical Framing**: Warm, approachable copy ("Peace of mind, always") without medical jargon.
 */

"use client";

import Link from "next/link";

export default function HeroContent() {
  return (
    <main className="absolute bottom-8 left-8 z-20 max-w-lg">
      <div className="text-left">
        {/* Privacy Pill Badge */}
        <div
          className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm mb-4 relative"
          style={{ filter: "url(#glass-effect)" }}
        >
          <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
          <span className="text-white/90 text-xs font-light relative z-10">
            ✨ Anonymous & Confidential
          </span>
        </div>

        {/* Main Hero Heading */}
        <h1 className="text-5xl md:text-6xl md:leading-16 tracking-tight font-light text-white mb-4">
          <span className="font-medium italic instrument">MindMate</span>
          <br />
          <span className="font-light tracking-tight text-white/80">Peace of mind, always.</span>
        </h1>

        {/* Value Proposition Description */}
        <p className="text-xs font-light text-white/70 mb-6 leading-relaxed">
          {"Evidence-based, confidential mental health support powered by AI.\nChat anytime. No account needed. No judgment. No waiting lists."}
        </p>

        {/* Primary and Secondary CTA Buttons */}
        <div className="flex items-center gap-4 flex-wrap">
          <Link
            href="/games"
            className="px-8 py-3 rounded-full bg-transparent border border-white/30 text-white font-normal text-xs transition-all duration-200 hover:bg-white/10 hover:border-white/50 cursor-pointer"
          >
            🎮 Play Games
          </Link>
          <Link
            href="/chat"
            className="px-8 py-3 rounded-full bg-white text-black font-normal text-xs transition-all duration-200 hover:bg-white/90 cursor-pointer block shadow-lg hover:scale-105 active:scale-95"
          >
            Start Chat →
          </Link>
        </div>
      </div>
    </main>
  );
}
