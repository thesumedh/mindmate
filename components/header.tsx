"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

const NAV = [
  { href:"/",          label:"Home" },
  { href:"/chat",      label:"Chat" },
  { href:"/games",     label:"Games" },
  { href:"/journal",   label:"Journal" },
  { href:"/resources", label:"Resources" },
  { href:"/docs",      label:"Docs" },
]

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="relative z-20 flex items-center justify-between p-4 sm:p-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" onClick={()=>setOpen(false)}>
          <svg fill="none" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="size-9 text-white transition-transform duration-300 group-hover:scale-105">
            <defs><linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="currentColor"/><stop offset="100%" stopColor="rgba(255,255,255,0.6)"/></linearGradient></defs>
            <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#lg)"/>
            <text x="20" y="27" textAnchor="middle" fontSize="16" fontWeight="bold" fill="black" fontFamily="system-ui">MM</text>
          </svg>
          <span className="text-white font-semibold text-base hidden sm:block">MindMate</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-1">
          {NAV.map(({href,label})=>(
            <Link key={href} href={href}
              className={`text-xs font-light px-3 py-2 rounded-full transition-all duration-200 ${pathname===href?"bg-white/15 text-white":"text-white/70 hover:text-white hover:bg-white/10"}`}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/chat" className="hidden sm:flex px-5 py-2 rounded-full bg-white text-black font-medium text-xs transition-all hover:bg-white/90 hover:scale-105 active:scale-95">
            Start Chat
          </Link>
          {/* Hamburger */}
          <button onClick={()=>setOpen(o=>!o)} className="md:hidden p-2 rounded-full hover:bg-white/10 text-white transition-colors" aria-label="Menu">
            {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30 flex flex-col" style={{background:"rgba(0,0,0,0.95)",backdropFilter:"blur(20px)"}}>
          <div className="flex items-center justify-between p-4">
            <span className="text-white font-semibold">MindMate</span>
            <button onClick={()=>setOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-white"><X className="w-5 h-5"/></button>
          </div>
          <nav className="flex flex-col gap-2 px-4 py-6">
            {NAV.map(({href,label})=>(
              <Link key={href} href={href} onClick={()=>setOpen(false)}
                className={`px-5 py-4 rounded-2xl text-lg font-light transition-all ${pathname===href?"bg-white/10 text-white":"text-white/60 hover:bg-white/5 hover:text-white"}`}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="px-4 mt-auto pb-8">
            <Link href="/chat" onClick={()=>setOpen(false)} className="block w-full py-4 rounded-2xl bg-white text-black font-medium text-center text-lg hover:bg-white/90 transition-all">
              Start Chatting →
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
