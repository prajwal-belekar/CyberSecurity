import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * `root@cybersentinel:~$` — the prompt motif. Used only on genuine terminal
 * surfaces (the dock), never as decoration under page titles.
 */
export function Prompt({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div className={cn('term-line flex flex-wrap items-baseline gap-x-2', className)}>
      <span className="prompt shrink-0 select-none">root@cybersentinel:~$</span>
      {children}
    </div>
  );
}

export function Caret({ className }: { className?: string }) {
  return <span className={cn('caret', className)} aria-hidden />;
}

/**
 * Framed terminal output block using box-drawing characters.
 * Visual styling only — no shell is attached to the frontend.
 */
export function TerminalBlock({
  title = 'TERMINAL', children, className, bodyClassName, showCaret = false, maxHeight,
}: {
  title?: string; children: ReactNode; className?: string; bodyClassName?: string;
  showCaret?: boolean; maxHeight?: number;
}) {
  const width = 58;
  const label = `─ ${title} `;
  const top = `┌${label}${'─'.repeat(Math.max(2, width - label.length))}┐`;
  const bottom = `└${'─'.repeat(width)}┘`;

  return (
    <div className={cn('panel overflow-hidden bg-void', className)}>
      <div className="term-line select-none border-b border-line bg-base px-2.5 py-1 text-[10.5px] text-line-3" aria-hidden>
        {top}
      </div>
      <div
        className={cn('term-line overflow-y-auto px-2.5 py-2 text-[11.5px]', bodyClassName)}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {children}
        {showCaret ? (
          <div className="mt-1 flex items-baseline gap-2">
            <span className="prompt select-none">root@cybersentinel:~$</span>
            <Caret />
          </div>
        ) : null}
      </div>
      <div className="term-line select-none border-t border-line bg-base px-2.5 py-1 text-[10.5px] text-line-3" aria-hidden>
        {bottom}
      </div>
    </div>
  );
}

/** Single log line with a severity-tinted channel tag. */
export function LogLine({
  time, channel, message, tone = 'text-ink-2', className, highlight,
}: {
  time?: string; channel?: string; message: ReactNode; tone?: string; className?: string; highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'term-line flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-[1px] px-1 py-[1px]',
        highlight && 'bg-term/[0.05]',
        className,
      )}
    >
      {time ? <span className="mono tnum shrink-0 text-ink-4">{time}</span> : null}
      {channel ? <span className={cn('mono shrink-0 font-semibold', tone)}>[{channel}]</span> : null}
      <span className={cn('min-w-0 break-words', tone === 'text-ink-2' ? 'text-ink-2' : tone)}>{message}</span>
    </div>
  );
}

/** `[ OK ]` / `[ !! ]` prefix used by boot and scan output. */
export function StepLine({
  index, label, state, detail, className,
}: {
  index?: number; label: string;
  state: 'pending' | 'running' | 'ok' | 'warning' | 'fail' | 'complete';
  detail?: string; className?: string;
}) {
  const marker = {
    pending: { text: '[..]', tone: 'text-ink-4' },
    running: { text: '[>>]', tone: 'text-cyber' },
    ok: { text: '[✓]', tone: 'text-term' },
    complete: { text: '[✓]', tone: 'text-term' },
    warning: { text: '[!]', tone: 'text-medium' },
    fail: { text: '[✗]', tone: 'text-critical' },
  }[state];
  const labelTone = {
    pending: 'text-ink-4', running: 'text-cyber', ok: 'text-ink-2', complete: 'text-ink-2',
    warning: 'text-medium', fail: 'text-critical',
  }[state];

  return (
    <div className={cn('term-line flex flex-wrap items-baseline gap-x-2', className)}>
      {typeof index === 'number' ? (
        <span className="mono tnum shrink-0 text-ink-4">[{String(index).padStart(2, '0')}]</span>
      ) : null}
      <span className={cn('mono shrink-0 font-semibold', marker.tone)} aria-hidden>{marker.text}</span>
      <span className={cn('mono', labelTone)}>{label}</span>
      {detail ? <span className="mono min-w-0 text-ink-4">— {detail}</span> : null}
      <span className="sr-only">{label}: {state}</span>
    </div>
  );
}
