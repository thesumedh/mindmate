import { useState, useRef, useCallback, useEffect } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const STORAGE_KEY = 'mindmate-chat-history';

function loadMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveMessages(msgs: Message[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-100))); } catch {}
}

export function useCustomChat(apiEndpoint: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const idRef = useRef(0);
  const initialized = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const saved = loadMessages();
    if (saved.length) { setMessages(saved); idRef.current = saved.length * 2; }
  }, []);

  // Persist on change
  useEffect(() => {
    if (initialized.current && messages.length) saveMessages(messages);
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const clearHistory = useCallback(() => {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  const handleSubmit = useCallback(async (eOrMsg?: React.FormEvent | string) => {
    let messageContent = '';
    
    if (typeof eOrMsg === 'string') {
      messageContent = eOrMsg;
    } else if (eOrMsg && 'preventDefault' in eOrMsg) {
      eOrMsg.preventDefault();
      messageContent = input;
      setInput('');
    } else {
      messageContent = input;
      setInput('');
    }

    if (!messageContent.trim() || isLoading) return;

    const userMsg: Message = { id: `m-${idRef.current++}`, role: 'user', content: messageContent, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    try {
      const res = await fetch(apiEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [...messages, userMsg] }) });
      if (!res.ok) throw new Error(res.statusText);
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No body');
      const aiMsg: Message = { id: `m-${idRef.current++}`, role: 'assistant', content: '', timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      const dec = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        setMessages(prev => { const u = [...prev]; if (u[u.length-1].role==='assistant') u[u.length-1]={...u[u.length-1],content:buf}; return u; });
      }
    } catch {
      setMessages(prev => [...prev, { id:`m-${idRef.current++}`, role:'assistant', content:'Sorry, something went wrong. Please try again.', timestamp: Date.now() }]);
    } finally { setIsLoading(false); }
  }, [input, isLoading, messages, apiEndpoint]);

  return { messages, input, handleInputChange, handleSubmit, isLoading, clearHistory };
}
