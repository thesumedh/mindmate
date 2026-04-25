"use client"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw, Zap } from "lucide-react"

type Phase = "idle"|"waiting"|"go"|"result"|"done"

export default function ReactionGame({onBack,themeColor="#ef4444"}:{onBack:()=>void;themeColor?:string}){
  const [phase,setPhase]=useState<Phase>("idle")
  const [times,setTimes]=useState<number[]>([])
  const [current,setCurrent]=useState(0)
  const [tooEarly,setTooEarly]=useState(false)
  const startRef=useRef(0)
  const timerRef=useRef<ReturnType<typeof setTimeout>|null>(null)
  const ROUNDS=5

  const startWait=useCallback(()=>{
    setTooEarly(false); setPhase("waiting")
    const delay=1500+Math.random()*3500
    timerRef.current=setTimeout(()=>{ startRef.current=Date.now(); setPhase("go") },delay)
  },[])

  const handleClick=useCallback(()=>{
    if(phase==="idle"||phase==="done")return
    if(phase==="waiting"){
      if(timerRef.current)clearTimeout(timerRef.current)
      setTooEarly(true); setPhase("idle"); return
    }
    if(phase==="go"){
      const ms=Date.now()-startRef.current
      const next=[...times,ms]
      setTimes(next); setCurrent(ms)
      if(next.length>=ROUNDS)setPhase("done")
      else setPhase("result")
    }
  },[phase,times])

  const avg=(arr:number[])=>arr.length?Math.round(arr.reduce((a,b)=>a+b,0)/arr.length):0
  const best=(arr:number[])=>arr.length?Math.min(...arr):0

  const bgColor=phase==="go"?themeColor:phase==="waiting"?"#1e293b":"#0f172a"
  const label=phase==="go"?"CLICK NOW!":phase==="waiting"?"Wait for it...":phase==="result"?`${current}ms ⚡`:`React!`

  return(
    <div className="w-full min-h-screen flex flex-col" style={{background:"#0f172a"}}>
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
        <Button onClick={onBack} variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10"><ArrowLeft className="w-4 h-4 mr-1"/>Back</Button>
        <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400"/><span className="text-white font-bold">Reaction Time</span></div>
        <span className="text-white/40 text-sm ml-auto">Round {Math.min(times.length+1,ROUNDS)} / {ROUNDS}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        {phase==="done"?(
          <div className="text-center space-y-6 max-w-sm">
            <div className="text-5xl">⚡</div>
            <h2 className="text-3xl font-bold text-white">Results</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="text-2xl font-bold" style={{color:themeColor}}>{avg(times)}ms</div>
                <div className="text-white/40 text-xs mt-1">Average</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-green-400">{best(times)}ms</div>
                <div className="text-white/40 text-xs mt-1">Best</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {times.map((t,i)=><span key={i} className="px-3 py-1 rounded-full text-sm font-mono" style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.6)"}}>{t}ms</span>)}
            </div>
            <Button onClick={()=>{setTimes([]);setPhase("idle")}} className="rounded-full px-8" style={{background:themeColor,color:"#fff"}}>
              <RotateCcw className="w-4 h-4 mr-2"/>Try Again
            </Button>
          </div>
        ):(
          <>
            <button
              onClick={handleClick}
              className="w-64 h-64 rounded-full flex flex-col items-center justify-center gap-3 font-bold text-xl transition-all duration-200 active:scale-95 select-none"
              style={{background:bgColor,border:`4px solid ${phase==="go"?themeColor:"rgba(255,255,255,0.1)"}`,boxShadow:phase==="go"?`0 0 60px ${themeColor}66`:"none",color:phase==="go"?"#fff":"rgba(255,255,255,0.7)",cursor:"pointer"}}
            >
              {phase==="go"&&<Zap className="w-10 h-10"/>}
              {label}
            </button>

            {tooEarly&&<p className="text-red-400 font-semibold animate-bounce">Too early! Wait for the signal.</p>}

            {phase==="result"&&(
              <div className="text-center space-y-3">
                <p className="text-white/60 text-sm">{times.length} / {ROUNDS} rounds done</p>
                <Button onClick={startWait} className="rounded-full px-6" style={{background:themeColor,color:"#fff"}}>Next Round</Button>
              </div>
            )}
            {(phase==="idle")&&(
              <div className="text-center space-y-3">
                {times.length===0&&<p className="text-white/40 text-sm max-w-xs">Click the circle when it turns red. Don't click too early!</p>}
                <Button onClick={startWait} className="rounded-full px-8" style={{background:themeColor,color:"#fff"}}>
                  {times.length===0?"Start Test":"Retry"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
