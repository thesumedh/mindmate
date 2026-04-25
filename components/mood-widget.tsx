"use client"
import { useState, useEffect } from "react"

type Mood = "😔"|"😕"|"😐"|"🙂"|"😊"
const MOODS: { emoji:Mood; label:string; color:string }[] = [
  {emoji:"😔",label:"Sad",    color:"#60a5fa"},
  {emoji:"😕",label:"Low",    color:"#818cf8"},
  {emoji:"😐",label:"Okay",   color:"#a78bfa"},
  {emoji:"🙂",label:"Good",   color:"#34d399"},
  {emoji:"😊",label:"Great",  color:"#fbbf24"},
]
const HIST_KEY="mindmate-mood-history"
const TODAY_KEY="mindmate-mood-today"
const DATE_KEY ="mindmate-mood-date"

interface HistoryEntry { date:string; mood:Mood }

function loadHistory(): HistoryEntry[] { try{return JSON.parse(localStorage.getItem(HIST_KEY)||"[]")}catch{return[]} }
function saveHistory(h:HistoryEntry[]){ try{localStorage.setItem(HIST_KEY,JSON.stringify(h.slice(-30)))}catch{} }
function last7():string[]{ return Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return d.toDateString()}) }

export default function MoodWidget() {
  const [mood,   setMood]    = useState<Mood|null>(null)
  const [history,setHistory] = useState<HistoryEntry[]>([])
  const [dismissed,setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showHistory,setShowHistory]=useState(false)

  useEffect(()=>{
    setMounted(true)
    const saved=localStorage.getItem(TODAY_KEY)
    const date=localStorage.getItem(DATE_KEY)
    if(saved&&date===new Date().toDateString())setMood(saved as Mood)
    setHistory(loadHistory())
  },[])

  const pick=(m:Mood)=>{
    setMood(m)
    localStorage.setItem(TODAY_KEY,m)
    localStorage.setItem(DATE_KEY,new Date().toDateString())
    const today=new Date().toDateString()
    const h=loadHistory().filter(e=>e.date!==today)
    const updated=[...h,{date:today,mood:m}]
    setHistory(updated); saveHistory(updated)
  }

  if(!mounted||dismissed)return null
  const moodObj=MOODS.find(m=>m.emoji===mood)
  const days=last7()
  const histMap=Object.fromEntries(history.map(e=>[e.date,e.mood]))

  return(
    <div className="fixed bottom-6 right-6 z-30 max-w-[240px]">
      <div className="rounded-2xl px-4 py-4 backdrop-blur-xl flex flex-col gap-3 shadow-2xl"
        style={{background:"rgba(10,10,10,0.88)",border:"1px solid rgba(255,255,255,0.1)"}}>
        <button onClick={()=>setDismissed(true)} className="absolute top-2 right-3 text-white/25 hover:text-white/60 text-xs transition-colors" aria-label="Dismiss">✕</button>

        {mood?(
          <div className="text-center pt-1">
            <div className="text-3xl mb-1">{mood}</div>
            <p className="text-white/50 text-xs">Feeling <span className="font-semibold" style={{color:moodObj?.color}}>{moodObj?.label}</span> today</p>
            <button onClick={()=>setMood(null)} className="mt-1.5 text-white/20 text-xs hover:text-white/50 transition-colors">Change</button>
          </div>
        ):(
          <>
            <p className="text-white/60 text-xs text-center">How are you feeling?</p>
            <div className="flex justify-center gap-1.5">
              {MOODS.map(m=>(
                <button key={m.emoji} onClick={()=>pick(m.emoji)} title={m.label}
                  className="text-xl hover:scale-125 transition-transform duration-150 active:scale-110 p-1 rounded-full hover:bg-white/10">{m.emoji}</button>
              ))}
            </div>
          </>
        )}

        {/* 7-day history */}
        <div>
          <button onClick={()=>setShowHistory(h=>!h)} className="text-white/20 text-[10px] hover:text-white/40 transition-colors w-full text-center">
            {showHistory?"▲ Hide":"▼ 7-day history"}
          </button>
          {showHistory&&(
            <div className="mt-2 flex gap-1 justify-center">
              {days.map(d=>{
                const m=histMap[d]
                const isToday=d===new Date().toDateString()
                return(
                  <div key={d} className="flex flex-col items-center gap-0.5">
                    <div className="text-sm" title={m||"No entry"}>{m||"·"}</div>
                    <div className={`text-[8px] ${isToday?"text-white/50":"text-white/20"}`}>
                      {new Date(d).toLocaleDateString("en",{weekday:"narrow"})}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
