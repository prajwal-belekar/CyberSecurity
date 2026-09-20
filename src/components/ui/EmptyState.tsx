import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** Terminal-flavoured variant used inside log/stream panels. */
  compact?: boolean;
  /**
   * Renders an idle `root@cybersentinel:~$ _` prompt beneath the copy.
   * Use only on surfaces *awaiting operator input* (an empty analyzer, an
   * unselected drawer, a connected-but-quiet stream) — not on "your query
   * returned nothing" states, where a prompt reads as noise.
   */
  prompt?: boolean;
}

/** Never leave a blank screen: explain the absence and offer the next step. */
export function EmptyState({ icon, title, description, action, className, compact, prompt }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-1.5 px-3 py-6' : 'gap-2.5 px-6 py-12',
        className,
      )}
      role="status"
    >
      {icon ? (
        <div className={cn(
          'flex items-center justify-center rounded-[2px] border border-line-2 bg-base text-ink-4',
          compact ? 'size-8' : 'size-11',
        )}>
          {icon}
        </div>
      ) : null}
      <div>
        <p className={cn('font-mono font-semibold tracking-[0.01em] text-ink-2 uppercase', compact ? 'text-[11px]' : 'text-xs')}>
          {title}
        </p>
        {description ? (
          <p className={cn('mx-auto mt-1 max-w-sm leading-relaxed text-ink-4', compact ? 'text-[10.5px]' : 'text-[11.5px]')}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
      {prompt ? (
        <div className="mono mt-1.5 flex items-baseline gap-1.5 text-[11px]" aria-hidden>
          <span className="prompt">root@cybersentinel:~$</span>
          <span className="caret" />
        </div>
      ) : null}
    </div>
  );
}
