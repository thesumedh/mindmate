"use client"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw } from "lucide-react"

type Cell = "X"|"O"|null
const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

function winner(b:Cell[]){for(const[a,c,d]of LINES)if(b[a]&&b[a]===b[c]&&b[a]===b[d])return{w:b[a],line:[a,c,d]};return null}

function minimax(b:Cell[],isMax:boolean,depth:number):number{
  const r=winner(b); if(r)return r.w==="O"?10-depth:depth-10
  if(b.every(c=>c))return 0
  const empty=b.map((c,i)=>c?-1:i).filter(i=>i>=0)
  if(isMax){let v=-99;for(const m of empty){b[m]="O";v=Math.max(v,minimax(b,false,depth+1));b[m]=null}return v}
  else{let v=99;for(const m of empty){b[m]="X";v=Math.min(v,minimax(b,true,depth+1));b[m]=null}return v}
}
function bestMove(b:Cell[]){let bv=-99,bm=-1;b.forEach((c,i)=>{if(!c){b[i]="O";const v=minimax(b,false,0);b[i]=null;if(v>bv){bv=v;bm=i}}});return bm}

export default function TicTacToeGame({onBack,themeColor="#10b981"}:{onBack:()=>void;themeColor?:string}){
  const [board,setBoard]=useState<Cell[]>(Array(9).fill(null))
  const [xTurn,setXTurn]=useState(true)
  const [phase,setPhase]=useState<"idle"|"playing"|"done">("idle")
  const [status,setStatus]=useState("")
  const [winLine,setWinLine]=useState<number[]>([])
  const [scores,setScores]=useState({X:0,O:0,D:0})

  const reset=useCallback(()=>{setBoard(Array(9).fill(null));setXTurn(true);setWinLine([]);setStatus("")},[])

  const doAI=useCallback((b:Cell[])=>{
    const m=bestMove([...b]); if(m===-1)return
    const nb=[...b]; nb[m]="O"
    const r=winner(nb)
    if(r){setWinLine(r.line);setStatus("🤖 AI wins!");setScores(s=>({...s,O:s.O+1}));setPhase("done")}
    else if(nb.every(c=>c)){setStatus("It's a draw!");setScores(s=>({...s,D:s.D+1}));setPhase("done")}
    else setXTurn(true)
    setBoard(nb)
  },[])

  const click=(i:number)=>{
    if(board[i]||!xTurn||phase==="done")return
    const nb=[...board]; nb[i]="X"
    const r=winner(nb)
    if(r){setBoard(nb);setWinLine(r.line);setStatus("🎉 You win!");setScores(s=>({...s,X:s.X+1}));setPhase("done");return}
    if(nb.every(c=>c)){setBoard(nb);setStatus("It's a draw!");setScores(s=>({...s,D:s.D+1}));setPhase("done");return}
    setBoard(nb); setXTurn(false)
    setTimeout(()=>doAI(nb),400)
  }

  const startGame=()=>{reset();setPhase("playing")}

  return(
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-6" style={{background:"radial-gradient(ellipse at center,#0f172a,#020617)"}}>
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10"><ArrowLeft className="w-4 h-4 mr-1"/>Back</Button>
        <span className="text-white font-bold">Tic Tac Toe</span>
        <span className="text-white/40 text-xs">You:X vs AI:O</span>
      </div>

      <div className="flex gap-6 text-sm">
        {[["You (X)",scores.X,"#60a5fa"],["Draws",scores.D,"#9ca3af"],["AI (O)",scores.O,"#f87171"]].map(([l,v,c])=>(
          <div key={String(l)} className="text-center"><div className="font-bold text-xl" style={{color:c as string}}>{v as number}</div><div className="text-white/30 text-xs">{l as string}</div></div>
        ))}
      </div>

      {phase==="idle"?(
        <div className="text-center space-y-4">
          <p className="text-white/50">Play against the AI — can you beat it?</p>
          <Button onClick={startGame} className="rounded-full px-8" style={{background:themeColor,color:"#000"}}>Start Game</Button>
        </div>
      ):(
        <>
          <div className="grid grid-cols-3 gap-2" style={{width:252}}>
            {board.map((cell,i)=>(
              <button key={i} onClick={()=>click(i)}
                className="w-20 h-20 rounded-xl text-3xl font-bold flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{background:winLine.includes(i)?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.05)",border:`2px solid ${winLine.includes(i)?themeColor:"rgba(255,255,255,0.1)"}`,color:cell==="X"?"#60a5fa":"#f87171",cursor:cell||phase==="done"?"default":"pointer"}}>
                {cell}
              </button>
            ))}
          </div>
          {status&&<p className="text-white font-semibold text-lg animate-pulse">{status}</p>}
          {!status&&phase==="playing"&&<p className="text-white/40 text-sm">{xTurn?"Your turn":"AI is thinking..."}</p>}
          {phase==="done"&&(
            <Button onClick={()=>{reset();setPhase("playing")}} className="rounded-full px-6" style={{background:themeColor,color:"#000"}}>
              <RotateCcw className="w-4 h-4 mr-2"/>Play Again
            </Button>
          )}
        </>
      )}
    </div>
  )
}
