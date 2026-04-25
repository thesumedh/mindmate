"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw } from "lucide-react"

const ROWS = 18, COLS = 22, SPEED = 130
type Pos = [number, number]

function randFood(snake: Pos[]): Pos {
  let p: Pos
  do { p = [Math.floor(Math.random()*ROWS), Math.floor(Math.random()*COLS)] }
  while (snake.some(([r,c]) => r===p[0] && c===p[1]))
  return p
}

export default function SnakeGame({ onBack, themeColor="#22c55e" }: { onBack:()=>void; themeColor?:string }) {
  const snake  = useRef<Pos[]>([[9,11],[9,10],[9,9]])
  const food   = useRef<Pos>([4,11])
  const dir    = useRef<Pos>([0,1])
  const nextDir= useRef<Pos>([0,1])
  const scoreR = useRef(0)
  const dead   = useRef(false)
  const timer  = useRef<ReturnType<typeof setInterval>|null>(null)

  const [phase, setPhase]   = useState<"idle"|"playing"|"dead">("idle")
  const [score, setScore]   = useState(0)
  const [best,  setBest]    = useState(0)
  const [tick,  setTick]    = useState(0)

  const step = useCallback(() => {
    if (dead.current) return
    const [dr,dc] = nextDir.current
    dir.current = [dr,dc]
    const [hr,hc] = snake.current[0]
    const h: Pos = [(hr+dr+ROWS)%ROWS, (hc+dc+COLS)%COLS]
    if (snake.current.some(([r,c]) => r===h[0] && c===h[1])) {
      dead.current = true; setPhase("dead")
      if (timer.current) clearInterval(timer.current); return
    }
    const ate = h[0]===food.current[0] && h[1]===food.current[1]
    snake.current = ate ? [h,...snake.current] : [h,...snake.current.slice(0,-1)]
    if (ate) { food.current=randFood(snake.current); scoreR.current+=10; setScore(scoreR.current); setBest(b=>Math.max(b,scoreR.current)) }
    setTick(t=>t+1)
  }, [])

  const start = useCallback(() => {
    const init: Pos[] = [[9,11],[9,10],[9,9]]
    snake.current=init; food.current=randFood(init); dir.current=[0,1]; nextDir.current=[0,1]
    scoreR.current=0; dead.current=false; setScore(0); setPhase("playing")
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(step, SPEED)
    setTick(t=>t+1)
  }, [step])

  useEffect(()=>()=>{ if(timer.current) clearInterval(timer.current) },[])

  useEffect(()=>{
    if (phase!=="playing") return
    const fn=(e:KeyboardEvent)=>{
      const [dr,dc]=dir.current
      const m:Record<string,Pos>={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1],w:[-1,0],s:[1,0],a:[0,-1],d:[0,1]}
      const nd=m[e.key]; if(!nd) return
      if(nd[0]+dr===0 && nd[1]+dc===0) return
      nextDir.current=nd
    }
    window.addEventListener("keydown",fn); return()=>window.removeEventListener("keydown",fn)
  },[phase])

  const steer=(nd:Pos)=>{ const[dr,dc]=dir.current; if(nd[0]+dr===0&&nd[1]+dc===0)return; nextDir.current=nd }

  const s=snake.current, f=food.current
  return (
    <div className="w-full min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 py-6">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10"><ArrowLeft className="w-4 h-4 mr-1"/>Back</Button>
        <span className="text-white font-bold">🐍 Snake</span>
        <span className="text-white/60 text-sm">Score: <b className="text-white">{score}</b></span>
        <span className="text-white/30 text-xs">Best: {best}</span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:`repeat(${COLS},22px)`,background:"#0a0a0a",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8}}>
        {Array.from({length:ROWS*COLS},(_,i)=>{
          const r=Math.floor(i/COLS),c=i%COLS
          const isHead=s[0][0]===r&&s[0][1]===c
          const isBody=!isHead&&s.some(([sr,sc])=>sr===r&&sc===c)
          const isFood=f[0]===r&&f[1]===c
          return <div key={i} style={{width:22,height:22,background:isHead?themeColor:isBody?themeColor+"88":isFood?"#f87171":"transparent",borderRadius:isHead||isFood?5:2,border:"1px solid rgba(255,255,255,0.03)"}}/>
        })}
      </div>

      {/* Mobile D-pad */}
      {phase==="playing"&&(
        <div className="grid grid-cols-3 gap-1.5 mt-1">
          {([["↑",[-1,0],"col-start-2"],["←",[0,-1],""],["↓",[1,0],"col-start-2"],["→",[0,1],"col-start-3 row-start-2"]] as [string,Pos,string][]).map(([lbl,nd,cls])=>(
            <button key={lbl} onClick={()=>steer(nd)} className={`${cls} w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white text-lg font-bold active:scale-90 transition-transform`}>{lbl}</button>
          ))}
        </div>
      )}

      {phase!=="playing"&&(
        <div className="text-center space-y-3">
          {phase==="dead"&&<div><p className="text-red-400 font-bold">Game Over! Score: {score}</p>{score===best&&score>0&&<p className="text-yellow-400 text-sm">🏆 New Best!</p>}</div>}
          <Button onClick={start} className="rounded-full px-6" style={{background:themeColor,color:"#000"}}>
            {phase==="dead"?<><RotateCcw className="w-4 h-4 mr-2"/>Retry</>:"▶ Start Game"}
          </Button>
          {phase==="idle"&&<p className="text-white/30 text-xs">Arrow keys or WASD · on-screen buttons on mobile</p>}
        </div>
      )}
    </div>
  )
}
