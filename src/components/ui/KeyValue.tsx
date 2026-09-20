import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { CopyButton } from './CopyButton';

export interface KeyValueRow {
  label: string;
  value: ReactNode;
  mono?: boolean;
  copy?: string;
  tone?: string;
  span?: boolean;
}

/**
 * Forensic metadata grid — the `SEVERITY  HIGH / SOURCE  192.168.1.42`
 * presentation used across threat, node and indicator detail views.
 */
export function KeyValueGrid({ rows, className, columns = 2 }: { rows: KeyValueRow[]; className?: string; columns?: 1 | 2 | 3 }) {
  return (
    <dl
      className={cn(
        'grid gap-x-4 gap-y-0',
        columns === 1 && 'grid-cols-1', columns === 2 && 'grid-cols-1 sm:grid-cols-2', columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className={cn(
            'flex min-w-0 items-baseline justify-between gap-3 border-b border-line py-1.5',
            row.span && 'sm:col-span-2 lg:col-span-3',
          )}
        >
          <dt className="field-label shrink-0 pt-0.5">{row.label}</dt>
          <dd className={cn('mono flex min-w-0 items-baseline gap-1.5 text-right text-[11.5px] text-ink', row.tone)}>
            <span className="min-w-0 break-all">{row.value}</span>
            {row.copy ? <CopyButton value={row.copy} className="shrink-0" /> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Horizontal section divider with a small-caps label. */
export function SectionRule({ children, className, right }: { children: ReactNode; className?: string; right?: ReactNode }) {
  return (
    <div className={cn('section-rule', className)}>
      <span className="shrink-0">{children}</span>
      {right ? <span className="shrink-0 normal-case tracking-normal text-ink-4">{right}</span> : null}
    </div>
  );
}
