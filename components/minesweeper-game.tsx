"use client"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw, Flag } from "lucide-react"

const ROWS=9,COLS=9,MINES=10
type Cell={mine:boolean;revealed:boolean;flagged:boolean;count:number}

function makeBoard(safeR:number,safeC:number):Cell[][]{
  const b:Cell[][]=Array.from({length:ROWS},()=>Array.from({length:COLS},()=>({mine:false,revealed:false,flagged:false,count:0})))
  let placed=0
  while(placed<MINES){
    const r=Math.floor(Math.random()*ROWS),c=Math.floor(Math.random()*COLS)
    if(!b[r][c].mine&&!(Math.abs(r-safeR)<=1&&Math.abs(c-safeC)<=1)){b[r][c].mine=true;placed++}
  }
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(!b[r][c].mine){
    let cnt=0
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&b[nr][nc].mine)cnt++}
    b[r][c].count=cnt
  }
  return b
}

function reveal(b:Cell[][],r:number,c:number){
  if(r<0||r>=ROWS||c<0||c>=COLS||b[r][c].revealed||b[r][c].flagged)return
  b[r][c].revealed=true
  if(b[r][c].count===0&&!b[r][c].mine)for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)reveal(b,r+dr,c+dc)
}

export default function MinesweeperGame({onBack,themeColor="#374151"}:{onBack:()=>void;themeColor?:string}){
  const [board,setBoard]=useState<Cell[][]|null>(null)
  const [phase,setPhase]=useState<"idle"|"playing"|"won"|"lost">("idle")
  const [flagMode,setFlagMode]=useState(false)
  const [flagCount,setFlagCount]=useState(0)

  const click=useCallback((r:number,c:number)=>{
    setBoard(prev=>{
      let b=prev
      if(!b){b=makeBoard(r,c);setPhase("playing")}
      else if(phase!=="playing")return prev
      const nb=b.map(row=>row.map(cell=>({...cell})))
      if(flagMode){
        if(nb[r][c].revealed)return prev
        nb[r][c].flagged=!nb[r][c].flagged
        setFlagCount(f=>nb[r][c].flagged?f+1:f-1)
        return nb
      }
      if(nb[r][c].flagged||nb[r][c].revealed)return prev
      if(nb[r][c].mine){
        nb.forEach(row=>row.forEach(cell=>{if(cell.mine)cell.revealed=true}))
        setPhase("lost"); return nb
      }
      reveal(nb,r,c)
      const won=nb.flat().every(cell=>cell.mine||cell.revealed)
      if(won)setPhase("won")
      return nb
    })
  },[phase,flagMode])

  const reset=()=>{setBoard(null);setPhase("idle");setFlagCount(0);setFlagMode(false)}

  const COLORS=["","#60a5fa","#34d399","#f87171","#818cf8","#f97316","#22d3ee","#e879f9","#94a3b8"]

  return(
    <div className="w-full min-h-screen flex flex-col bg-gray-950">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <Button onClick={onBack} variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10"><ArrowLeft className="w-4 h-4 mr-1"/>Back</Button>
        <span className="text-white font-bold">💣 Minesweeper</span>
        <div className="flex items-center gap-3">
          <span className="text-white/50 text-sm">🚩 {MINES-flagCount}</span>
          <button onClick={()=>setFlagMode(f=>!f)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${flagMode?"bg-yellow-500 text-black":"bg-white/10 text-white/60 hover:bg-white/20"}`}>
            <Flag className="w-3 h-3"/>{flagMode?"Flag Mode":"Place Flag"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-6">
        {phase==="idle"&&!board&&(
          <div className="text-center space-y-4">
            <div className="text-5xl">💣</div>
            <h2 className="text-2xl font-bold text-white">Minesweeper</h2>
            <p className="text-white/40 text-sm">9×9 grid · {MINES} mines · First click is always safe</p>
            <p className="text-white/30 text-xs">Click a cell to begin. Toggle flag mode to mark mines.</p>
            <Button onClick={()=>click(4,4)} className="rounded-full px-8 bg-green-600 hover:bg-green-500 text-white">Start Game</Button>
          </div>
        )}

        {board&&(
          <div className="space-y-1">
            {board.map((row,r)=>(
              <div key={r} className="flex gap-1">
                {row.map((cell,c)=>{
                  let bg="rgba(255,255,255,0.07)",txt="",color="white",border="rgba(255,255,255,0.12)"
                  if(cell.revealed){
                    bg=cell.mine?"#7f1d1d":"rgba(255,255,255,0.03)"; border="rgba(255,255,255,0.06)"
                    if(cell.mine)txt="💣"
                    else if(cell.count>0){txt=String(cell.count);color=COLORS[cell.count]}
                  } else if(cell.flagged) txt="🚩"
                  return(
                    <button key={c} onClick={()=>click(r,c)}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded text-xs font-bold flex items-center justify-center transition-all active:scale-90"
                      style={{background:bg,border:`1px solid ${border}`,color,fontSize:cell.mine||cell.flagged?14:12}}>
                      {txt}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {(phase==="won"||phase==="lost")&&(
          <div className="text-center space-y-3 mt-4">
            <p className={`font-bold text-xl ${phase==="won"?"text-green-400":"text-red-400"}`}>{phase==="won"?"🎉 You cleared the board!":"💥 Boom! Game Over"}</p>
            <Button onClick={reset} className="rounded-full px-6 bg-white/10 hover:bg-white/20 text-white">
              <RotateCcw className="w-4 h-4 mr-2"/>New Game
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
