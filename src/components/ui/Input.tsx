import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Terminal style renders the `TARGET >` prompt prefix used across tools. */
  terminal?: boolean;
  promptLabel?: string;
}

const base =
  'w-full rounded-[2px] border bg-base px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-4 ' +
  'transition-colors duration-150 focus:outline-none focus:border-term/60 focus:bg-base ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

/** Standard text input with optional terminal prompt prefix. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, hint, error, prefix, suffix, terminal, promptLabel, id, ...props },
  ref,
) {
  const inputId = id ?? `in-${label?.replace(/\s+/g, '-').toLowerCase() ?? 'field'}`;
  return (
    <div className="min-w-0">
      {label ? (
        <label htmlFor={inputId} className="label-xs mb-1 block">{label}</label>
      ) : null}
      <div className="relative flex items-stretch">
        {terminal ? (
          <span className="flex items-center rounded-l-[2px] border border-r-0 border-line-2 bg-panel-2 px-2 font-mono text-[11px] font-semibold uppercase tracking-[0.02em] text-term">
            {promptLabel ?? 'TARGET >'}
          </span>
        ) : null}
        {prefix ? (
          <span className="flex items-center rounded-l-[2px] border border-r-0 border-line-2 bg-panel-2 px-2 text-ink-4">
            {prefix}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            base, 'mono min-w-0 flex-1',
            terminal || prefix ? 'rounded-l-none' : '',
            suffix ? 'rounded-r-none' : '',
            error ? 'border-critical/60 focus:border-critical' : 'border-line-2',
            className,
          )}
          {...props}
        />
        {suffix ? (
          <span className="flex items-center rounded-r-[2px] border border-l-0 border-line-2 bg-panel-2 px-2 text-ink-4">
            {suffix}
          </span>
        ) : null}
      </div>
      {error ? (
        <p id={`${inputId}-err`} className="mono mt-1 text-[10.5px] text-critical" role="alert">
          ! {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-[10.5px] leading-relaxed text-ink-4">{hint}</p>
      ) : null}
    </div>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, hint, error, id, ...props }, ref,
) {
  const inputId = id ?? `ta-${label?.replace(/\s+/g, '-').toLowerCase() ?? 'field'}`;
  return (
    <div className="min-w-0">
      {label ? <label htmlFor={inputId} className="label-xs mb-1 block">{label}</label> : null}
      <textarea
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(base, 'resize-y leading-relaxed', error ? 'border-critical/60' : 'border-line-2', className)}
        {...props}
      />
      {error ? <p className="mono mt-1 text-[10.5px] text-critical" role="alert">! {error}</p> : null}
      {hint && !error ? <p className="mt-1 text-[10.5px] text-ink-4">{hint}</p> : null}
    </div>
  );
});

export interface SearchInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: string;
  onValueChange: (value: string) => void;
}

/** Search field with inline clear control. */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value, onValueChange, className, ...props }, ref,
) {
  return (
    <div className="relative min-w-0 flex-1">
      <Input
        ref={ref}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn('pl-7', value && 'pr-7', className)}
        {...props}
      />
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-ink-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
      </svg>
      {value ? (
        <button
          type="button"
          onClick={() => onValueChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-[2px] p-0.5 text-ink-4 transition-colors hover:bg-raised hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
});
