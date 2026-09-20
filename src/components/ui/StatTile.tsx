import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { formatDelta } from '@/utils/formatting';
import { Skeleton } from './Skeleton';
import { Tooltip } from './Tooltip';

export interface StatTileProps {
  label: string;
  value: ReactNode;
  /** Raw numeric value used when a bar meter is rendered. */
  icon?: ReactNode;
  trend?: { delta: number; period: string };
  description?: ReactNode;
  tone?: 'critical' | 'high' | 'medium' | 'term' | 'cyber' | 'neutral' | 'ai';
  loading?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
  /** Big zero-padded readout, e.g. 03 */
  padded?: boolean;
  footer?: ReactNode;
}

const TONES: Record<NonNullable<StatTileProps['tone']>, { text: string; bar: string; icon: string }> = {
  critical: { text: 'text-critical', bar: 'bg-critical', icon: 'text-critical' },
  high: { text: 'text-high', bar: 'bg-high', icon: 'text-high' },
  medium: { text: 'text-medium', bar: 'bg-medium', icon: 'text-medium' },
  term: { text: 'text-term', bar: 'bg-term', icon: 'text-term' },
  cyber: { text: 'text-cyber', bar: 'bg-cyber', icon: 'text-cyber' },
  ai: { text: 'text-ai', bar: 'bg-ai', icon: 'text-ai' },
  neutral: { text: 'text-ink', bar: 'bg-ink-3', icon: 'text-ink-3' },
};

/**
 * Security summary tile: icon, large numeric readout, label, trend and one line
 * of context. Sharp, flat and dense — the dashboard's primary instrument.
 */
export function StatTile({
  label, value, icon, trend, description, tone = 'neutral', loading, onClick, href, className, padded, footer,
}: StatTileProps) {
  const t = TONES[tone];
  const display = padded && typeof value === 'number' ? String(value).padStart(2, '0') : value;

  if (loading) {
    return (
      <div className={cn('panel p-3', className)}>
        <Skeleton className="mb-2.5 h-2 w-20" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="mt-2.5 h-2 w-24" />
      </div>
    );
  }

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="label-xs truncate">{label}</span>
        {icon ? (
          <Tooltip content={label}>
            <span className={cn('shrink-0', t.icon)} aria-hidden>{icon}</span>
          </Tooltip>
        ) : null}
      </div>
      <div className="mt-1.5 flex items-end gap-2">
        <span className={cn('mono tnum text-[26px] leading-none font-semibold tracking-tight', t.text)}>
          {display}
        </span>
        {trend ? (
          <span className={cn(
            'mono tnum mb-0.5 text-[11px] font-semibold',
            trend.delta > 0 ? 'text-critical' : trend.delta < 0 ? 'text-term' : 'text-ink-4',
          )}>
            {formatDelta(trend.delta)}
          </span>
        ) : null}
      </div>
      {description ? (
        <p className="mt-1.5 text-[10.5px] leading-snug text-ink-4">{description}</p>
      ) : null}
      {footer ? <div className="mt-2">{footer}</div> : null}
      <span className={cn('absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100', t.bar)} aria-hidden />
    </>
  );

  const base = cn(
    'panel group relative overflow-hidden p-3 transition-colors duration-200',
    onClick && 'cursor-pointer hover:border-line-3 hover:bg-panel-2 focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-term',
    className,
  );

  if (onClick) {
    return <button type="button" onClick={onClick} className={cn(base, 'text-left')}>{content}</button>;
  }
  if (href) {
    return <a href={href} className={base}>{content}</a>;
  }
  return <div className={base}>{content}</div>;
}
