import { useState } from 'react';
import { Globe2, RotateCcw, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Panel } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { SeverityBadge, Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FilterChips } from '@/components/ui/FilterChips';
import { CopyButton } from '@/components/ui/CopyButton';
import { intelligenceApi, type IntelligenceQuery } from '@/services/intelligenceApi';
import { queryKeys } from '@/services/queryKeys';
import { formatRelative } from '@/utils/dates';
import { severityRank } from '@/utils/severity';
import { cn } from '@/utils/cn';
import type { ThreatIndicator, IndicatorStatus } from '@/types/intelligence';

const PAGE_SIZE = 14;
const EMPTY_QUERY: IntelligenceQuery = { page: 1, pageSize: PAGE_SIZE, type: 'all', risk: 'all', status: 'all' };

const TYPES = ['all', 'ip', 'domain', 'url', 'file_hash', 'email'];
const RISKS = ['all', 'critical', 'high', 'medium', 'low', 'info'];
const STATUSES: Array<IndicatorStatus | 'all'> = ['all', 'active', 'suspicious', 'under_review', 'whitelisted', 'expired'];

const STATUS_TONE: Record<IndicatorStatus, string> = {
  active: 'border-critical/40 bg-critical/10 text-critical',
  suspicious: 'border-high/40 bg-high/10 text-high',
  under_review: 'border-medium/40 bg-medium/10 text-medium',
  whitelisted: 'border-term/40 bg-term/10 text-term',
  expired: 'border-line-3 bg-raised text-ink-4',
};

