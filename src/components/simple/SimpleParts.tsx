import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Info, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SectionRule } from '@/components/ui/KeyValue';
import { Button } from '@/components/ui/Button';
import { SeverityBadge } from '@/components/ui/Badge';
import { Panel } from '@/components/ui/Card';
import { severityMeta } from '@/utils/severity';
import type { Severity } from '@/types/common';

/**
 * Plain-language explanation block used across Simple Mode:
 * a clear question as the heading, then the answer.
 */
export function SimpleQA({
  question,
  children,
  tone = 'default',
  className,
}: {
  question: string;
  children: ReactNode;
  tone?: 'default' | 'warn' | 'critical' | 'positive';
  className?: string;
}) {
  const toneClass =
    tone === 'critical' ? 'border-critical/30 bg-critical/[0.04]'
      : tone === 'warn' ? 'border-high/30 bg-high/[0.04]'
        : tone === 'positive' ? 'border-term/25 bg-term/[0.03]'
          : 'border-line bg-base';
  return (
    <section className={cn('rounded-[2px] border p-3', toneClass, className)} aria-label={question}>
      <h3 className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.04em] text-ink uppercase">
        <Info className="size-3.5 shrink-0 text-cyber" aria-hidden />
        {question}
      </h3>
      <div className="space-y-2 text-[12.5px] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

/**
 * Progressive disclosure for technical fields — collapsed by default in
 * Simple Mode so beginners see the answer first, experts keep full detail.
 */
export function TechnicalDetails({
  title = 'Technical details',
  hint,
  children,
  defaultOpen = false,
  className,
}: {
  title?: string;
  hint?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn('rounded-[2px] border border-line-2 bg-base', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-panel-2"
      >
        <span className="mono min-w-0 flex-1 text-[11px] font-semibold tracking-[0.06em] text-ink-2 uppercase">
          {title}
        </span>
        {hint ? <span className="mono hidden truncate text-[10.5px] text-ink-4 sm:block">{hint}</span> : null}
        {open ? (
          <ChevronUp className="size-3.5 shrink-0 text-term" aria-hidden />
        ) : (
          <ChevronDown className="size-3.5 shrink-0 text-ink-4" aria-hidden />
        )}
      </button>
      {open ? (
        <div className="border-t border-line px-3 py-2.5">
          <SectionRule className="mb-1.5"><span>Forensic fields — unchanged from Analyst Mode</span></SectionRule>
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** Severity colour helper for plain-language tone chips. */
export function severityTone(severity: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
  if (severity === 'critical') return 'critical';
  if (severity === 'high') return 'high';
  if (severity === 'medium') return 'medium';
  if (severity === 'low') return 'low';
  return 'info';
}

/**
 * Plain-language severity intent shared across Simple Mode:
 * tells a non-technical reader how urgently they should act.
 */
export function severityIntent(severity: string): string {
  if (severity === 'critical') return 'Immediate attention';
  if (severity === 'high') return 'Needs attention';
  if (severity === 'medium') return 'Review recommended';
  return 'Informational';
}

/**
 * Severity communicated by colour AND words — the badge plus the intent
 * phrase, so meaning never relies on colour alone (WCAG).
 */
export function SeverityLine({ severity, className }: { severity: string; className?: string }) {
  const meta = severityMeta(severity as Severity);
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1.5', className)}>
      <SeverityBadge severity={severity as Severity} showGlyph={false} />
      <span className={cn('mono truncate text-[10.5px] font-semibold tracking-[0.02em] uppercase', meta.text)}>
        {meta.label} · {severityIntent(severity)}
      </span>
    </span>
  );
}

/** "Ask AI" entry point kept one click away across Simple Mode pages. */
export function AskAIButton({
  to = '/ai-assistant',
  label = 'Ask AI',
  size = 'xs',
  className,
}: {
  to?: string;
  label?: string;
  size?: 'xs' | 'sm';
  className?: string;
}) {
  return (
    <Link to={to} className={className}>
      <Button size={size} variant="ghost" icon={<Sparkles className="size-3" aria-hidden />}>{label}</Button>
    </Link>
  );
}

export type SimpleStatusTone = 'ok' | 'warn' | 'critical';

/**
 * Posture hero for Simple pages: one glanceable headline ("Everything looks
 * normal", "Attention needed", "Immediate attention required") plus a plain
 * description and trust reassurance. Optional children render beside the
 * headline (e.g. the dashboard's stat cells).
 */
export function SimpleStatus({
  tone,
  headline,
  description,
  reassurance,
  title = 'Security status',
  icon,
  actions,
  children,
  className,
}: {
  tone: SimpleStatusTone;
  headline: string;
  description: string;
  reassurance?: string;
  title?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const toneMap = {
    ok: { accent: 'term' as const, box: 'border-term/40 bg-term/10 text-term', text: 'text-term', glyph: '✓' },
    warn: { accent: 'high' as const, box: 'border-high/40 bg-high/10 text-high', text: 'text-high', glyph: '▲' },
    critical: { accent: 'critical' as const, box: 'border-critical/40 bg-critical/10 text-critical', text: 'text-critical', glyph: '✖' },
  }[tone];
  return (
    <Panel
      className={cn(
        'min-w-0 border-2',
        tone === 'critical' ? 'border-critical/30 bg-critical/[0.03]'
          : tone === 'warn' ? 'border-high/30 bg-high/[0.03]' : '',
        className,
      )}
      accent={toneMap.accent}
      title={title}
      icon={icon ?? <ShieldCheck className="size-3.5" aria-hidden />}
      actions={actions}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn('grid size-11 shrink-0 place-items-center rounded-[2px] border font-mono text-base', toneMap.box)} aria-hidden>
            {toneMap.glyph}
          </span>
          <div className="min-w-0">
            <p className={cn('mono text-[17px] font-bold tracking-[0.03em] uppercase', toneMap.text)}>{headline}</p>
            <p className="mt-0.5 max-w-xl text-[12.5px] leading-relaxed text-ink-3">{description}</p>
            {reassurance ? <p className="mt-0.5 text-[11.5px] text-ink-4">{reassurance}</p> : null}
          </div>
        </div>
        {children}
      </div>
    </Panel>
  );
}
