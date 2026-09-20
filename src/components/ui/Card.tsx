import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * Tactical panel — the base surface of the whole application.
 * Deliberately square-ish (3px radius), hairline bordered and flat: this is a
 * data instrument, not a floating glass card.
 */
export interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Renders the standard terminal-style panel header bar. */
  title?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  /** Adds HUD corner brackets. Use sparingly on key panels. */
  /** Emphasises the panel border with an accent colour. */
  accent?: 'critical' | 'high' | 'term' | 'cyber' | 'ai' | 'none';
  bodyClassName?: string;
  noPadding?: boolean;
}

const ACCENTS: Record<NonNullable<PanelProps['accent']>, string> = {
  critical: 'border-critical/45',
  high: 'border-high/40',
  term: 'border-term/35',
  cyber: 'border-cyber/35',
  ai: 'border-ai/35',
  none: '',
};

export function Panel({
  className, title, icon, actions, accent = 'none', bodyClassName, noPadding, children, ...props
}: PanelProps) {
  return (
    <section
      className={cn('panel flex min-w-0 flex-col', ACCENTS[accent], className)}
      {...props}
    >
      {title ? (
        <header className="panel-title shrink-0">
          {icon ? <span className="text-ink-3" aria-hidden>{icon}</span> : null}
          <h2 className="min-w-0 flex-1 truncate text-ink-2">{title}</h2>
          {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn('min-w-0 flex-1', !noPadding && 'p-3', bodyClassName)}>{children}</div>
    </section>
  );
}

export function PanelHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('panel-title', className)} {...props}>{children}</div>;
}

export function PanelFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center gap-2 border-t border-line bg-base px-3 py-1.5', className)}
      {...props}
    >
      {children}
    </div>
  );
}

/** Backwards-compatible alias: the spec calls for a `Card` primitive. */
export const Card = Panel;
