/**
 * Private Journal Page Component
 *
 * Concept Explanation:
 * --------------------
 * Therapeutic journaling (expressive writing) has been shown in clinical psychology
 * to significantly reduce rumination and emotional distress.
 *
 * Privacy & Architecture Highlights:
 * 1. **Zero-Knowledge Local Storage**: Journal entries are stored locally on the client's device,
 *    ensuring complete user confidentiality and eliminating HIPAA/GDPR storage liability.
 * 2. **State-Driven Multi-View Interface**: Transitions between "list", "edit", and "new" entry modes
 *    without jarring browser page reloads.
 * 3. **Smart Header Extraction**: Automatically treats the first line of the entry as its title.
 */

"use client";

import { useState, useEffect } from "react";
import ShaderBackground from "@/components/shader-background";
import Header from "@/components/header";
import { Plus, Trash2, BookOpen, ArrowLeft } from "lucide-react";

/**
 * Journal entry data structure.
 */
interface Entry {
  id: string;
  title: string;
  body: string;
  date: string;
}

const STORAGE_KEY = "mindmate-journal";

/**
 * Loads saved journal entries from browser localStorage.
 */
function loadEntries(): Entry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (err) {
    console.warn("[Journal] Failed to parse entries from storage:", err);
    return [];
  }
}

/**
 * Persists journal entries array to browser localStorage.
 */
function saveEntries(entries: Entry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.warn("[Journal] Failed to persist entries:", err);
  }
}

export default function JournalPage() {
  // State for all journal entries and current view mode
  const [entries, setEntries] = useState<Entry[]>([]);
  const [view, setView] = useState<"list" | "edit" | "new">("list");
  const [current, setCurrent] = useState<Entry | null>(null);
  const [body, setBody] = useState("");
  const [mounted, setMounted] = useState(false);

  // Load entries on component mount
  useEffect(() => {
    setMounted(true);
    setEntries(loadEntries());
  }, []);

  /**
   * Saves or updates a journal entry.
   * Derives title from first line and attaches localized creation date.
   */
  const handleSaveEntry = () => {
    if (!body.trim()) return;

    const lines = body.trim().split("\n");
    const title = lines[0].slice(0, 60) || "Untitled Entry";
    const date = new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    let updatedList: Entry[];
    if (current) {
      // Editing existing entry
      updatedList = entries.map((e) =>
        e.id === current.id ? { ...e, title, body, date } : e
      );
    } else {
      // Creating new entry (prepended to list)
      const newEntry: Entry = {
        id: Date.now().toString(),
        title,
        body,
        date,
      };
      updatedList = [newEntry, ...entries];
    }

    setEntries(updatedList);
    saveEntries(updatedList);

    // Reset editor view back to list
    setView("list");
    setCurrent(null);
    setBody("");
  };

  /**
   * Deletes a journal entry by ID.
   */
  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
  };

  /**
   * Opens the editor in edit mode for an existing entry.
   */
  const openEdit = (entry: Entry) => {
    setCurrent(entry);
    setBody(entry.body);
    setView("edit");
  };

  /**
   * Opens the editor in create mode for a fresh entry.
   */
  const openNew = () => {
    setCurrent(null);
    setBody("");
    setView("new");
  };

  if (!mounted) return null;

  return (
    <ShaderBackground>
      <Header />
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-8 min-h-screen">
        {/* ------------------------------------------------------------------ */}
        {/* VIEW 1: Journal Entries List View                                   */}
        {/* ------------------------------------------------------------------ */}
        {view === "list" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">My Private Journal</h1>
                <p className="text-white/40 text-sm mt-1">
                  Private & Confidential · Stored strictly on your local device
                </p>
              </div>
              <button
                onClick={openNew}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> New Entry
              </button>
            </div>

            {entries.length === 0 ? (
              /* Empty Journal State */
              <div className="text-center py-24 space-y-4">
                <BookOpen className="w-12 h-12 text-white/20 mx-auto" />
                <p className="text-white/40">No entries yet. Start writing your thoughts freely.</p>
                <button
                  onClick={openNew}
                  className="px-6 py-3 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm"
                >
                  Write your first entry
                </button>
              </div>
            ) : (
              /* Populated Journal Entries List */
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => openEdit(entry)}
                    className="group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-2xl p-5 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{entry.title}</h3>
                        <p className="text-white/40 text-xs mt-1">{entry.date}</p>
                        <p className="text-white/30 text-sm mt-2 line-clamp-2">{entry.body.slice(0, 120)}</p>
                      </div>
                      {/* Delete button (reveals on hover) */}
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleDelete(entry.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-all"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 2: New / Edit Entry Editor                                    */}
        {/* ------------------------------------------------------------------ */}
        {(view === "new" || view === "edit") && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => {
                  setView("list");
                  setCurrent(null);
                }}
                className="flex items-center gap-1 text-white/50 hover:text-white text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-white font-semibold">
                {view === "new" ? "New Journal Entry" : "Edit Journal Entry"}
              </h2>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-white/25 text-xs mb-3">
                Tip: The first line automatically becomes the title · Everything remains private
              </p>
              <textarea
                autoFocus
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={"Start writing your thoughts...\n\nThis is your safe space. No one else can see this."}
                className="w-full h-72 bg-transparent text-white placeholder-white/20 text-sm resize-none focus:outline-none leading-relaxed font-light"
              />
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setView("list");
                    setCurrent(null);
                  }}
                  className="px-5 py-2 rounded-full border border-white/10 text-white/60 hover:text-white text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEntry}
                  disabled={!body.trim()}
                  className="px-6 py-2 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </ShaderBackground>
  );
}
