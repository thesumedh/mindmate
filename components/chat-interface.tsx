'use client';

import { useCustomChat } from '@/hooks/use-chat-hook';
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Brain, Mic, Phone, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidMetal, PulsingBorder } from '@paper-design/shaders-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

const QUICK_ACTIONS = [
  { label: "I'm feeling anxious 😰", prompt: "I'm feeling anxious right now. Can you help me?" },
  { label: "Help me breathe 🌬️",     prompt: "Can you guide me through a breathing exercise?" },
  { label: "I need motivation 💪",     prompt: "I need some motivation and encouragement today." },
  { label: "Tell me something calm 🌿", prompt: "Tell me something calming and peaceful." },
  { label: "I'm stressed at work 💼",  prompt: "I'm really stressed about work. What should I do?" },
  { label: "Feeling lonely 🌙",        prompt: "I'm feeling lonely and could use some company." },
]

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, clearHistory } = useCustomChat('/api/chat');
  const [isFocused, setIsFocused] = useState(false);
  const [showCrisis, setShowCrisis] = useState(true);
  const [timestamps] = useState(() => new Map<string, Date>());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input?.trim() || isLoading) return;
    handleSubmit(e);
  };

  const sendQuickAction = (prompt: string) => {
    const syntheticEvent = {
      preventDefault: () => {},
      currentTarget: { reset: () => {} },
    } as unknown as React.FormEvent<HTMLFormElement>;

    // Manually inject the prompt
    const inputEvent = {
      target: { value: prompt },
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(inputEvent);

    // Use a small timeout to let the state update
    setTimeout(() => {
      const el = document.getElementById('mindmate-chat-form') as HTMLFormElement | null;
      el?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 50);
  };

  return (
    <div className="w-full min-h-screen bg-black flex flex-col">

      {/* Crisis Banner */}
      <AnimatePresence>
        {showCrisis && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-red-950/80 to-rose-950/80 border-b border-red-800/40 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-2.5 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-xs text-red-300">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>
                  <strong>In crisis?</strong> Call or text{' '}
                  <a href="tel:988" className="text-white font-bold underline underline-offset-2 hover:text-red-200">
                    988
                  </a>{' '}
                  — Suicide & Crisis Lifeline, available 24/7
                </span>
              </div>
              <button
                onClick={() => setShowCrisis(false)}
                className="text-red-400/60 hover:text-red-300 ml-4 text-xs shrink-0"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/50 text-xs">MindMate AI · Anonymous</span>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button onClick={clearHistory} className="text-white/20 hover:text-white/50 text-xs transition-colors">Clear chat</button>
          )}
          <Link href="/games" className="text-white/40 hover:text-white/70 text-xs transition-colors flex items-center gap-1">🎮 Games</Link>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-6">
            {/* Greeting orb */}
            <motion.div
              className="relative flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            >
              <div className="z-10 absolute bg-white/5 h-20 w-20 rounded-full backdrop-blur-[3px] flex items-center justify-center">
                <div className="h-[2px] w-[2px] bg-white rounded-full absolute top-6 left-6 blur-[1px]" />
                <div className="h-[2px] w-[2px] bg-white rounded-full absolute top-5 left-10 blur-[0.8px]" />
              </div>
              <LiquidMetal
                style={{ height: 100, width: 100, filter: 'blur(14px)', position: 'absolute' }}
                colorBack="hsl(0, 0%, 0%, 0)"
                colorTint="hsl(29, 77%, 49%)"
                repetition={4} softness={0.5} shiftRed={0.3} shiftBlue={0.3}
                distortion={0.1} contour={1} shape="circle" scale={0.58} rotation={50} speed={5}
              />
              <LiquidMetal
                style={{ height: 100, width: 100 }}
                colorBack="hsl(0, 0%, 0%, 0)"
                colorTint="hsl(29, 77%, 49%)"
                repetition={4} softness={0.5} shiftRed={0.3} shiftBlue={0.3}
                distortion={0.1} contour={1} shape="circle" scale={0.58} rotation={50} speed={5}
              />
            </motion.div>

            <div>
              <h2 className="text-2xl font-light text-white/90 mb-1">Hey, I'm MindMate 👋</h2>
              <p className="text-white/40 text-sm font-light max-w-sm">
                Your anonymous AI companion. Share anything on your mind — I'm here to listen, no judgment.
              </p>
            </div>

            {/* Quick Action Chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendQuickAction(action.prompt)}
                  className="px-3 py-1.5 rounded-full text-xs text-white/70 border border-white/15 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/25 transition-all duration-200 active:scale-95"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto w-full">
            {/* Quick actions compact strip */}
            <details className="group">
              <summary className="flex items-center gap-1.5 text-white/30 text-xs cursor-pointer hover:text-white/50 transition-colors list-none w-fit">
                <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
                Quick actions
              </summary>
              <div className="flex flex-wrap gap-2 mt-2 mb-1">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => sendQuickAction(action.prompt)}
                    className="px-3 py-1.5 rounded-full text-xs text-white/60 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-200"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </details>

            {messages.map((message) => {
              if (!timestamps.has(message.id)) {
                timestamps.set(message.id, new Date())
              }
              const ts = timestamps.get(message.id)!
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-white/10 text-white rounded-br-sm border border-white/15'
                        : 'bg-white/5 text-white/90 rounded-bl-sm border border-white/8'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <span className="text-white/20 text-[10px] mt-1 px-1">
                    {message.role === 'assistant' ? 'MindMate · ' : ''}{formatTime(ts)}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start max-w-4xl mx-auto w-full"
          >
            <div className="bg-white/5 border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-4 py-5 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto relative">
          <motion.div
            className="absolute w-full h-full z-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isFocused ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          >
            <PulsingBorder
              style={{ height: '146.5%', minWidth: '143%' }}
              colorBack="hsl(0, 0%, 0%)"
              roundness={0.18} thickness={0} softness={0} intensity={0.3}
              bloom={2} spots={2} spotSize={0.25} pulse={0} smoke={0.35}
              smokeSize={0.4} scale={0.7} rotation={0} speed={1}
              colors={['hsl(29, 70%, 37%)', 'hsl(32, 100%, 83%)', 'hsl(4, 32%, 30%)', 'hsl(25, 60%, 50%)', 'hsl(0, 100%, 10%)']}
            />
          </motion.div>

          <motion.div
            className="relative bg-[#040404] rounded-2xl p-4 z-10"
            animate={{ borderColor: isFocused ? '#BA9465' : '#3D3D3D' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ borderWidth: '1px', borderStyle: 'solid' }}
          >
            <form id="mindmate-chat-form" onSubmit={onSubmit}>
              <div className="relative mb-4">
                <Textarea
                  value={input || ''}
                  onChange={handleInputChange as any}
                  placeholder="Share what's on your mind..."
                  disabled={isLoading}
                  className="min-h-[72px] resize-none bg-transparent border-none text-white text-base placeholder:text-zinc-600 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      onSubmit(e as any)
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white p-0"
                    title="Insight mode"
                  >
                    <Brain className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-white/20 text-xs">Enter to send · Shift+Enter for new line</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white p-0"
                    title="Voice input (coming soon)"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !input?.trim()}
                    className="h-9 w-9 rounded-full bg-orange-200 hover:bg-orange-300 disabled:bg-zinc-800 disabled:cursor-not-allowed text-orange-900 p-0 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                    title="Send message"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>

          <p className="text-center text-white/15 text-[10px] mt-3">
            MindMate is not a replacement for professional mental health care. If you're in crisis, please call{' '}
            <a href="tel:988" className="underline hover:text-white/30">988</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
