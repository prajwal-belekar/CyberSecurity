import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'terminal' | 'outline';
type Size = 'xs' | 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  /** Marks a control that is architecturally present but not wired yet. */
  unavailable?: boolean;
  block?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-term/12 text-term border-term/45 hover:bg-term/20 hover:border-term/70 active:bg-term/25',
  secondary:
    'bg-raised text-ink-2 border-line-2 hover:bg-line hover:text-ink hover:border-line-3',
  outline:
    'bg-transparent text-ink-2 border-line-2 hover:border-term/45 hover:text-term',
  ghost:
    'bg-transparent text-ink-3 border-transparent hover:bg-raised hover:text-ink',
  danger:
    'bg-critical/12 text-critical border-critical/45 hover:bg-critical/22 hover:border-critical/70',
  terminal:
    'bg-panel text-term border-line-2 hover:border-term/50 hover:bg-term/8',
};

const SIZES: Record<Size, string> = {
  xs: 'h-6 px-2 text-[11px] gap-1',
  sm: 'h-7 px-2.5 text-[11px] gap-1.5',
  md: 'h-9 px-3.5 text-xs gap-2',
};

/**
 * Primary interactive control. Sharp corners, hairline borders and monospace
 * labels keep it consistent with the operator-workstation language.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'secondary', size = 'sm', icon, iconRight, loading, unavailable, block, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading || unavailable}
      aria-busy={loading || undefined}
      aria-disabled={unavailable ? true : undefined}
      className={cn(
        'inline-flex select-none items-center justify-center rounded-[2px] border font-mono font-semibold uppercase tracking-[0.02em]',
        'transition-[background-color,border-color,color,transform] duration-150',
        'active:translate-y-px disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant], SIZES[size], block && 'w-full', className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : icon}
      {children}
      {iconRight && !loading ? iconRight : null}
      {unavailable && !loading ? (
        <span className="ml-1 rounded-[2px] border border-line-3 px-1 text-[10.5px] tracking-wider text-ink-4" title="Not wired to the backend yet">
          SOON
        </span>
      ) : null}
    </button>
  );
});
