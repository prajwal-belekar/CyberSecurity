import { Check, ShieldCheck, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { severityMeta } from '@/utils/severity';
import type { SecurityHeader } from '@/types/websecurity';

/** Response-header audit grid with per-header remediation guidance. */
export function SecurityHeaders({ headers }: { headers: SecurityHeader[] }) {
  const present = headers.filter((h) => h.present).length;
  const score = headers.length ? Math.round((present / headers.length) * 100) : 0;

  return (
    <div className="min-w-0">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.01em] text-ink-2">
          <ShieldCheck className="size-3.5 text-cyber" aria-hidden /> Header coverage
        </span>
        <span className={cn('mono tnum text-[13px] font-bold', score >= 80 ? 'text-term' : score >= 50 ? 'text-medium' : 'text-critical')}>
          {score}%
        </span>
        <span className="mono text-[11px] text-ink-4">{present}/{headers.length} PRESENT</span>
        <span className="flex-1" />
        <div className="h-1.5 w-28 overflow-hidden rounded-[1px] bg-raised">
          <div className={cn('h-full', score >= 80 ? 'bg-term' : score >= 50 ? 'bg-medium' : 'bg-critical')} style={{ width: `${score}%` }} aria-hidden />
        </div>
      </div>

      <ul className="space-y-px">
        {headers.map((header) => {
          const meta = severityMeta(header.severity);
          return (
            <li key={header.name} className="rounded-[2px] border border-transparent px-2 py-1.5 transition-colors hover:border-line hover:bg-base">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-[2px] border',
                    header.present ? 'border-term/35 bg-term/10 text-term' : cn(meta.border, meta.soft, meta.text),
                  )}
                  aria-hidden
                >
                  {header.present ? <Check className="size-2.5" /> : <X className="size-2.5" />}
                </span>
                <span className="mono min-w-0 flex-1 truncate text-[11px] text-ink">{header.name}</span>
                {header.present ? (
                  <span className="mono shrink-0 text-[11px] font-bold tracking-[0.01em] text-term uppercase">PRESENT</span>
                ) : (
                  <span className={cn('mono shrink-0 text-[11px] font-bold tracking-[0.01em] uppercase', meta.text)}>
                    {meta.glyph} MISSING
                  </span>
                )}
              </div>
              {header.value ? (
                <p className="mono mt-1 truncate pl-6 text-[11px] text-cyber" title={header.value}>{header.value}</p>
              ) : null}
              {!header.present ? (
                <p className="mono mt-1 pl-6 text-[11px] leading-relaxed text-ink-4">→ {header.recommendation}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
