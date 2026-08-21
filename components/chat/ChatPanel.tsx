'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStream } from '@/components/chat/useChatStream';
import { Message } from '@/components/chat/Message';

const SUGGESTIONS = [
  'What is DataChat?',
  'What did he do at TCS?',
  'Which certifications does he hold?',
  'How was this site built?',
];

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const { messages, streaming, send } = useChatStream();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-20 right-5 z-50 flex h-[520px] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[16px] border border-[color:var(--color-hair)] bg-surface shadow-2xl">
      <header className="flex items-center justify-between border-b border-[color:var(--color-hair)] px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-ink">Ask about Sahil</p>
          <p className="text-[11px] text-muted">Grounded in his work — it refuses everything else.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close chat" className="flex h-8 w-8 items-center justify-center text-muted hover:text-ink">
          ✕
        </button>
      </header>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-busy={streaming}
        className="flex-1 space-y-3 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <div>
            <p className="text-sm text-muted">
              Ask about Sahil&apos;s projects, experience, skills, or this site.
            </p>
            <div className="mt-3 flex flex-col items-start gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-[color:var(--color-hair)] px-3 py-1.5 text-left text-[13px] text-accent transition-colors hover:border-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => <Message key={i} m={m} />)
        )}
      </div>

      <form onSubmit={submit} className="border-t border-[color:var(--color-hair)] p-3">
        <div className="flex items-center gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Your question
          </label>
          <input
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={500}
            placeholder="Ask a question…"
            disabled={streaming}
            className="flex-1 rounded-full border border-[color:var(--color-hair)] bg-bg px-4 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-accent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
