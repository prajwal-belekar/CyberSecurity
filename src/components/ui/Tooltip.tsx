import { useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  /** Accessible name for icon-only controls (also used as the tooltip text). */
  label?: string;
}

/**
 * Dependency-free tooltip. Hover *and* keyboard-focus both reveal it, and the
 * text is duplicated into aria-label/aria-describedby so screen readers get the
 * same information an icon-only button would otherwise hide.
 */
export function Tooltip({ content, children, side = 'top', className, label }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = `tip-${Math.random().toString(36).slice(2, 9)}`;

  const position = {
    top: 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
    bottom: 'top-full left-1/2 mt-1.5 -translate-x-1/2',
    left: 'right-full top-1/2 mr-1.5 -translate-y-1/2',
    right: 'left-full top-1/2 ml-1.5 -translate-y-1/2',
  }[side];

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined} aria-label={label} className="inline-flex">
        {children}
      </span>
      {open ? (
        <span
          role="tooltip"
          id={id}
          className={cn(
            'pointer-events-none absolute z-50 max-w-[260px] rounded-[2px] border border-line-3 bg-base px-2 py-1',
            'font-mono text-[11px] leading-relaxed whitespace-normal text-ink-2 shadow-[0_6px_20px_rgba(0,0,0,0.65)]',
            position,
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}

/** Icon-only button with a guaranteed accessible label. */
export function IconButton({
  label, onClick, children, className, active, disabled, title,
}: {
  label: string; onClick?: () => void; children: ReactNode; className?: string;
  active?: boolean; disabled?: boolean; title?: string;
}) {
  return (
    <Tooltip content={title ?? label} label={label}>
      <button
        type="button"
        aria-label={label}
        title={title ?? label}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded-[2px] border transition-colors duration-150',
          active
            ? 'border-term/45 bg-term/12 text-term'
            : 'border-transparent text-ink-3 hover:border-line-2 hover:bg-raised hover:text-ink',
          disabled && 'cursor-not-allowed opacity-40',
          className,
        )}
      >
        {children}
      </button>
    </Tooltip>
  );
}
