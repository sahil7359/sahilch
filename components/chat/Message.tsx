import { SourceChips } from '@/components/chat/SourceChips';
import type { ChatMessage } from '@/components/chat/useChatStream';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils/cn';

// Model output renders as a text node only — never dangerouslySetInnerHTML.
export function Message({ m }: { m: ChatMessage }) {
  const isUser = m.role === 'user';
  const empty = !m.content && !isUser;

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isUser ? 'bg-accent text-black' : 'bg-elevated text-ink',
        )}
      >
        {empty ? (
          <span className="text-muted">Thinking&hellip;</span>
        ) : (
          <span className="whitespace-pre-wrap">{m.content}</span>
        )}

        {!isUser && <SourceChips sources={m.sources} />}

        {!isUser && m.refusal && (
          <a
            href={`mailto:${site.email}`}
            className="mt-2 inline-block rounded-full border border-[color:var(--color-hair)] px-3 py-1 text-[12px] font-medium text-accent"
          >
            Message Sahil
          </a>
        )}
      </div>
    </div>
  );
}
