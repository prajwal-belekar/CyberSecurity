import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSearch, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { SeverityBadge, ThreatTypeBadge, StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionRule } from '@/components/ui/KeyValue';
import { CopyButton } from '@/components/ui/CopyButton';
import { formatClockShort, formatRelative } from '@/utils/dates';
import { severityRank } from '@/utils/severity';
import { cn } from '@/utils/cn';
import type { SecurityEvent } from '@/types/threat';

/** Linked evidence events with an inline forensic detail row. */
export function EvidenceList({ events, incidentId }: { events: SecurityEvent[]; incidentId: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!events.length) {
    return <EmptyState compact icon={<FileSearch className="size-4" aria-hidden />} title="No evidence linked" description="Correlated events will appear here once detection rules attach them to this case." />;
  }

  const columns: Column<SecurityEvent>[] = [
    {
      key: 'expander', header: <span className="sr-only">Expand</span>, ariaLabel: 'Expand evidence', width: '28px', align: 'center',
      render: (row) => (
        <span className={cn('inline-flex size-4 items-center justify-center text-ink-4', expanded === row.id && 'text-term')}>
          {expanded === row.id ? <ChevronUp className="size-3" aria-hidden /> : <ChevronDown className="size-3" aria-hidden />}
        </span>
      ),
    },
    { key: 'timestamp', header: 'Time', sortValue: (row) => +new Date(row.timestamp), width: '104px', render: (row) => (
      <div className="min-w-0">
        <div className="mono tnum text-[10.5px] text-ink-3">{formatClockShort(row.timestamp)}</div>
        <div className="mono text-[10.5px] text-ink-4">{formatRelative(row.timestamp)}</div>
      </div>
    ) },
    { key: 'id', header: 'Event', sortValue: (row) => row.id, width: '86px', render: (row) => <span className="mono text-[11px] text-term">{row.id}</span> },
    { key: 'source', header: 'Source', sortValue: (row) => row.source, width: '128px', hideBelow: 'md', render: (row) => (
      <span className="mono truncate text-[10.5px] text-cyber">{row.source}</span>
    ) },
    { key: 'description', header: 'Observation', sortValue: (row) => row.description ?? row.type, render: (row) => (
      <div className="min-w-0">
        <div className="truncate text-[11.5px] font-medium text-ink">{row.description ?? row.type}</div>
        <div className="mono truncate text-[10.5px] text-ink-4">{row.detectionRule ?? row.channel}</div>
      </div>
    ) },
    { key: 'severity', header: 'Severity', sortValue: (row) => severityRank(row.severity), width: '100px', render: (row) => <SeverityBadge severity={row.severity} showGlyph={false} /> },
    { key: 'type', header: 'Type', sortValue: (row) => row.type, width: '132px', hideBelow: 'lg', render: (row) => <ThreatTypeBadge type={row.type} /> },
    { key: 'status', header: 'Status', sortValue: (row) => row.status, width: '112px', hideBelow: 'md', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'open', header: <span className="sr-only">Open</span>, ariaLabel: 'Open full event', width: '30px', align: 'center', render: (row) => (
      <Link to={`/threats/${row.id}`} aria-label={`Open ${row.id}`} className="inline-flex size-5 items-center justify-center rounded-[2px] text-ink-4 transition-colors hover:bg-raised hover:text-cyber">
        <ExternalLink className="size-3" aria-hidden />
      </Link>
    ) },
  ];

  return (
    <div className="min-w-0">
      <SectionRule className="mb-1.5">
        <span>Linked evidence · {events.length} EVENT{events.length === 1 ? '' : 'S'}</span>
      </SectionRule>
      <DataTable
        columns={columns}
        rows={events}
        rowKey={(row) => row.id}
        onRowClick={(row) => setExpanded((current) => (current === row.id ? null : row.id))}
        selectedKey={expanded}
        rowAccent={(row) => (row.severity === 'critical' ? 'var(--color-critical)' : row.severity === 'high' ? 'var(--color-high)' : undefined)}
        caption={`Evidence linked to ${incidentId}`}
      />

      {expanded ? (() => {
        const event = events.find((candidate) => candidate.id === expanded);
        if (!event) return null;
        return (
          <div className="mt-2 rounded-[2px] border border-line-2 bg-base p-2.5">
            <p className="text-[11.5px] leading-relaxed text-ink-2">{event.description}</p>
            <dl className="mt-2 grid gap-x-3 gap-y-1 sm:grid-cols-2 xl:grid-cols-3">
              {([
                ['SOURCE', event.source],
                ['TARGET', event.target ?? '—'],
                ['CHANNEL', event.channel],
                ['DETECTION RULE', event.detectionRule ?? '—'],
                ['THREAT', event.threatId ?? '—'],
                ['INCIDENT', event.incidentId ?? incidentId],
              ] as Array<[string, string]>).map(([label, value]) => (
                <div key={label} className="flex items-baseline gap-1.5 border-b border-line py-1">
                  <dt className="label-xs shrink-0">{label}</dt>
                  <dd className="mono flex min-w-0 flex-1 items-baseline justify-end gap-1 truncate text-[10.5px] text-ink-2">
                    <span className="min-w-0 truncate">{value}</span>
                    {value !== '—' ? <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} /> : null}
                  </dd>
                </div>
              ))}
            </dl>
            {event.metadata && Object.keys(event.metadata).length ? (
              <div className="mt-2">
                <SectionRule className="mb-1"><span>Event metadata</span></SectionRule>
                <ul className="flex flex-wrap gap-1">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <li key={key} className="mono inline-flex items-center gap-1 rounded-[2px] border border-line-2 bg-raised px-1.5 py-[1px] text-[11px] text-ink-3">
                      <span className="text-ink-4 uppercase">{key}</span>
                      <span className="text-cyber">{String(value)}</span>
                      <CopyButton value={`${key}=${String(value)}`} label={`Copy ${key}`} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        );
      })() : null}
    </div>
  );
}
