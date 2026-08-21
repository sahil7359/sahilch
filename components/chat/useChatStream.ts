'use client';

import { useCallback, useRef, useState } from 'react';

export type SourceChip = { source: string; heading: string | null; url: string | null };
export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceChip[];
  refusal?: boolean;
  done?: boolean;
};

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const sessionId = useRef<string>(crypto.randomUUID());

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (streaming || !q) return;

      setMessages((m) => [...m, { role: 'user', content: q }, { role: 'assistant', content: '' }]);
      setStreaming(true);
      const patchLast = (fn: (m: ChatMessage) => ChatMessage) =>
        setMessages((ms) => {
          const copy = [...ms];
          copy[copy.length - 1] = fn(copy[copy.length - 1]!);
          return copy;
        });

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ message: q, sessionId: sessionId.current }),
        });
        if (!res.body) throw new Error('no stream');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';
          for (const part of parts) {
            const line = part.replace(/^data:\s?/, '').trim();
            if (!line) continue;
            const ev = JSON.parse(line) as { type: string; value?: unknown; copy?: string };
            if (ev.type === 'token') patchLast((m) => ({ ...m, content: m.content + String(ev.value) }));
            else if (ev.type === 'sources') patchLast((m) => ({ ...m, sources: ev.value as SourceChip[] }));
            else if (ev.type === 'refusal') patchLast((m) => ({ ...m, content: ev.copy ?? '', refusal: true }));
            else if (ev.type === 'done') patchLast((m) => ({ ...m, done: true }));
          }
        }
      } catch {
        patchLast((m) => ({
          ...m,
          content: m.content || 'Something went off on my end. Try the contact form instead.',
          refusal: true,
          done: true,
        }));
      } finally {
        setStreaming(false);
      }
    },
    [streaming],
  );

  return { messages, streaming, send };
}
