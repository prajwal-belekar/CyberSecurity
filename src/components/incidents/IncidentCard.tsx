import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SeverityBadge, ThreatTypeBadge } from '@/components/ui/Badge';
import { priorityMeta, statusMetaFor } from '@/utils/incidentMeta';
import { formatRelative } from '@/utils/dates';
import type { Incident } from '@/types/incident';

const PRIORITY_BAR: Record<Incident['priority'], string> = {
  p1: 'bg-critical',
  p2: 'bg-high',
  p3: 'bg-medium',
  p4: 'bg-low',
};

/** Compact incident card used across the kanban board and the card grid. */
export function IncidentCard({ incident, className }: { incident: Incident; className?: string }) {
  const priority = priorityMeta(incident.priority);
  const status = statusMetaFor(incident.status);

  return (
    <Link
      to={`/incidents/${incident.id}`}
      className={cn(
        'group relative block min-w-0 overflow-hidden rounded-[2px] border border-line-2 bg-panel-2 p-2.5 transition-colors hover:border-line-3 hover:bg-raised focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-term',
        className,
      )}
    >
      <span className={cn('absolute inset-y-0 left-0 w-[2px]', PRIORITY_BAR[incident.priority])} aria-hidden />

      <div className="flex items-baseline gap-1.5">
        <span className="mono shrink-0 text-[11px] font-bold text-term">{incident.id}</span>
        <span className={cn('mono shrink-0 rounded-[2px] border px-1 py-[1px] text-[10.5px] font-bold tracking-[0.01em] uppercase', priority.className)}>
          {priority.label}
        </span>
        <span className="flex-1" />
        <span className={cn('mono shrink-0 text-[10.5px] font-bold tracking-[0.01em] uppercase', status.text)}>{status.label}</span>
      </div>

      <h3 className="mt-1.5 line-clamp-2 text-[12px] leading-snug font-medium text-ink transition-colors group-hover:text-term">
        {incident.title}
      </h3>

      <p className="mono mt-1 line-clamp-2 text-[11px] leading-relaxed text-ink-4">{incident.summary}</p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <SeverityBadge severity={incident.severity} showGlyph={false} />
        <ThreatTypeBadge type={incident.type} />
      </div>

      <dl className="mt-2 space-y-0.5 border-t border-line pt-1.5">
        <div className="flex items-baseline gap-1.5">
          <dt className="field-label shrink-0">Source</dt>
          <dd className="mono min-w-0 flex-1 truncate text-[11px] text-cyber">{incident.source}</dd>
        </div>
        <div className="flex items-baseline gap-1.5">
          <dt className="field-label shrink-0">Target</dt>
          <dd className="mono min-w-0 flex-1 truncate text-[11px] text-high">{incident.target}</dd>
        </div>
      </dl>

      <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ink-4">
        <span className="mono inline-flex items-center gap-1">
          <User className="size-2.5" aria-hidden />{incident.assignedTo ?? 'UNASSIGNED'}
        </span>
        <span className="mono inline-flex items-center gap-1">
          <Clock className="size-2.5" aria-hidden />{formatRelative(incident.updatedAt)}
        </span>
        <span className="mono tnum ml-auto">{incident.timeline.length} ENTRIES</span>
      </div>
    </Link>
  );
}
