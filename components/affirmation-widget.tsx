/**
 * Daily Affirmation Widget Component
 *
 * Concept Explanation:
 * --------------------
 * Cognitive Reframing and Positive Psychology research demonstrate that positive affirmations
 * help interrupt negative cognitive thought spirals and mitigate acute anxiety.
 *
 * Technical Highlights:
 * 1. **Deterministic Daily Rotation**: Computes `Math.floor(Date.now() / 86400000)` to ensure all users
 *    see the exact same affirmation for that day, rotating automatically at midnight UTC.
 * 2. **Performance Optimization**: Wrapped with React's `useMemo` so the affirmation text is calculated
 *    only once per mount without redundant calculations during renders.
 */

"use client";

import { useMemo } from "react";

/**
 * Curated list of grounded, non-toxic positive psychology affirmations.
 */
const AFFIRMATIONS = [
  "You are stronger than you think. Every day you keep going is a victory. 💙",
  "It's okay to not be okay. Healing is not linear, and that's perfectly fine.",
  "You deserve kindness — especially from yourself. Be gentle with your heart today.",
  "Small steps still move you forward. Progress, not perfection.",
  "Your feelings are valid. You don't need to justify how you feel.",
  "Rest is productive. Taking care of yourself is never a waste of time.",
  "You've survived 100% of your hardest days. You can do this too.",
  "You are not a burden. The people who love you want to hear from you.",
  "Growth happens outside your comfort zone — and you've already been so brave.",
  "Today, just breathe. That's enough.",
  "You matter more than you know. The world is better with you in it.",
  "Asking for help is a sign of wisdom, not weakness.",
  "Your story isn't over. The best chapters might still be ahead.",
  "Be patient with yourself — you are a work in progress, and that's beautiful.",
  "One moment at a time. You don't have to solve everything today.",
];

export default function AffirmationWidget() {
  // Compute deterministic daily index using days elapsed since Unix epoch
  const affirmation = useMemo(() => {
    const dayNumber = Math.floor(Date.now() / 86400000);
    return AFFIRMATIONS[dayNumber % AFFIRMATIONS.length];
  }, []);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-md px-6 pointer-events-none">
      <div className="text-center">
        <p className="text-white/25 text-xs tracking-widest uppercase mb-2 font-light">
          Today's Affirmation
        </p>
        <p className="text-white/60 text-sm font-light leading-relaxed italic">
          "{affirmation}"
        </p>
      </div>
    </div>
  );
}
