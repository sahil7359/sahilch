'use client';

import { useEffect, useState } from 'react';
import { features } from '@/lib/env';
import { ChatPanel } from '@/components/chat/ChatPanel';

/**
 * Floating "Ask AI" launcher. With NEXT_PUBLIC_FEATURE_CHAT on it opens the
 * grounded RAG panel; off, it shows an honest "coming soon" — never a broken
 * feature.
 */
export function ChatLauncher() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || features.chat) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {open && features.chat && <ChatPanel onClose={() => setOpen(false)} />}

      {open && !features.chat && (
        <div
          role="dialog"
          aria-label="AI assistant"
          className="fixed bottom-20 right-5 z-50 w-[300px] rounded-[16px] border border-[color:var(--color-hair)] bg-elevated p-5 shadow-2xl"
        >
          <p className="text-sm font-semibold text-ink">Ask AI — coming soon</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            A grounded assistant that answers questions about Sahil&apos;s work,
            with citations and guardrails, is on the way. For now, the contact
            form reaches him directly.
          </p>
          <a href="#contact" onClick={() => setOpen(false)} className="mt-3 inline-block text-[13px] font-medium text-accent">
            Go to contact →
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-50 flex h-12 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-black shadow-lg transition-transform hover:-translate-y-0.5"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-black/70" aria-hidden="true" />
        Ask AI
      </button>
    </>
  );
}
