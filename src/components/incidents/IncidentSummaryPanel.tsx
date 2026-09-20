import { FileText, Crosshair } from 'lucide-react';
import { SectionRule, KeyValueGrid } from '@/components/ui/KeyValue';
import { SeverityBadge, IncidentStatusBadge, ThreatTypeBadge } from '@/components/ui/Badge';
import { priorityMeta, slaState } from '@/utils/incidentMeta';
import { formatTimestamp } from '@/utils/dates';
import { cn } from '@/utils/cn';
import type { Incident } from '@/types/incident';

/** Executive summary: what happened, what it affected, and the case metadata. */
export function IncidentSummaryPanel({ incident }: { incident: Incident }) {
  const priority = priorityMeta(incident.priority);
  const sla = slaState(incident.createdAt, incident.priority, incident.status);

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-1.5">
        <SeverityBadge severity={incident.severity} />
        <IncidentStatusBadge status={incident.status} />
        <span className={cn('mono rounded-[2px] border px-1.5 py-[1px] text-[10.5px] font-bold tracking-[0.01em] uppercase', priority.className)}>
          {priority.label}
        </span>
        <ThreatTypeBadge type={incident.type} />
        <span className="flex-1" />
        <span className={cn('mono text-[11px] tracking-[0.01em] uppercase', sla.tone === 'critical' ? 'text-critical' : sla.tone === 'medium' ? 'text-medium' : 'text-term')}>
          {sla.label}
        </span>
      </div>

      <div className="mt-2.5">
        <SectionRule className="mb-1"><span className="flex items-center gap-1.5"><FileText className="size-3" aria-hidden />SUMMARY</span></SectionRule>
        <p className="text-[12px] leading-relaxed text-ink-2">{incident.summary}</p>
      </div>

      <div className="mt-2.5">
        <SectionRule className="mb-1"><span className="flex items-center gap-1.5"><Crosshair className="size-3" aria-hidden />Business impact</span></SectionRule>
        <p className="text-[12px] leading-relaxed text-ink-2">{incident.impact}</p>
      </div>

      <div className="mt-2.5">
        <KeyValueGrid
          columns={2}
          rows={[
            { label: 'Incident ID', value: incident.id, copy: incident.id, mono: true },
            { label: 'Assigned to', value: incident.assignedTo ?? 'UNASSIGNED', tone: incident.assignedTo ? undefined : 'text-medium' },
            { label: 'Source', value: incident.source, copy: incident.source, mono: true },
            { label: 'Target', value: incident.target, copy: incident.target, mono: true },
            { label: 'Opened', value: formatTimestamp(incident.createdAt), mono: true },
            { label: 'Last update', value: formatTimestamp(incident.updatedAt), mono: true },
            ...(incident.resolvedAt ? [{ label: 'Resolved', value: formatTimestamp(incident.resolvedAt), mono: true }] : []),
            { label: 'Evidence items', value: `${incident.evidenceEventIds.length} events`, mono: true },
            { label: 'Affected assets', value: `${incident.affectedAssets.length} (${incident.affectedAssets.filter((a) => a.compromised).length} compromised)`, mono: true },
            { label: 'Timeline entries', value: `${incident.timeline.length}`, mono: true },
            { label: 'Tags', value: incident.tags.length ? incident.tags.join(', ') : '—', span: true, mono: true },
          ]}
        />
      </div>
    </div>
  );
}
