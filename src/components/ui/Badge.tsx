import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import type { Severity } from '@/types/common';
import { severityMeta, statusMeta, INCIDENT_STATUS_META, threatTypeLabel } from '@/utils/severity';
import type { EventStatus } from '@/types/common';
import type { IncidentStatus } from '@/types/incident';

export interface BadgeProps {
  children: ReactNode;
  className?: string;
  tone?: 'neutral' | 'term' | 'cyber' | 'ai' | 'volt' | 'warn' | 'err';
  size?: 'xs' | 'sm';
  dot?: boolean;
  title?: string;
}

const TONES: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'border-line-2 bg-raised text-ink-3',
  term: 'border-term/35 bg-term/10 text-term',
  cyber: 'border-cyber/35 bg-cyber/10 text-cyber',
  ai: 'border-ai/35 bg-ai/10 text-ai',
  volt: 'border-volt/35 bg-volt/10 text-volt',
  warn: 'border-medium/35 bg-medium/10 text-medium',
  err: 'border-critical/35 bg-critical/10 text-critical',
};

/** Small uppercase monospace tag — the atom of the status vocabulary. */
export function Badge({ children, className, tone = 'neutral', size = 'xs', dot, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1 rounded-[2px] border font-mono font-semibold uppercase tracking-[0.02em] whitespace-nowrap',
        size === 'xs' ? 'px-1.5 py-[1px] text-[11px]' : 'px-2 py-0.5 text-[10.5px]',
        TONES[tone], className,
      )}
    >
      {dot ? <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}

/**
 * Severity badge. Colour is always paired with a glyph + label so severity is
 * never communicated by colour alone (WCAG 1.4.1).
 */
export function SeverityBadge({ severity, className, showGlyph = true }: { severity: Severity; className?: string; showGlyph?: boolean }) {
  const meta = severityMeta(severity);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[2px] border bg-current/10 px-1.5 py-[1px] font-mono text-[11px] font-bold uppercase tracking-[0.02em] whitespace-nowrap',
        meta.text, meta.border, className,
      )}
      style={{ backgroundColor: `${meta.hex}1a` }}
      title={`Severity: ${meta.label}`}
    >
      {showGlyph ? <span aria-hidden>{meta.glyph}</span> : null}
      <span>{meta.label}</span>
      <span className="sr-only">severity</span>
    </span>
  );
}

export function StatusBadge({ status, className }: { status: EventStatus; className?: string }) {
  const meta = statusMeta(status);
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-[1px] font-mono text-[11px] font-semibold uppercase tracking-[0.02em] whitespace-nowrap', meta.className, className)}>
      {meta.label}
    </span>
  );
}

export function IncidentStatusBadge({ status, className }: { status: IncidentStatus; className?: string }) {
  const meta = INCIDENT_STATUS_META[status];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-[1px] font-mono text-[11px] font-semibold uppercase tracking-[0.02em] whitespace-nowrap', meta.className, className)}>
      {meta.label}
    </span>
  );
}

export function ThreatTypeBadge({ type, className }: { type: string; className?: string }) {
  return <Badge className={className} tone="neutral">{threatTypeLabel(type)}</Badge>;
}

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-[2px] border border-line-3 bg-raised px-1.5 py-[1px] font-mono text-[11px] font-bold uppercase tracking-[0.02em] text-ink-2', className)}>
      {priority.toUpperCase()}
    </span>
  );
}
