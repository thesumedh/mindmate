"use client"
import ShaderBackground from "@/components/shader-background"
import Header from "@/components/header"
import { Phone, MessageSquare, Globe, Heart, ExternalLink } from "lucide-react"

const CRISIS = [
  { country:"🇺🇸 United States", name:"988 Suicide & Crisis Lifeline", contact:"Call or text 988", link:"https://988lifeline.org" },
  { country:"🇺🇸 Crisis Text Line", name:"Text HOME to 741741", contact:"Text 741741", link:"https://www.crisistextline.org" },
  { country:"🇬🇧 United Kingdom", name:"Samaritans", contact:"116 123", link:"https://www.samaritans.org" },
  { country:"🇮🇳 India", name:"iCall", contact:"9152987821", link:"https://icallhelpline.org" },
  { country:"🇮🇳 India", name:"Vandrevala Foundation", contact:"1860-2662-345", link:"https://www.vandrevalafoundation.com" },
  { country:"🌍 International", name:"IASP Crisis Centres", contact:"Directory of global hotlines", link:"https://www.iasp.info/resources/Crisis_Centres/" },
]

const APPS = [
  { name:"Woebot", desc:"CBT-based AI mental health chatbot", link:"https://woebothealth.com", emoji:"🤖" },
  { name:"Headspace", desc:"Guided meditation and mindfulness", link:"https://www.headspace.com", emoji:"🧘" },
  { name:"Calm", desc:"Sleep, meditation, and relaxation", link:"https://www.calm.com", emoji:"🌙" },
  { name:"Wysa", desc:"AI chat for emotional wellbeing", link:"https://www.wysa.com", emoji:"🐧" },
  { name:"Daylio", desc:"Mood journal and habit tracker", link:"https://daylio.net", emoji:"📓" },
  { name:"MoodKit", desc:"CBT-based mood improvement tools", link:"https://www.thriveport.com/products/moodkit", emoji:"💚" },
]

const TIPS = [
  { title:"Deep Breathing", desc:"Try box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4–5 times.", emoji:"🌬️" },
  { title:"5-4-3-2-1 Grounding", desc:"Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.", emoji:"🌿" },
  { title:"Physical Movement", desc:"Even a 10-minute walk can reduce anxiety and boost mood significantly.", emoji:"🚶" },
  { title:"Journaling", desc:"Write your thoughts without judgment. It helps process emotions and reduce overthinking.", emoji:"📝" },
  { title:"Reach Out", desc:"Tell one trusted person how you're feeling. Connection is powerful medicine.", emoji:"🤝" },
  { title:"Limit Doom-Scrolling", desc:"Set a 30-minute daily limit on news and social media. Your mind needs rest.", emoji:"📵" },
]

export default function ResourcesPage() {
  return (
    <ShaderBackground>
      <Header />
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-10 space-y-14">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4">
            <Phone className="w-3 h-3"/> If you're in crisis, call or text 988 immediately
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Mental Health Resources</h1>
          <p className="text-white/40">You are not alone. Help is available 24/7.</p>
        </div>

        {/* Crisis Hotlines */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Phone className="w-5 h-5 text-red-400"/>
            <h2 className="text-xl font-semibold text-white">Crisis Hotlines</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {CRISIS.map(r=>(
              <a key={r.name} href={r.link} target="_blank" rel="noopener noreferrer"
                className="group flex items-start gap-4 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-red-500/30 rounded-2xl p-4 transition-all duration-200">
                <div className="flex-1 min-w-0">
                  <p className="text-white/40 text-xs mb-0.5">{r.country}</p>
                  <p className="text-white font-medium text-sm">{r.name}</p>
                  <p className="text-red-400 font-bold text-sm mt-1">{r.contact}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/50 mt-1 transition-colors shrink-0"/>
              </a>
            ))}
          </div>
        </section>

        {/* Self-Help Tips */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Heart className="w-5 h-5 text-pink-400"/>
            <h2 className="text-xl font-semibold text-white">Coping Strategies</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TIPS.map(t=>(
              <div key={t.title} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl mb-2">{t.emoji}</div>
                <h3 className="text-white font-semibold text-sm mb-1">{t.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recommended Apps */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="w-5 h-5 text-blue-400"/>
            <h2 className="text-xl font-semibold text-white">Recommended Apps</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {APPS.map(a=>(
              <a key={a.name} href={a.link} target="_blank" rel="noopener noreferrer"
                className="group flex items-start gap-3 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-blue-500/30 rounded-2xl p-4 transition-all duration-200">
                <div className="text-2xl">{a.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{a.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{a.desc}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 mt-0.5 transition-colors shrink-0"/>
              </a>
            ))}
          </div>
        </section>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/20 text-xs">MindMate is not a medical service. These resources are for informational purposes only.</p>
        </div>
      </main>
    </ShaderBackground>
  )
}
