import { ListFilter, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FilterChips } from '@/components/ui/FilterChips';
import type { NetworkQuery } from '@/services/networkApi';

const PROTOCOLS = ['all', 'TCP', 'UDP', 'ICMP', 'DNS', 'HTTP', 'HTTPS', 'TLS', 'SSH', 'SMB'];
const ACTIONS = ['all', 'allowed', 'blocked', 'flagged'];
const RANGES = ['all', '1H', '6H', '24H', '7D'];

export interface NetworkFiltersProps {
  query: NetworkQuery;
  onChange: (query: NetworkQuery) => void;
  onReset: () => void;
  resultCount?: number;
  className?: string;
}

/** Severity / action / protocol / window filters for the flow table. */
export function NetworkFilters({ query, onChange, onReset, resultCount, className }: NetworkFiltersProps) {
  const set = (patch: Partial<NetworkQuery>) => onChange({ ...query, ...patch, page: 1 });
  const dirty = Boolean(query.search || (query.severity && query.severity !== 'all') || (query.action && query.action !== 'all') || (query.protocol && query.protocol !== 'all') || (query.timeRange && query.timeRange !== 'all'));

  const chips = [
    ...(query.severity && query.severity !== 'all' ? [{ id: 'sev', label: 'SEVERITY', value: query.severity.toUpperCase(), onRemove: () => set({ severity: 'all' }) }] : []),
    ...(query.action && query.action !== 'all' ? [{ id: 'act', label: 'ACTION', value: query.action.toUpperCase(), onRemove: () => set({ action: 'all' }) }] : []),
    ...(query.protocol && query.protocol !== 'all' ? [{ id: 'pro', label: 'PROTOCOL', value: query.protocol, onRemove: () => set({ protocol: 'all' }) }] : []),
    ...(query.timeRange && query.timeRange !== 'all' ? [{ id: 'win', label: 'WINDOW', value: query.timeRange, onRemove: () => set({ timeRange: 'all' }) }] : []),
    ...(query.search ? [{ id: 'q', label: 'SEARCH', value: query.search, onRemove: () => set({ search: undefined }) }] : []),
  ];

  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="flex min-w-[190px] flex-1">
          <SearchInput
            value={query.search ?? ''}
            onValueChange={(v) => set({ search: v || undefined })}
            placeholder="Filter by IP, port, host or category…"
            aria-label="Search network events"
            className="h-7 text-[11px]"
          />
        </div>

        <Select
          compact aria-label="Filter by severity" className="w-auto" icon={<ListFilter className="size-3" aria-hidden />}
          value={query.severity ?? 'all'} onChange={(e) => set({ severity: e.target.value })}
          options={['all', 'critical', 'high', 'medium', 'low', 'info'].map((v) => ({ value: v, label: v === 'all' ? 'All severities' : v.toUpperCase() }))}
        />
        <Select
          compact aria-label="Filter by action" className="w-auto"
          value={query.action ?? 'all'} onChange={(e) => set({ action: e.target.value })}
          options={ACTIONS.map((v) => ({ value: v, label: v === 'all' ? 'All actions' : v.toUpperCase() }))}
        />
        <Select
          compact aria-label="Filter by protocol" className="w-auto"
          value={query.protocol ?? 'all'} onChange={(e) => set({ protocol: e.target.value })}
          options={PROTOCOLS.map((v) => ({ value: v, label: v === 'all' ? 'All protocols' : v }))}
        />
        <Select
          compact aria-label="Filter by time window" className="w-auto"
          value={query.timeRange ?? 'all'} onChange={(e) => set({ timeRange: e.target.value })}
          options={RANGES.map((v) => ({ value: v, label: v === 'all' ? 'All time' : v }))}
        />

        {dirty ? (
          <Button variant="ghost" size="xs" icon={<RotateCcw className="size-3" aria-hidden />} onClick={onReset}>Reset</Button>
        ) : null}
        {typeof resultCount === 'number' ? (
          <span className="ml-auto shrink-0 text-[11px] text-ink-4">{resultCount} flows</span>
        ) : null}
      </div>
      {chips.length ? <FilterChips chips={chips} onClearAll={onReset} className="mt-2" /> : null}
    </div>
  );
}
