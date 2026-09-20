import { forwardRef } from 'react';
import type { ReactNode, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  icon?: ReactNode;
  compact?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, options, icon, compact, id, ...props }, ref,
) {
  const selectId = id ?? `sel-${label?.replace(/\s+/g, '-').toLowerCase() ?? 'field'}`;
  return (
    <div className="min-w-0">
      {label ? <label htmlFor={selectId} className="label-xs mb-1 block">{label}</label> : null}
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-ink-4" aria-hidden>{icon}</span>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full appearance-none rounded-[2px] border border-line-2 bg-base pr-7 text-xs text-ink-2',
            'font-mono uppercase tracking-[0.01em] transition-colors hover:border-line-3',
            'focus:border-term/60 focus:text-ink focus:outline-none disabled:opacity-50',
            compact ? 'h-6 pl-2 text-[10.5px]' : 'h-8 pl-2.5',
            icon && (compact ? 'pl-6' : 'pl-7'),
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled} className="bg-panel text-ink">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2 text-ink-4" aria-hidden />
      </div>
    </div>
  );
});

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

/** Accessible switch used throughout Settings. */
export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start justify-between gap-4 rounded-[2px] border border-transparent px-2 py-1.5 transition-colors hover:border-line hover:bg-panel-2',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className="min-w-0">
        <span className="block text-xs font-medium text-ink-2">{label}</span>
        {description ? <span className="mt-0.5 block text-[10.5px] leading-relaxed text-ink-4">{description}</span> : null}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={cn(
            'block h-4 w-8 rounded-[2px] border transition-colors duration-200',
            checked ? 'border-term/50 bg-term/25' : 'border-line-3 bg-raised',
            'peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-term',
          )}
        />
        <span
          aria-hidden
          className={cn(
            'absolute top-[3px] size-[10px] rounded-[1px] transition-all duration-200',
            checked ? 'left-[19px] bg-term' : 'left-[3px] bg-ink-4',
          )}
        />
      </span>
    </label>
  );
}
