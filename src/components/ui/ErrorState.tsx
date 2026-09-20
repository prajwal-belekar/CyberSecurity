import type { ReactNode } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: ReactNode;
  hint?: ReactNode;
  onRetry?: () => void;
  retrying?: boolean;
  /** Optional secondary action rendered beside the retry control. */
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

/** Professional, actionable failure state. */
export function ErrorState({
  title = 'Unable to load data', message, hint, onRetry, retrying, action, className, compact,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center border border-critical/25 bg-critical/[0.04] text-center',
        compact ? 'gap-2 px-3 py-5' : 'gap-3 px-6 py-10',
        className,
      )}
    >
      <div className="flex size-9 items-center justify-center rounded-[2px] border border-critical/35 bg-critical/10 text-critical">
        <AlertTriangle className="size-4.5" aria-hidden />
      </div>
      <div className="max-w-md">
        <p className="font-mono text-[11.5px] font-semibold tracking-[0.01em] text-critical uppercase">{title}</p>
        <p className={cn('mt-1.5 leading-relaxed text-ink-2', compact ? 'text-[11px]' : 'text-xs')}>{message}</p>
        {hint ? <p className="mono mt-2 text-[10.5px] leading-relaxed text-ink-4">{hint}</p> : null}
      </div>
      {onRetry || action ? (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {onRetry ? (
            <Button variant="danger" size="sm" icon={<RotateCw className="size-3.5" aria-hidden />} onClick={onRetry} loading={retrying}>
              Retry
            </Button>
          ) : null}
          {action}
        </div>
      ) : null}
    </div>
  );
}
