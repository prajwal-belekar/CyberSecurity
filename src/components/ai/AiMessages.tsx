import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bot, CircleAlert, ExternalLink, Sparkles, Terminal } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Meter } from '@/components/ui/Meter';
import { SkeletonText } from '@/components/ui/Skeleton';
import { formatClockShort } from '@/utils/dates';
import type { ChatMessage } from '@/types/ai';

/** Terminal-flavoured output block inside an assistant answer. */
function OutputBlock({ block }: { block: NonNullable<ChatMessage['blocks']>[number] }) {
  if (block.kind === 'metrics') {
    const entries = block.rows as Record<string, string>;
    return (
      <dl className="mt-1.5 grid gap-x-3 gap-y-0.5 rounded-[2px] border border-line bg-void p-2 sm:grid-cols-2">
        {Object.entries(entries).map(([key, value]) => (
          <div key={key} className="flex items-baseline justify-between gap-2 border-b border-line pb-0.5 last:border-b-0">
            <dt className="label-xs shrink-0">{key}</dt>
            <dd className="mono tnum min-w-0 truncate text-[10.5px] text-cyber">{value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  const rows = block.rows as string[][];
  if (block.kind === 'table') {
    const [head, ...body] = rows;
    return (
      <div className="mt-1.5 overflow-x-auto rounded-[2px] border border-line bg-void">
        <table className="mono w-full border-collapse text-[11px]">
          {head ? (
            <thead>
              <tr className="border-b border-line-2">
                {head.map((cell) => (
                  <th key={cell} scope="col" className="px-2 py-1 text-left font-bold tracking-[0.01em] text-ink-4 uppercase">{cell}</th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {body.map((row, index) => (
              <tr key={index} className="border-b border-line last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className={cn('max-w-[240px] truncate px-2 py-1', cellIndex === 0 ? 'text-ink-2' : 'text-ink-3')}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // timeline
  return (
    <ol className="mt-1.5 space-y-px rounded-[2px] border border-line bg-void p-2">
      {rows.map((row, index) => (
        <li key={index} className="mono flex items-baseline gap-2 text-[11px]">
          <span className="tnum w-12 shrink-0 text-ink-4">{row[0]}</span>
          <span className="shrink-0 text-term" aria-hidden>›</span>
          <span className="min-w-0 flex-1 break-words text-ink-2">{row.slice(1).join(' · ')}</span>
        </li>
      ))}
    </ol>
  );
}

/** Single message row: system note, analyst prompt, or assistant answer. */
function MessageRow({ message }: { message: ChatMessage }) {
  if (message.role === 'system') {
    return (
      <div className="mono flex items-start gap-2 rounded-[2px] border border-line bg-base px-2 py-1.5 text-[11px] leading-relaxed text-ink-4">
        <Terminal className="mt-px size-3 shrink-0 text-ink-4" aria-hidden />
        <span className="min-w-0 break-words">{message.content}</span>
      </div>
    );
  }

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="mono max-w-[85%] rounded-[2px] border border-volt/30 bg-volt/[0.07] px-2.5 py-1.5">
          <p className="text-[11.5px] leading-relaxed break-words text-ink">{message.content}</p>
          <p className="mt-0.5 text-right text-[10.5px] text-ink-4">{formatClockShort(message.timestamp)}</p>
        </div>
      </div>
    );
  }

  return (
    <article className="min-w-0 rounded-[2px] border border-ai/25 bg-ai/[0.04] p-2.5">
      <header className="mb-1.5 flex flex-wrap items-center gap-2">
        <span className="flex size-4 items-center justify-center rounded-[2px] border border-ai/40 bg-ai/10">
          <Sparkles className="size-2.5 text-ai" aria-hidden />
        </span>
        <span className="mono text-[11px] font-bold tracking-[0.02em] text-ai ">AI analysis</span>
        {typeof message.confidence === 'number' ? (
          <span className="ml-auto flex items-center gap-1.5">
            <span className="mono text-[10.5px] tracking-[0.01em] text-ink-4 uppercase">CONF</span>
            <span className="w-14"><Meter value={message.confidence * 100} tone="ai" showValue={false} /></span>
            <span className="mono tnum text-[11px] text-ai">{Math.round(message.confidence * 100)}%</span>
          </span>
        ) : null}
        <span className="mono text-[10.5px] text-ink-4">{formatClockShort(message.timestamp)}</span>
      </header>

      <div className="space-y-1.5">
        {message.content.split('\n').filter(Boolean).map((paragraph, index) => (
          <p key={index} className="text-[11.5px] leading-relaxed whitespace-pre-wrap text-ink-2">{paragraph}</p>
        ))}
      </div>

      {message.blocks?.map((block, index) => <OutputBlock key={index} block={block} />)}

      {message.citations?.length ? (
        <div className="mt-2 border-t border-line pt-1.5">
          <p className="label-xs mb-1">Sources</p>
          <ul className="flex flex-wrap gap-1">
            {message.citations.map((citation) => (
              <li key={citation.id}>
                {citation.href ? (
                  <Link
                    to={citation.href}
                    className="mono inline-flex items-center gap-1 rounded-[2px] border border-line-2 bg-raised px-1.5 py-[1px] text-[11px] text-ink-3 transition-colors hover:border-ai/40 hover:text-ai"
                  >
                    {citation.label}<ExternalLink className="size-2" aria-hidden />
                  </Link>
                ) : (
                  <span className="mono inline-flex items-center gap-1 rounded-[2px] border border-line-2 bg-raised px-1.5 py-[1px] text-[11px] text-ink-4">
                    {citation.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {message.status === 'error' || message.error ? (
        <p className="mono mt-2 flex items-center gap-1.5 rounded-[2px] border border-critical/30 bg-critical/[0.06] px-2 py-1 text-[11px] text-critical">
          <CircleAlert className="size-3" aria-hidden />{message.error ?? 'Analysis failed.'}
        </p>
      ) : null}
    </article>
  );
}

/** Scrolling conversation transcript with an auto-scroll anchor. */
export function AiMessages({ messages, thinking }: { messages: ChatMessage[]; thinking: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, thinking]);

  return (
    <div className="min-w-0 space-y-2">
      {messages.map((message) => <MessageRow key={message.id} message={message} />)}
      {thinking ? (
        <div className="rounded-[2px] border border-ai/25 bg-ai/[0.04] p-2.5">
          <header className="mb-1.5 flex items-center gap-2">
            <span className="flex size-4 items-center justify-center rounded-[2px] border border-ai/40 bg-ai/10">
              <Bot className="size-2.5 animate-pulse text-ai" aria-hidden />
            </span>
            <span className="mono text-[11px] font-bold tracking-[0.02em] text-ai ">Correlating evidence…</span>
          </header>
          <SkeletonText lines={3} />
        </div>
      ) : null}
      <div ref={endRef} aria-hidden />
    </div>
  );
}
