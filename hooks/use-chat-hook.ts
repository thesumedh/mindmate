/**
 * Custom React Hook: Conversational Chat State & Streaming Client
 *
 * Concept Explanation:
 * --------------------
 * This custom hook abstracts all state management, persistence, and HTTP streaming logic
 * away from the UI presentation components.
 *
 * Key Engineering Concepts:
 * 1. **Web Streams Reader API**: Consumes Server-Sent Events (SSE) token-by-token using `ReadableStream.getReader()`.
 * 2. **TextDecoder with Streaming**: Decodes incoming binary chunks (`Uint8Array`) into UTF-8 text in real time.
 * 3. **Immutable State Updates**: React functional state updates (`setMessages(prev => ...)`) ensure UI re-renders
 *    smoothly as each token arrives without race conditions.
 * 4. **Client-Side Session Persistence**: Chat history is persisted to `localStorage` (capped at the last 100 messages)
 *    so user context survives browser page reloads while maintaining privacy.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Chat message data structure representing a conversation turn.
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const STORAGE_KEY = 'mindmate-chat-history';

/**
 * Safely loads persisted chat history from browser localStorage.
 * Handles SSR safety (Next.js server-side rendering checks).
 */
function loadMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.warn('[Storage] Failed to load chat history from localStorage:', err);
    return [];
  }
}

/**
 * Persists the latest conversation messages to browser localStorage.
 * Capped at 100 messages to prevent hitting browser storage quotas (~5MB).
 */
function saveMessages(msgs: Message[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-100)));
  } catch (err) {
    console.warn('[Storage] Failed to save chat history:', err);
  }
}

/**
 * Main chat hook managing input state, message list, streaming decoder, and network dispatch.
 *
 * @param apiEndpoint - The URL path to dispatch chat requests to (e.g. '/api/chat')
 */
export function useCustomChat(apiEndpoint: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mutable ref counter to guarantee unique IDs for messages across renders
  const idRef = useRef(0);
  const initialized = useRef(false);

  // Load chat history from localStorage once on initial component mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const saved = loadMessages();
    if (saved.length > 0) {
      setMessages(saved);
      idRef.current = saved.length * 2;
    }
  }, []);

  // Synchronize chat history to localStorage whenever messages array updates
  useEffect(() => {
    if (initialized.current && messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

  /**
   * Controlled input change handler for textareas and text inputs.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  /**
   * Clears active in-memory conversation state and purges localStorage.
   */
  const clearHistory = useCallback(() => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.warn('[Storage] Failed to clear localStorage:', err);
      }
    }
  }, []);

  /**
   * Dispatches a user message to the streaming endpoint and processes SSE chunks.
   *
   * @param eOrMsg - Form event trigger OR a direct string prompt (used by Quick Action chips)
   */
  const handleSubmit = useCallback(async (eOrMsg?: React.FormEvent | string) => {
    let messageContent = '';

    // Handle both direct string invocations and Form submit events
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

    // Prevent submitting empty messages or double-submitting during active requests
    if (!messageContent.trim() || isLoading) return;

    // Create optimistic user message
    const userMsg: Message = {
      id: `msg-user-${idRef.current++}`,
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
    };

    // Update state optimistically with user message
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // POST chat history to the streaming API
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream reader is not available in the response');
      }

      // Initialize assistant placeholder message
      const assistantMsgId = `msg-ai-${idRef.current++}`;
      const aiMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);

      // Stream reader loop: reads binary chunks and appends decoded text
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedText += decoder.decode(value, { stream: true });

        // Update only the last assistant message with accumulated text
        setMessages(prev => {
          const newMsgs = [...prev];
          const lastIndex = newMsgs.length - 1;
          if (lastIndex >= 0 && newMsgs[lastIndex].role === 'assistant') {
            newMsgs[lastIndex] = {
              ...newMsgs[lastIndex],
              content: accumulatedText,
            };
          }
          return newMsgs;
        });
      }
    } catch (error) {
      console.error('[Chat Hook] Streaming failure:', error);
      // Graceful error fallback message
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${idRef.current++}`,
          role: 'assistant',
          content: "I'm having a little trouble connecting right now, but I'm here. Please try sending your message again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, apiEndpoint]);

  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    clearHistory,
  };
}
