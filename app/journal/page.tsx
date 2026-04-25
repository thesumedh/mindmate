"use client"
import { useState, useEffect } from "react"
import ShaderBackground from "@/components/shader-background"
import Header from "@/components/header"
import { Plus, Trash2, BookOpen, ArrowLeft } from "lucide-react"

interface Entry { id: string; title: string; body: string; date: string }
const KEY = "mindmate-journal"

function load(): Entry[] { try { return JSON.parse(localStorage.getItem(KEY)||"[]") } catch { return [] } }
function save(e: Entry[]) { try { localStorage.setItem(KEY, JSON.stringify(e)) } catch {} }

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [view, setView] = useState<"list"|"edit"|"new">("list")
  const [current, setCurrent] = useState<Entry|null>(null)
  const [body, setBody] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true); setEntries(load()) }, [])

  const saveEntry = () => {
    if (!body.trim()) return
    const lines = body.trim().split("\n")
    const title = lines[0].slice(0, 60) || "Untitled"
    const date = new Date().toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric", year:"numeric" })
    let updated: Entry[]
    if (current) {
      updated = entries.map(e => e.id===current.id ? {...e,title,body,date} : e)
    } else {
      updated = [{ id: Date.now().toString(), title, body, date }, ...entries]
    }
    setEntries(updated); save(updated); setView("list"); setCurrent(null); setBody("")
  }

  const del = (id: string) => { const u=entries.filter(e=>e.id!==id); setEntries(u); save(u) }

  const openEdit = (e: Entry) => { setCurrent(e); setBody(e.body); setView("edit") }
  const openNew  = () => { setCurrent(null); setBody(""); setView("new") }

  if (!mounted) return null

  return (
    <ShaderBackground>
      <Header />
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-8 min-h-screen">
        {view === "list" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">My Journal</h1>
                <p className="text-white/40 text-sm mt-1">Private · stored only on this device</p>
              </div>
              <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all">
                <Plus className="w-4 h-4"/> New Entry
              </button>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-24 space-y-4">
                <BookOpen className="w-12 h-12 text-white/20 mx-auto"/>
                <p className="text-white/40">No entries yet. Start writing your thoughts.</p>
                <button onClick={openNew} className="px-6 py-3 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm">Write first entry</button>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map(e => (
                  <div key={e.id} onClick={()=>openEdit(e)} className="group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-2xl p-5 cursor-pointer transition-all duration-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{e.title}</h3>
                        <p className="text-white/40 text-xs mt-1">{e.date}</p>
                        <p className="text-white/30 text-sm mt-2 line-clamp-2">{e.body.slice(0,120)}</p>
                      </div>
                      <button onClick={ev=>{ev.stopPropagation();del(e.id)}} className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-all">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {(view === "new" || view === "edit") && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={()=>{setView("list");setCurrent(null)}} className="flex items-center gap-1 text-white/50 hover:text-white text-sm transition-colors">
                <ArrowLeft className="w-4 h-4"/> Back
              </button>
              <h2 className="text-white font-semibold">{view==="new"?"New Entry":"Edit Entry"}</h2>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-white/25 text-xs mb-3">First line becomes the title · everything is private</p>
              <textarea
                autoFocus
                value={body}
                onChange={e=>setBody(e.target.value)}
                placeholder={"Start writing your thoughts...\n\nThis is your safe space. No one else can see this."}
                className="w-full min-h-[50vh] bg-transparent text-white/90 text-base leading-relaxed placeholder:text-white/20 resize-none outline-none font-light"
              />
            </div>
            <div className="flex justify-between mt-4">
              <button onClick={()=>{setView("list");setCurrent(null)}} className="px-5 py-2 rounded-full border border-white/20 text-white/50 hover:text-white text-sm transition-all">Cancel</button>
              <button onClick={saveEntry} disabled={!body.trim()} className="px-6 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-40 transition-all">Save Entry</button>
            </div>
          </>
        )}
      </main>
    </ShaderBackground>
  )
}
