/**
 * Mood Tracker Widget Component
 *
 * Concept Explanation:
 * --------------------
 * Longitudinal mood tracking is an evidence-based mental health technique. 
 * By logging daily emotional valence, users can identify burnout triggers and recovery trends.
 *
 * Technical Highlights:
 * 1. **Client-Side Privacy**: Mood records are saved exclusively to `localStorage` (no unencrypted PII sent).
 * 2. **7-Day Rolling History**: Dynamically generates past 7 calendar dates to render weekly mood trends.
 * 3. **Hydration & SSR Safety**: Uses an `isMounted` state pattern to prevent Next.js React hydration mismatches.
 */

"use client";

import { useState, useEffect } from "react";

// Standard 5-point Likert mood scale represented with intuitive emojis and theme colors
type Mood = "😔" | "😕" | "😐" | "🙂" | "😊";

interface MoodConfig {
  emoji: Mood;
  label: string;
  color: string;
}

const MOODS: MoodConfig[] = [
  { emoji: "😔", label: "Sad",   color: "#60a5fa" },
  { emoji: "😕", label: "Low",   color: "#818cf8" },
  { emoji: "😐", label: "Okay",  color: "#a78bfa" },
  { emoji: "🙂", label: "Good",  color: "#34d399" },
  { emoji: "😊", label: "Great", color: "#fbbf24" },
];

const HIST_KEY = "mindmate-mood-history";
const TODAY_KEY = "mindmate-mood-today";
const DATE_KEY = "mindmate-mood-date";

interface HistoryEntry {
  date: string;
  mood: Mood;
}

/**
 * Loads the 30-day historical mood log from local browser storage.
 */
function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Persists up to 30 historical mood entries to local browser storage.
 */
function saveHistory(history: HistoryEntry[]) {
  try {
    localStorage.setItem(HIST_KEY, JSON.stringify(history.slice(-30)));
  } catch (err) {
    console.warn("[MoodWidget] Failed to save history:", err);
  }
}

/**
 * Generates an array of date strings for the past 7 days (rolling window).
 */
function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d.toDateString();
  });
}

export default function MoodWidget() {
  const [mood, setMood] = useState<Mood | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Initialize widget state from localStorage on client-side mount
  useEffect(() => {
    setMounted(true);
    const savedMood = localStorage.getItem(TODAY_KEY);
    const savedDate = localStorage.getItem(DATE_KEY);
    const today = new Date().toDateString();

    // Check if user already picked a mood today
    if (savedMood && savedDate === today) {
      setMood(savedMood as Mood);
    }
    setHistory(loadHistory());
  }, []);

  /**
   * Records the selected mood for today, updates rolling history, and saves to storage.
   */
  const pickMood = (selectedMood: Mood) => {
    setMood(selectedMood);
    const today = new Date().toDateString();
    localStorage.setItem(TODAY_KEY, selectedMood);
    localStorage.setItem(DATE_KEY, today);

    // Update history array by replacing today's entry or appending
    const filteredHistory = loadHistory().filter((entry) => entry.date !== today);
    const updatedHistory = [...filteredHistory, { date: today, mood: selectedMood }];
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
  };

  // Prevent SSR rendering to avoid client/server markup divergence
  if (!mounted || dismissed) return null;

  const currentMoodConfig = MOODS.find((m) => m.emoji === mood);
  const last7Days = getLast7Days();
  const historyMap = Object.fromEntries(history.map((e) => [e.date, e.mood]));

  return (
    <aside aria-label="Mood Tracker" className="fixed bottom-6 right-6 z-30 max-w-[240px]">
      <div
        className="rounded-2xl px-4 py-4 backdrop-blur-xl flex flex-col gap-3 shadow-2xl transition-all"
        style={{ background: "rgba(10,10,10,0.88)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* Dismiss widget button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-3 text-white/25 hover:text-white/60 text-xs transition-colors"
          aria-label="Dismiss Mood Widget"
        >
          ✕
        </button>

        {mood ? (
          /* State A: Mood already selected for today */
          <div className="text-center pt-1">
            <div className="text-3xl mb-1">{mood}</div>
            <p className="text-white/50 text-xs">
              Feeling <span className="font-semibold" style={{ color: currentMoodConfig?.color }}>{currentMoodConfig?.label}</span> today
            </p>
            <button
              onClick={() => setMood(null)}
              className="mt-1.5 text-white/20 text-xs hover:text-white/50 transition-colors underline underline-offset-2"
            >
              Change
            </button>
          </div>
        ) : (
          /* State B: User prompt to select today's mood */
          <>
            <p className="text-white/60 text-xs text-center font-light">How are you feeling?</p>
            <div className="flex justify-center gap-1.5">
              {MOODS.map((m) => (
                <button
                  key={m.emoji}
                  onClick={() => pickMood(m.emoji)}
                  title={m.label}
                  className="text-xl hover:scale-125 transition-transform duration-150 active:scale-110 p-1 rounded-full hover:bg-white/10"
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Expandable 7-Day Mood History Strip */}
        <div className="border-t border-white/5 pt-2">
          <button
            onClick={() => setShowHistory((prev) => !prev)}
            className="text-white/25 text-[10px] hover:text-white/50 transition-colors w-full text-center"
          >
            {showHistory ? "▲ Hide history" : "▼ 7-day history"}
          </button>

          {showHistory && (
            <div className="mt-2 flex gap-1 justify-center">
              {last7Days.map((dateStr) => {
                const recordedMood = historyMap[dateStr];
                const isToday = dateStr === new Date().toDateString();
                return (
                  <div key={dateStr} className="flex flex-col items-center gap-0.5">
                    <div className="text-sm" title={recordedMood ? `${dateStr}: ${recordedMood}` : `${dateStr}: No entry`}>
                      {recordedMood || "·"}
                    </div>
                    <div className={`text-[8px] ${isToday ? "text-white/70 font-semibold" : "text-white/20"}`}>
                      {new Date(dateStr).toLocaleDateString("en", { weekday: "narrow" })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
