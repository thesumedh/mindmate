"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw } from "lucide-react"

const EMOJIS=["🌸","⭐","🔥","💎","🌈","🎵","🦋","🌙"]
function makeCards(){
  const pairs=[...EMOJIS,...EMOJIS]
  for(let i=pairs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pairs[i],pairs[j]]=[pairs[j],pairs[i]]}
  return pairs.map((e,i)=>({id:i,emoji:e,flipped:false,matched:false}))
}

export default function MemoryMatchGame({onBack,themeColor="#ec4899"}:{onBack:()=>void;themeColor?:string}){
  const [cards,setCards]=useState(makeCards())
  const [flipped,setFlipped]=useState<number[]>([])
  const [moves,setMoves]=useState(0)
  const [phase,setPhase]=useState<"idle"|"playing"|"done">("idle")
  const [locked,setLocked]=useState(false)
  const [elapsed,setElapsed]=useState(0)
  const [timerOn,setTimerOn]=useState(false)

  useEffect(()=>{
    if(!timerOn)return
    const id=setInterval(()=>setElapsed(e=>e+1),1000)
    return()=>clearInterval(id)
  },[timerOn])

  const flip=(id:number)=>{
    if(locked||flipped.length===2)return
    const c=cards.find(c=>c.id===id)
    if(!c||c.flipped||c.matched)return
    const nf=[...flipped,id]
    setCards(prev=>prev.map(c=>c.id===id?{...c,flipped:true}:c))
    setFlipped(nf)
    if(nf.length===2){
      setMoves(m=>m+1); setLocked(true)
      const [a,b]=nf.map(i=>cards.find(c=>c.id===i)!)
      if(a.emoji===b.emoji){
        setCards(prev=>prev.map(c=>nf.includes(c.id)?{...c,matched:true}:c))
        setFlipped([]); setLocked(false)
        setCards(prev=>{if(prev.every(c=>c.matched||nf.includes(c.id))){setTimeout(()=>{setPhase("done");setTimerOn(false)},300)}return prev})
      } else {
        setTimeout(()=>{
          setCards(prev=>prev.map(c=>nf.includes(c.id)?{...c,flipped:false}:c))
          setFlipped([]); setLocked(false)
        },900)
      }
    }
  }

  const start=()=>{setCards(makeCards());setFlipped([]);setMoves(0);setElapsed(0);setLocked(false);setPhase("playing");setTimerOn(true)}
  const fmt=(s:number)=>`${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`

  return(
    <div className="w-full min-h-screen flex flex-col" style={{background:"radial-gradient(ellipse at top,#1a0a2e,#0a0a0a)"}}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Button onClick={onBack} variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10"><ArrowLeft className="w-4 h-4 mr-1"/>Back</Button>
        <span className="text-white font-bold">Memory Match</span>
        <div className="flex gap-4 text-sm">
          <span className="text-white/50">Moves: <b className="text-white">{moves}</b></span>
          <span className="text-white/50">Time: <b className="text-white">{fmt(elapsed)}</b></span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        {phase==="idle"&&(
          <div className="text-center space-y-4">
            <div className="text-5xl mb-2">🃏</div>
            <h2 className="text-2xl font-bold text-white">Memory Match</h2>
            <p className="text-white/40 text-sm">Match all 8 pairs of cards</p>
            <Button onClick={start} className="rounded-full px-8" style={{background:themeColor,color:"#fff"}}>Start Game</Button>
          </div>
        )}
        {(phase==="playing"||phase==="done")&&(
          <>
            <div className="grid grid-cols-4 gap-3">
              {cards.map(c=>(
                <button key={c.id} onClick={()=>flip(c.id)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl text-2xl sm:text-3xl flex items-center justify-center transition-all duration-300 active:scale-90"
                  style={{background:c.flipped||c.matched?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.05)",border:`2px solid ${c.matched?themeColor:c.flipped?"rgba(255,255,255,0.3)":"rgba(255,255,255,0.1)"}`,transform:c.flipped||c.matched?"rotateY(0)":"rotateY(180deg)",boxShadow:c.matched?`0 0 16px ${themeColor}66`:"none"}}>
                  {(c.flipped||c.matched)?c.emoji:""}
                </button>
              ))}
            </div>
            {phase==="done"&&(
              <div className="text-center space-y-4">
                <p className="text-white font-bold text-xl">🎉 You matched all pairs!</p>
                <p className="text-white/50 text-sm">{moves} moves · {fmt(elapsed)}</p>
                <Button onClick={start} className="rounded-full px-6" style={{background:themeColor,color:"#fff"}}>
                  <RotateCcw className="w-4 h-4 mr-2"/>Play Again
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
