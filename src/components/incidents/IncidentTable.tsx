import { Link } from 'react-router-dom';
import { AlarmClock } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { SeverityBadge, IncidentStatusBadge, ThreatTypeBadge } from '@/components/ui/Badge';
import { priorityMeta, slaState } from '@/utils/incidentMeta';
import { formatClockShort, formatRelative } from '@/utils/dates';
import { severityRank } from '@/utils/severity';
import { cn } from '@/utils/cn';
import type { Incident } from '@/types/incident';

/** Full incident queue: ID, priority, title, status, assignee, age and SLA. */
export function IncidentTable({
  incidents, loading, error, onRetry,
}: {
  incidents: Incident[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  const columns: Column<Incident>[] = [
    { key: 'id', header: 'Incident', sortValue: (row) => row.id, width: '86px', render: (row) => (
      <Link to={`/incidents/${row.id}`} className="mono text-[10.5px] font-bold text-term underline-offset-2 hover:underline">
        {row.id}
      </Link>
    ) },
    { key: 'priority', header: 'Pri', sortValue: (row) => priorityMeta(row.priority).rank, width: '52px', align: 'center', render: (row) => {
      const meta = priorityMeta(row.priority);
      return <span className={cn('mono inline-flex rounded-[2px] border px-1 py-[1px] text-[10.5px] font-bold uppercase', meta.className)}>{meta.label}</span>;
    } },
    { key: 'title', header: 'Title', sortValue: (row) => row.title, render: (row) => (
      <div className="min-w-0">
        <Link to={`/incidents/${row.id}`} className="block truncate text-[11.5px] font-medium text-ink underline-offset-2 hover:text-term hover:underline">
          {row.title}
        </Link>
        <div className="mono flex items-center gap-1.5 truncate text-[10.5px] text-ink-4">
          <span className="text-cyber">{row.source}</span><span aria-hidden>→</span><span className="text-high">{row.target}</span>
        </div>
      </div>
    ) },
    { key: 'severity', header: 'Severity', sortValue: (row) => severityRank(row.severity), width: '104px', render: (row) => <SeverityBadge severity={row.severity} showGlyph={false} /> },
    { key: 'type', header: 'Type', sortValue: (row) => row.type, width: '136px', hideBelow: 'lg', render: (row) => <ThreatTypeBadge type={row.type} /> },
    { key: 'status', header: 'Status', sortValue: (row) => row.status, width: '126px', render: (row) => <IncidentStatusBadge status={row.status} /> },
    { key: 'assignedTo', header: 'Assignee', sortValue: (row) => row.assignedTo ?? '', width: '104px', hideBelow: 'md', render: (row) => (
      <span className={cn('mono truncate text-[10.5px]', row.assignedTo ? 'text-ink-2' : 'text-ink-4')}>{row.assignedTo ?? 'UNASSIGNED'}</span>
    ) },
    { key: 'sla', header: 'SLA', sortValue: (row) => slaState(row.createdAt, row.priority, row.status).elapsedMinutes, width: '170px', hideBelow: 'xl', render: (row) => {
      const sla = slaState(row.createdAt, row.priority, row.status);
      return (
        <span className={cn('mono inline-flex items-center gap-1 text-[11px] tracking-[0.01em] uppercase', sla.tone === 'critical' ? 'text-critical' : sla.tone === 'medium' ? 'text-medium' : 'text-ink-4')}>
          {sla.tone === 'critical' ? <AlarmClock className="size-2.5" aria-hidden /> : null}
          {sla.label}
        </span>
      );
    } },
    { key: 'updatedAt', header: 'Updated', sortValue: (row) => +new Date(row.updatedAt), width: '110px', render: (row) => (
      <div className="min-w-0">
        <div className="mono tnum text-[10.5px] text-ink-3">{formatClockShort(row.updatedAt)}</div>
        <div className="mono text-[10.5px] text-ink-4">{formatRelative(row.updatedAt)}</div>
      </div>
    ) },
  ];

  return (
    <DataTable
      columns={columns}
      rows={incidents}
      rowKey={(row) => row.id}
      loading={loading}
      error={error}
      onRetry={onRetry}
      rowAccent={(row) => (row.priority === 'p1' ? 'var(--color-critical)' : row.priority === 'p2' ? 'var(--color-high)' : row.priority === 'p3' ? 'var(--color-medium)' : undefined)}
      emptyTitle="No incidents match these filters"
      emptyDescription="Widen the filters or switch to the board view."
      emptyIcon={<AlarmClock className="size-4" aria-hidden />}
      caption="Incident queue"
    />
  );
}
