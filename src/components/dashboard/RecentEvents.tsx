import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ListFilter, Table2 } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useSecurityEvents } from '@/hooks/useSecurityEvents';
import { useUI } from '@/store/UIContext';
import { formatRelative } from '@/utils/dates';
import { severityRank } from '@/utils/severity';
import type { SecurityEvent } from '@/types/threat';
import type { Severity } from '@/types/common';

const PAGE_SIZE = 8;

/**
 * Recent security events grid. Rows open the shared investigation drawer; the
 * "View all" action deep-links into the full threat monitor with filters intact.
 */
export function RecentEvents() {
  const navigate = useNavigate();
  const { openEvent } = useUI();
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const query = { page, pageSize: PAGE_SIZE, severity, search: search || undefined };
  const { data, isLoading, isError, error, refetch, isFetching } = useSecurityEvents(query);

  const columns: Column<SecurityEvent>[] = [
    {
      key: 'severity',
      header: 'Severity',
      sortValue: (row) => severityRank(row.severity),
      width: '104px',
      render: (row) => <SeverityBadge severity={row.severity as Severity} />,
    },
    {
      key: 'event',
      header: 'Event',
      sortValue: (row) => row.type,
      render: (row) => (
        <div className="min-w-0">
          <div className="truncate text-[11.5px] font-medium text-ink">{row.type}</div>
          <div className="mono truncate text-[11px] text-ink-4">
            {row.id}{row.detectionRule ? ` · ${row.detectionRule}` : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      sortValue: (row) => row.source,
      hideBelow: 'md',
      render: (row) => <span className="mono text-[11px] text-cyber">{row.source}</span>,
    },
    {
      key: 'target',
      header: 'Target',
      sortValue: (row) => row.target ?? '',
      hideBelow: 'lg',
      render: (row) => <span className="mono truncate text-[11px] text-ink-3">{row.target ?? '—'}</span>,
    },
    {
      key: 'time',
      header: 'Time',
      sortValue: (row) => +new Date(row.timestamp),
      width: '84px',
      render: (row) => <span className="mono tnum text-[10.5px] whitespace-nowrap text-ink-4">{formatRelative(row.timestamp)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (row) => row.status,
      width: '126px',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const onSort = (key: string) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  return (
    <Panel
      title="Recent Security Events"
      icon={<Table2 className="size-3.5" aria-hidden />}
      noPadding
      className="min-w-0"
      actions={
        <>
          {isFetching && !isLoading ? <span className="mono text-[11px] text-cyber">SYNC…</span> : null}
          <Button
            variant="ghost"
            size="xs"
            iconRight={<ArrowUpRight className="size-3" aria-hidden />}
            onClick={() => navigate(severity !== 'all' ? `/threats?severity=${severity}` : '/threats')}
          >
            View all
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-base px-2.5 py-1.5">
        <SearchInput
          value={search}
          onValueChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Filter events by type, source or target…"
          aria-label="Search security events"
          className="h-6 max-w-xs text-[11px]"
        />
        <Select
          compact
          aria-label="Filter by severity"
          value={severity}
          onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
          options={[
            { value: 'all', label: 'All severities' },
            { value: 'critical', label: 'Critical' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
            { value: 'info', label: 'Info' },
          ]}
          icon={<ListFilter className="size-3" aria-hidden />}
          className="w-auto"
        />
        <span className="flex-1" />
        <span className="mono hidden text-[11px] text-ink-4 sm:inline">
          Click a row to investigate
        </span>
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        error={isError ? ((error as Error)?.message ?? 'Unable to load security events.') : null}
        onRetry={() => refetch()}
        onRowClick={openEvent}
        sortBy={sortKey}
        sortDir={sortDir}
        onSortChange={onSort}
        rowAccent={(row) =>
          row.severity === 'critical' ? 'var(--color-critical)'
            : row.severity === 'high' ? 'var(--color-high)'
              : row.severity === 'medium' ? 'var(--color-medium)' : undefined}
        emptyTitle="No security events"
        emptyDescription="No events match the current filters. The detection engine is still monitoring."
        caption="Recent security events"
        footer={
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={data?.total ?? 0}
            onChange={setPage}
            label="events"
          />
        }
      />
    </Panel>
  );
}
