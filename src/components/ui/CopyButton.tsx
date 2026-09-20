import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Tooltip } from './Tooltip';

export interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  /** Show the copied value alongside the control (e.g. hashes). */
  withValue?: boolean;
  truncate?: [number, number];
}

/**
 * One-click clipboard control with explicit "Copied" confirmation — the
 * micro-interaction required for IPs, hashes and incident IDs.
 */
export function CopyButton({ value, label = 'Copy to clipboard', className, withValue, truncate }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Sandboxed contexts may block the async clipboard API.
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const display = truncate && value.length > truncate[0] + truncate[1] + 1
    ? `${value.slice(0, truncate[0])}…${value.slice(-truncate[1])}`
    : value;

  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1.5', className)}>
      {withValue ? (
        <span className="mono truncate text-[11px] text-ink-2" title={value}>{display}</span>
      ) : null}
      <Tooltip content={copied ? 'Copied to clipboard' : label}>
        <button
          type="button"
          onClick={copy}
          aria-label={`${label}: ${value}`}
          className={cn(
            'inline-flex size-5.5 shrink-0 items-center justify-center rounded-[2px] border transition-all duration-150',
            copied
              ? 'border-term/50 bg-term/15 text-term'
              : 'border-transparent text-ink-4 hover:border-line-2 hover:bg-raised hover:text-ink-2',
          )}
        >
          {copied ? <Check className="size-3" aria-hidden /> : <Copy className="size-3" aria-hidden />}
        </button>
      </Tooltip>
      <span aria-live="polite" className="sr-only">{copied ? 'Copied to clipboard' : ''}</span>
    </span>
  );
}
