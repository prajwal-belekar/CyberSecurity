import { Check, Layers, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { severityMeta } from '@/utils/severity';
import { CopyButton } from '@/components/ui/CopyButton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { UrlIndicator } from '@/types/phishing';

/**
 * Indicator breakdown with per-signal weighting, so the risk score is
 * explainable rather than opaque.
 */
export function URLIndicators({ indicators, className }: { indicators: UrlIndicator[]; className?: string }) {
  const detected = indicators.filter((i) => i.detected);
  const maxWeight = Math.max(1, ...indicators.map((i) => i.weight));

  if (!indicators.length) {
    return <EmptyState compact icon={<Layers className="size-4" aria-hidden />} title="No indicators evaluated" />;
  }

  return (
    <div className={cn('min-w-0', className)}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="mono rounded-[2px] border border-critical/35 bg-critical/10 px-1.5 py-[1px] text-[11px] font-bold tracking-[0.01em] text-critical uppercase">
          {detected.length} FLAGGED
        </span>
        <span className="mono rounded-[2px] border border-term/35 bg-term/10 px-1.5 py-[1px] text-[11px] font-bold tracking-[0.01em] text-term uppercase">
          {indicators.length - detected.length} CLEAN
        </span>
        <span className="flex-1" />
        <span className="mono text-[11px] tracking-[0.01em] text-ink-4 ">Weight contribution</span>
      </div>

      <ul className="space-y-px">
        {indicators.map((indicator) => {
          const meta = severityMeta(indicator.severity);
          return (
            <li
              key={indicator.id}
              className={cn(
                'flex items-start gap-2 rounded-[2px] border px-2 py-1.5 transition-colors',
                indicator.detected ? 'border-line-2 bg-base' : 'border-transparent bg-transparent',
              )}
            >
              <span
                className={cn(
                  'mt-px flex size-4 shrink-0 items-center justify-center rounded-[2px] border',
                  indicator.detected ? cn(meta.border, meta.soft, meta.text) : 'border-line-2 bg-raised text-ink-4',
                )}
                aria-hidden
              >
                {indicator.detected ? <X className="size-2.5" /> : <Check className="size-2.5" />}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className={cn('text-[11.5px] font-medium', indicator.detected ? 'text-ink' : 'text-ink-3')}>
                    {indicator.label}
                  </span>
                  {indicator.detected ? (
                    <span className={cn('mono text-[10.5px] font-bold tracking-[0.02em] uppercase', meta.text)}>
                      {meta.glyph} {meta.label}
                    </span>
                  ) : (
                    <span className="mono text-[10.5px] tracking-[0.02em] text-ink-4 uppercase">PASS</span>
                  )}
                  {indicator.weight > 0 ? (
                    <span className="mono tnum text-[11px] text-ink-4">+{indicator.weight}</span>
                  ) : null}
                </div>
                <p className="mono mt-0.5 text-[10.5px] leading-relaxed break-words text-ink-4">{indicator.detail}</p>
                {indicator.weight > 0 ? (
                  <div className="mt-1 h-[3px] w-full max-w-[180px] overflow-hidden rounded-[1px] bg-raised">
                    <div className="h-full" style={{ width: `${(indicator.weight / maxWeight) * 100}%`, background: meta.hex }} aria-hidden />
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** URL decomposition block: protocol, domain, path, length, registration. */
export function UrlInformation({ analysis }: { analysis: { url: string; urlInfo: Record<string, string | undefined>; certificate?: { issuer: string; valid: boolean; expiresAt: string; daysRemaining: number } } }) {
  const info = analysis.urlInfo;
  const rows: Array<[string, string | undefined, boolean?]> = [
    ['URL', analysis.url, true],
    ['PROTOCOL', info.protocol],
    ['DOMAIN', info.domain, true],
    ['SUBDOMAIN', info.subdomain ?? '—'],
    ['TLD', info.tld],
    ['PATH', info.path || '/', true],
    ['QUERY', info.query ?? '—', true],
    ['LENGTH', `${info.length ?? 0} characters`],
    ['DOMAIN AGE', info.domainAge ?? '—'],
    ['REGISTRAR', info.registrar ?? '—'],
  ];

  return (
    <dl className="min-w-0">
      {rows.map(([label, value, copyable]) => (
        <div key={label} className="flex items-baseline justify-between gap-3 border-b border-line py-1.5 last:border-b-0">
          <dt className="label-xs shrink-0">{label}</dt>
          <dd className="mono flex min-w-0 items-baseline gap-1.5 text-right text-[11px] text-ink-2">
            <span className="min-w-0 break-all">{value ?? '—'}</span>
            {copyable && value && value !== '—' ? <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} /> : null}
          </dd>
        </div>
      ))}
      {analysis.certificate ? (
        <div className="mt-2 rounded-[2px] border border-line bg-base p-2">
          <div className="section-rule mb-1.5"><span>TLS certificate</span></div>
          <div className="grid gap-1 sm:grid-cols-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="label-xs">Issuer</span>
              <span className="mono truncate text-[10.5px] text-ink-2">{analysis.certificate.issuer}</span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="label-xs">Valid</span>
              <span className={cn('mono text-[10.5px] font-semibold', analysis.certificate.valid ? 'text-term' : 'text-critical')}>
                {analysis.certificate.valid ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="label-xs">Expires</span>
              <span className="mono text-[10.5px] text-ink-2">{analysis.certificate.expiresAt}</span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="label-xs">Remaining</span>
              <span className={cn('mono text-[10.5px]', analysis.certificate.daysRemaining < 30 ? 'text-medium' : 'text-ink-2')}>
                {analysis.certificate.daysRemaining}d
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </dl>
  );
}
