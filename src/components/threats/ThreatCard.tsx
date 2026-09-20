import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Meter } from '@/components/ui/Meter';
import { formatRelative } from '@/utils/dates';
import { threatTypeLabel } from '@/utils/severity';
import type { Threat } from '@/types/threat';

/** Compact threat card — used for board layouts and correlated-threat rails. */
export function ThreatCard({ threat, className, onSelect }: { threat: Threat; className?: string; onSelect?: (t: Threat) => void }) {
  const navigate = useNavigate();
  const accent =
    threat.severity === 'critical' ? 'border-l-critical'
      : threat.severity === 'high' ? 'border-l-high'
        : threat.severity === 'medium' ? 'border-l-medium' : 'border-l-low';

  return (
    <article
      className={cn(
        'panel group min-w-0 cursor-pointer border-l-2 p-2.5 transition-colors hover:border-line-3 hover:bg-panel-2',
        accent, className,
      )}
      onClick={() => (onSelect ? onSelect(threat) : navigate(`/threats/${threat.id}`))}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/threats/${threat.id}`); }}
      tabIndex={0}
      role="button"
      aria-label={`Open threat ${threat.id}: ${threat.title}`}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mono text-[11px] font-bold tracking-[0.01em] text-term">{threat.id}</span>
        <SeverityBadge severity={threat.severity} />
        <StatusBadge status={threat.status} />
        <span className="flex-1" />
        <ArrowUpRight className="size-3 text-ink-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
      </div>
      <h3 className="mt-1.5 truncate text-[12.5px] font-semibold text-ink">{threat.title}</h3>
      <p className="mono mt-0.5 truncate text-[11px] text-ink-4">
        {threatTypeLabel(threat.type)} · {threat.source} → {threat.target}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
        <div>
          <div className="label-xs">Confidence</div>
          <Meter value={threat.confidence * 100} tone={threat.confidence >= 0.8 ? 'term' : threat.confidence >= 0.6 ? 'warn' : 'neutral'} className="mt-0.5" />
        </div>
        <div className="text-right">
          <div className="label-xs">Occurrences</div>
          <div className="mono tnum mt-0.5 text-[13px] font-semibold text-ink-2">{threat.occurrences}</div>
        </div>
      </div>
      <div className="mono mt-1.5 flex items-center justify-between gap-2 border-t border-line pt-1.5 text-[11px] text-ink-4">
        <span>FIRST {formatRelative(threat.firstSeen)}</span>
        <span>LAST {formatRelative(threat.lastSeen)}</span>
      </div>
    </article>
  );
}
