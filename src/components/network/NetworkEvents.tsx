import { useState } from 'react';
import type { ReactNode } from 'react';
import { Ban, CheckCircle2, Flag, Network as NetworkIcon } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { SeverityBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { NetworkFilters } from './NetworkFilters';
import { useNetworkEvents } from '@/hooks/useNetworkEvents';
import { formatBytes } from '@/utils/formatting';
import { formatClockShort } from '@/utils/dates';
import { severityRank } from '@/utils/severity';
import { cn } from '@/utils/cn';
import type { NetworkEvent } from '@/types/network';
import type { NetworkQuery } from '@/services/networkApi';

const PAGE_SIZE = 14;

const ACTION_META: Record<NetworkEvent['action'], { label: string; icon: ReactNode; className: string }> = {
  allowed: { label: 'ALLOWED', icon: <CheckCircle2 className="size-3" aria-hidden />, className: 'border-term/35 bg-term/10 text-term' },
  blocked: { label: 'BLOCKED', icon: <Ban className="size-3" aria-hidden />, className: 'border-critical/35 bg-critical/10 text-critical' },
  flagged: { label: 'FLAGGED', icon: <Flag className="size-3" aria-hidden />, className: 'border-medium/35 bg-medium/10 text-medium' },
};

const EMPTY_QUERY: NetworkQuery = { page: 1, pageSize: PAGE_SIZE };

/** Flow-level network event grid with inline action semantics. */
export function NetworkEvents() {
  const [query, setQuery] = useState<NetworkQuery>(EMPTY_QUERY);
  const [sortKey, setSortKey] = useState<string>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const { data, isLoading, isError, error, refetch, isFetching } = useNetworkEvents(query);

  const columns: Column<NetworkEvent>[] = [
    { key: 'timestamp', header: 'Time', sortValue: (row) => +new Date(row.timestamp), width: '64px', render: (row) => <span className="mono tnum text-[10.5px] text-ink-4">{formatClockShort(row.timestamp)}</span> },
    { key: 'severity', header: 'Sev', sortValue: (row) => severityRank(row.severity), width: '96px', render: (row) => <SeverityBadge severity={row.severity} showGlyph={false} /> },
    { key: 'sourceIp', header: 'Source', sortValue: (row) => row.sourceIp, render: (row) => (
      <div className="min-w-0">
        <div className="mono truncate text-[11px] text-cyber">{row.sourceIp}</div>
        {row.sourceName ? <div className="mono truncate text-[10.5px] text-ink-4">{row.sourceName}</div> : null}
      </div>
    ) },
    { key: 'destIp', header: 'Destination', sortValue: (row) => row.destIp, render: (row) => (
      <div className="min-w-0">
        <div className="mono truncate text-[11px] text-ink-2">{row.destIp}</div>
        {row.destName ? <div className="mono truncate text-[10.5px] text-ink-4">{row.destName}</div> : null}
      </div>
    ) },
    { key: 'destPort', header: 'Port', sortValue: (row) => row.destPort, width: '58px', align: 'right', render: (row) => <span className="mono tnum text-[11px] text-ink-2">{row.destPort}</span> },
    { key: 'protocol', header: 'Proto', sortValue: (row) => row.protocol, width: '62px', hideBelow: 'sm', render: (row) => <span className="mono text-[10.5px] text-ink-3">{row.protocol}</span> },
    { key: 'bytes', header: 'Bytes', sortValue: (row) => row.bytes, width: '78px', align: 'right', hideBelow: 'md', render: (row) => <span className="mono tnum text-[10.5px] text-ink-3">{formatBytes(row.bytes)}</span> },
    { key: 'category', header: 'Category', sortValue: (row) => row.category, hideBelow: 'lg', render: (row) => <span className="truncate text-[11px] text-ink-2">{row.category}</span> },
    { key: 'action', header: 'Action', sortValue: (row) => row.action, width: '104px', render: (row) => {
      const meta = ACTION_META[row.action];
      return (
        <span className={cn('inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-[1px] font-mono text-[11px] font-semibold tracking-[0.01em] uppercase', meta.className)}>
          {meta.icon}{meta.label}
        </span>
      );
    } },
  ];

  const onSort = (key: string) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  return (
    <Panel
      title="Network Events"
      icon={<NetworkIcon className="size-3.5" aria-hidden />}
      noPadding
      className="min-w-0"
      actions={isFetching && !isLoading ? <span className="mono text-[11px] text-cyber">SYNC…</span> : undefined}
    >
      <div className="border-b border-line bg-base px-2.5 py-2">
        <NetworkFilters
          query={query}
          onChange={setQuery}
          onReset={() => setQuery(EMPTY_QUERY)}
          resultCount={data?.total}
        />
      </div>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        error={isError ? ((error as Error)?.message ?? 'Unable to load network events.') : null}
        onRetry={() => refetch()}
        sortBy={sortKey}
        sortDir={sortDir}
        onSortChange={onSort}
        rowAccent={(row) => row.action === 'blocked' ? 'var(--color-critical)' : row.action === 'flagged' ? 'var(--color-medium)' : undefined}
        emptyTitle="No network events"
        emptyDescription="No flows match the current filters."
        emptyIcon={<NetworkIcon className="size-4" aria-hidden />}
        caption="Network flow events"
        maxHeight="none"
        footer={<Pagination page={query.page ?? 1} pageSize={PAGE_SIZE} total={data?.total ?? 0} onChange={(page) => setQuery((q) => ({ ...q, page }))} label="flows" />}
      />
    </Panel>
  );
}