/** Intelligence feed grid with lookup search and a detail drawer opener. */
export function IntelTable({ onSelect }: { onSelect?: (indicator: ThreatIndicator) => void }) {
  const [query, setQuery] = useState<IntelligenceQuery>(EMPTY_QUERY);
  const [lookup, setLookup] = useState('');
  const [lookupMode, setLookupMode] = useState(false);

  const list = useQuery({
    queryKey: queryKeys.intelligence({ ...query, mode: 'list' }),
    queryFn: () => intelligenceApi.list(query),
    enabled: !lookupMode,
    placeholderData: (previous) => previous,
  });

  const searched = useQuery({
    queryKey: queryKeys.intelligence({ lookup, mode: 'lookup' }),
    queryFn: () => intelligenceApi.lookup(lookup),
    enabled: lookupMode && lookup.trim().length > 1,
  });

  const set = (patch: Partial<IntelligenceQuery>) => setQuery((current) => ({ ...current, ...patch, page: 1 }));
  const reset = () => { setQuery(EMPTY_QUERY); setLookup(''); setLookupMode(false); };

  const rows = lookupMode ? (searched.data ?? []) : (list.data?.items ?? []);
  const total = lookupMode ? rows.length : (list.data?.total ?? 0);
  const loading = lookupMode ? searched.isLoading : list.isLoading;
  const failed = lookupMode ? searched.isError : list.isError;
  const failure = (lookupMode ? searched.error : list.error) as Error | null;

  const columns: Column<ThreatIndicator>[] = [
    { key: 'value', header: 'Indicator', sortValue: (row) => row.value, render: (row) => (
      <div className="min-w-0">
        <div className="mono flex items-center gap-1.5">
          <span className="min-w-0 truncate text-[11px] text-cyber">{row.value}</span>
          <CopyButton value={row.value} label={`Copy ${row.value}`} />
        </div>
        <div className="mono truncate text-[10.5px] text-ink-4">{row.id} · {row.source}</div>
      </div>
    ) },
    { key: 'type', header: 'Type', sortValue: (row) => row.type, width: '96px', render: (row) => (
      <span className="mono text-[11px] font-semibold tracking-[0.01em] text-ink-3 uppercase">{row.type.replace(/_/g, ' ')}</span>
    ) },
    { key: 'risk', header: 'Risk', sortValue: (row) => severityRank(row.risk), width: '100px', render: (row) => <SeverityBadge severity={row.risk} showGlyph={false} /> },
    { key: 'status', header: 'Status', sortValue: (row) => row.status, width: '122px', render: (row) => (
      <span className={cn('mono inline-flex rounded-[2px] border px-1.5 py-[1px] text-[10.5px] font-bold tracking-[0.01em] uppercase', STATUS_TONE[row.status])}>
        {row.status.replace(/_/g, ' ')}
      </span>
    ) },
    { key: 'confidence', header: 'Confidence', sortValue: (row) => row.confidence, width: '112px', align: 'right', render: (row) => (
      <span className="flex items-center justify-end gap-1.5">
        <span className="hidden h-1 w-10 overflow-hidden rounded-[1px] bg-raised sm:block">
          <span className="block h-full bg-ai" style={{ width: `${row.confidence * 100}%` }} aria-hidden />
        </span>
        <span className="mono tnum text-[10.5px] text-ai">{(row.confidence * 100).toFixed(0)}%</span>
      </span>
    ) },
    { key: 'relatedEvents', header: 'Hits', sortValue: (row) => row.relatedEvents, width: '64px', align: 'right', hideBelow: 'md', render: (row) => (
      <span className={cn('mono tnum text-[10.5px]', row.relatedEvents ? 'text-high' : 'text-ink-4')}>{row.relatedEvents}</span>
    ) },
    { key: 'threatActor', header: 'Actor', sortValue: (row) => row.threatActor ?? '', width: '140px', hideBelow: 'lg', render: (row) => (
      row.threatActor
        ? <span className="mono truncate text-[11px] text-high">{row.threatActor}</span>
        : <span className="mono text-[11px] text-ink-4">UNATTRIBUTED</span>
    ) },
    { key: 'lastSeen', header: 'Last Seen', sortValue: (row) => +new Date(row.lastSeen), width: '96px', hideBelow: 'xl', render: (row) => (
      <span className="mono tnum text-[11px] text-ink-4">{formatRelative(row.lastSeen)}</span>
    ) },
  ];

  const chips = [
    ...(lookupMode && lookup ? [{ id: 'lookup', label: 'LOOKUP', value: lookup, onRemove: () => { setLookupMode(false); setLookup(''); } }] : []),
    ...(query.type && query.type !== 'all' ? [{ id: 'type', label: 'TYPE', value: query.type.replace(/_/g, ' ').toUpperCase(), onRemove: () => set({ type: 'all' }) }] : []),
    ...(query.risk && query.risk !== 'all' ? [{ id: 'risk', label: 'RISK', value: query.risk.toUpperCase(), onRemove: () => set({ risk: 'all' }) }] : []),
    ...(query.status && query.status !== 'all' ? [{ id: 'status', label: 'STATUS', value: query.status.replace(/_/g, ' ').toUpperCase(), onRemove: () => set({ status: 'all' }) }] : []),
    ...(query.search ? [{ id: 'search', label: 'FILTER', value: query.search, onRemove: () => set({ search: undefined }) }] : []),
  ];

  return (
    <Panel
      title="Intelligence Feed"
      icon={<Globe2 className="size-3.5" aria-hidden />}
      noPadding
      className="min-w-0"
      actions={<Badge tone={lookupMode ? 'ai' : 'neutral'}>{lookupMode ? 'LOOKUP MODE' : 'FULL FEED'}</Badge>}
    >
      <div className="space-y-2 border-b border-line bg-base px-2.5 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex min-w-[200px] flex-1">
            <SearchInput
              value={lookupMode ? lookup : (query.search ?? '')}
              onValueChange={(value) => (lookupMode ? setLookup(value) : set({ search: value || undefined }))}
              placeholder={lookupMode ? 'Exact value lookup — IP, domain, URL or hash…' : 'Filter the feed by value, source, actor or tag…'}
              aria-label={lookupMode ? 'Look up an indicator value' : 'Filter indicators'}
              className="h-7 text-[11px]"
            />
          </div>
          <Button
            variant={lookupMode ? 'primary' : 'secondary'}
            size="xs"
            icon={<Search className="size-3" aria-hidden />}
            onClick={() => { setLookupMode((current) => !current); if (lookupMode) setLookup(''); }}
            aria-pressed={lookupMode}
          >
            {lookupMode ? 'Exit lookup' : 'Value lookup'}
          </Button>
          <Select
            compact aria-label="Filter by type" className="w-auto"
            value={query.type ?? 'all'} onChange={(event) => set({ type: event.target.value as IntelligenceQuery['type'] })}
            options={TYPES.map((value) => ({ value, label: value === 'all' ? 'All types' : value.replace(/_/g, ' ') }))}
          />
          <Select
            compact aria-label="Filter by risk" className="w-auto"
            value={query.risk ?? 'all'} onChange={(event) => set({ risk: event.target.value })}
            options={RISKS.map((value) => ({ value, label: value === 'all' ? 'All risks' : value.toUpperCase() }))}
          />
          <Select
            compact aria-label="Filter by status" className="w-auto"
            value={query.status ?? 'all'} onChange={(event) => set({ status: event.target.value })}
            options={STATUSES.map((value) => ({ value, label: value === 'all' ? 'All statuses' : value.replace(/_/g, ' ') }))}
          />
          {chips.length ? <Button variant="ghost" size="xs" icon={<RotateCcw className="size-3" aria-hidden />} onClick={reset}>Reset</Button> : null}
          <span className="ml-auto shrink-0 text-[11px] text-ink-4">{total} records</span>
        </div>
        {chips.length ? <FilterChips chips={chips} onClearAll={reset} /> : null}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        loading={loading}
        error={failed ? (failure?.message ?? 'Unable to load the intelligence feed.') : null}
        onRetry={() => (lookupMode ? searched.refetch() : list.refetch())}
        onRowClick={onSelect}
        rowAccent={(row) => (row.risk === 'critical' ? 'var(--color-critical)' : row.risk === 'high' ? 'var(--color-high)' : undefined)}
        emptyTitle={lookupMode ? 'No exact match' : 'No indicators match these filters'}
        emptyDescription={lookupMode ? 'Nothing in the feed carries that exact value. Clear the lookup to browse the whole feed.' : 'Widen the filters or clear the search to see more of the feed.'}
        emptyIcon={<Globe2 className="size-4" aria-hidden />}
        caption="Threat intelligence indicators"
        footer={lookupMode ? undefined : (
          <Pagination
            page={query.page ?? 1}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={(page) => setQuery((current) => ({ ...current, page }))}
            label="indicators"
          />
        )}
      />
    </Panel>
  );
}
