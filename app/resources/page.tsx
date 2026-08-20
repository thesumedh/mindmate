/**
 * Emergency Resources & Self-Help Directory Page
 *
 * Concept Explanation:
 * --------------------
 * A core safety pillar of any AI mental health platform is unambiguous, accessible escalation.
 * 
 * Architecture & Design Highlights:
 * 1. **Internationalized Emergency Contacts**: Clear emergency numbers across US (988), UK (116 123), India (iCall, Vandrevala), and global directories.
 * 2. **Evidence-Based Coping Strategies**: Quick micro-interventions (Box Breathing, 5-4-3-2-1 Grounding) that users can practice immediately.
 * 3. **Non-Affiliated Curated Tools**: References to complementary CBT and mindfulness applications (Woebot, Headspace, Wysa).
 */

"use client";

import ShaderBackground from "@/components/shader-background";
import Header from "@/components/header";
import { Phone, MessageSquare, Heart, ExternalLink } from "lucide-react";

/**
 * 24/7 Verified Emergency Crisis Helplines.
 */
const CRISIS_HOTLINES = [
  { country: "🇺🇸 United States", name: "988 Suicide & Crisis Lifeline", contact: "Call or text 988", link: "https://988lifeline.org" },
  { country: "🇺🇸 Crisis Text Line", name: "Text HOME to 741741", contact: "Text 741741", link: "https://www.crisistextline.org" },
  { country: "🇬🇧 United Kingdom", name: "Samaritans", contact: "116 123", link: "https://www.samaritans.org" },
  { country: "🇮🇳 India", name: "iCall Helpline", contact: "9152987821", link: "https://icallhelpline.org" },
  { country: "🇮🇳 India", name: "Vandrevala Foundation", contact: "1860-2662-345", link: "https://www.vandrevalafoundation.com" },
  { country: "🌍 International", name: "IASP Crisis Centres", contact: "Global directory of crisis centers", link: "https://www.iasp.info/resources/Crisis_Centres/" },
];

/**
 * Complementary Digital Wellness Applications.
 */
const RECOMMENDED_APPS = [
  { name: "Woebot", desc: "CBT-based conversational mental health chatbot", link: "https://woebothealth.com", emoji: "🤖" },
  { name: "Headspace", desc: "Guided meditation, mindfulness, and sleep sounds", link: "https://www.headspace.com", emoji: "🧘" },
  { name: "Calm", desc: "Sleep stories, relaxing nature audio, and meditation", link: "https://www.calm.com", emoji: "🌙" },
  { name: "Wysa", desc: "AI chat companion for emotional wellbeing and CBT", link: "https://www.wysa.com", emoji: "🐧" },
  { name: "Daylio", desc: "Micro-diary mood journal and daily habit tracker", link: "https://daylio.net", emoji: "📓" },
  { name: "MoodKit", desc: "Evidence-based CBT mood improvement exercises", link: "https://www.thriveport.com/products/moodkit", emoji: "💚" },
];

/**
 * Fast Evidence-Based Coping Strategies.
 */
const COPING_TIPS = [
  { title: "Box Breathing", desc: "Inhale 4s, hold breath 4s, exhale 4s, hold empty 4s. Repeat 4–5 cycles to activate the parasympathetic nervous system.", emoji: "🌬️" },
  { title: "5-4-3-2-1 Sensory Grounding", desc: "Name 5 things you can see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste to stop anxiety spirals.", emoji: "🌿" },
  { title: "Gentle Movement", desc: "Even a 10-minute walk or light stretching releases endorphins and reduces cortisol levels.", emoji: "🚶" },
  { title: "Expressive Writing", desc: "Write uncensored thoughts in your journal for 5 minutes. Externalizing thoughts reduces mental clutter.", emoji: "📝" },
  { title: "Micro-Connection", desc: "Send a quick message to a trusted friend or family member. Human connection relieves isolation.", emoji: "🤝" },
  { title: "Digital Decompression", desc: "Take a 30-minute break from social feeds and breaking news. Give your nervous system space to rest.", emoji: "📵" },
];

export default function ResourcesPage() {
  return (
    <ShaderBackground>
      <Header />
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-10 space-y-14">
        {/* Page Banner & Headline */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4">
            <Phone className="w-3 h-3" /> If you are in immediate danger or distress, please call or text 988
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Mental Health & Crisis Resources</h1>
          <p className="text-white/40">Confidential, verified support options available 24/7 across the globe.</p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 1: 24/7 Emergency Crisis Hotlines                           */}
        {/* ------------------------------------------------------------------ */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Phone className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Crisis Hotlines & Lifelines</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {CRISIS_HOTLINES.map((hotline) => (
              <a
                key={hotline.name}
                href={hotline.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-red-500/30 rounded-2xl p-4 transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white/40 text-xs mb-0.5">{hotline.country}</p>
                  <p className="text-white font-medium text-sm">{hotline.name}</p>
                  <p className="text-red-400 font-bold text-sm mt-1">{hotline.contact}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/50 mt-1 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 2: Instant Evidence-Based Coping Strategies                 */}
        {/* ------------------------------------------------------------------ */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Heart className="w-5 h-5 text-pink-400" />
            <h2 className="text-xl font-semibold text-white">Evidence-Based Coping Strategies</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {COPING_TIPS.map((tip) => (
              <div key={tip.title} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl mb-2">{tip.emoji}</div>
                <h3 className="text-white font-semibold text-sm mb-1">{tip.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 3: Recommended Digital Wellbeing Apps                       */}
        {/* ------------------------------------------------------------------ */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Recommended Mental Wellbeing Apps</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {RECOMMENDED_APPS.map((app) => (
              <a
                key={app.name}
                href={app.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-blue-500/30 rounded-2xl p-4 transition-all duration-200"
              >
                <div className="text-2xl">{app.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{app.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{app.desc}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 mt-0.5 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </section>
      </main>
    </ShaderBackground>
  );
}
