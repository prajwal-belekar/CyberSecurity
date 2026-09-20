import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  status?: ReactNode;
  className?: string;
  /** Compact variant for dense sub-pages. */
  compact?: boolean;
  meta?: ReactNode;
}

/**
 * Page masthead: title, optional one-line description, status pill and actions.
 * Deliberately plain — no decorative prompt chrome.
 */
export function PageHeader({
  title, description, actions, status, className, compact, meta,
}: PageHeaderProps) {
  return (
    <header className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className={cn(
            'font-semibold tracking-[-0.01em] text-ink',
            compact ? 'text-[15px]' : 'text-[17px] sm:text-[19px]',
          )}>
            {title}
          </h1>
          {status}
        </div>
        {description ? (
          <p className="mt-1 max-w-2xl text-[11.5px] leading-relaxed text-ink-4">{description}</p>
        ) : null}
        {meta ? <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-1.5">{actions}</div> : null}
    </header>
  );
}
