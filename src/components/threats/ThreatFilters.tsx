import { ListFilter, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FilterChips } from '@/components/ui/FilterChips';
import { SEVERITIES, EVENT_STATUSES, THREAT_TYPES, type EventStatus, type ThreatType } from '@/types/common';
import { SEVERITY_META, STATUS_META, threatTypeLabel } from '@/utils/severity';
import type { ThreatFilters as Filters } from '@/types/threat';

const TIME_RANGES = ['all', '1H', '6H', '24H', '7D', '30D'];

export interface ThreatFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
  resultCount?: number;
  className?: string;
  /** Compact single-row variant for dense workspaces. */
  compact?: boolean;
}

/** Severity / status / type / time-range / source filter bar with visible chips. */
export function ThreatFilters({ filters, onChange, onReset, resultCount, className, compact }: ThreatFiltersProps) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });

  const toggleArray = <T extends string>(key: 'severity' | 'status' | 'type', value: T) => {
    const current = (filters[key] ?? []) as T[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value as T];
    set(key, (next.length ? next : undefined) as Filters[typeof key]);
  };

  const chips = [
    ...(filters.severity ?? []).map((s) => ({
      id: `sev-${s}`, label: 'SEV', value: SEVERITY_META[s].label, onRemove: () => toggleArray('severity', s),
    })),
    ...(filters.status ?? []).map((s) => ({
      id: `st-${s}`, label: 'STATUS', value: STATUS_META[s].label, onRemove: () => toggleArray('status', s),
    })),
    ...(filters.type ?? []).map((t) => ({
      id: `ty-${t}`, label: 'TYPE', value: threatTypeLabel(t), onRemove: () => toggleArray('type', t),
    })),
    ...(filters.timeRange && filters.timeRange !== 'all'
      ? [{ id: 'tr', label: 'WINDOW', value: filters.timeRange, onRemove: () => set('timeRange', 'all') }]
      : []),
    ...(filters.source ? [{ id: 'src', label: 'SOURCE', value: filters.source, onRemove: () => set('source', undefined) }] : []),
    ...(filters.search ? [{ id: 'q', label: 'SEARCH', value: filters.search, onRemove: () => set('search', undefined) }] : []),
  ];

  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="flex min-w-[180px] flex-1 items-center">
          <SearchInput
            value={filters.search ?? ''}
            onValueChange={(v) => set('search', v || undefined)}
            placeholder="Search threats, sources, indicators, IDs…"
            aria-label="Search threats"
            className="h-7 text-[11px]"
          />
        </div>

        <div className="flex items-center gap-0.5 rounded-[2px] border border-line-2 bg-base p-0.5" role="group" aria-label="Severity filter">
          {SEVERITIES.map((severity) => {
            const active = (filters.severity ?? []).includes(severity);
            const meta = SEVERITY_META[severity];
            return (
              <button
                key={severity}
                type="button"
                aria-pressed={active}
                onClick={() => toggleArray('severity', severity)}
                className={cn(
                  'mono rounded-[1px] border px-1.5 py-[2px] text-[11px] font-bold tracking-[0.01em] uppercase transition-colors',
                  active ? cn(meta.border, meta.soft, meta.text) : 'border-transparent text-ink-4 hover:bg-raised hover:text-ink-2',
                )}
                title={`Filter by ${meta.label} severity`}
              >
                {meta.short}
              </button>
            );
          })}
        </div>

        <Select
          compact
          aria-label="Filter by status"
          value={filters.status?.[0] ?? 'all'}
          onChange={(e) => set('status', e.target.value === 'all' ? undefined : [e.target.value as EventStatus])}
          icon={<SlidersHorizontal className="size-3" aria-hidden />}
          className="w-auto"
          options={[{ value: 'all', label: 'All statuses' }, ...EVENT_STATUSES.map((s) => ({ value: s, label: STATUS_META[s].label }))]}
        />

        <Select
          compact
          aria-label="Filter by threat type"
          value={filters.type?.[0] ?? 'all'}
          onChange={(e) => set('type', e.target.value === 'all' ? undefined : [e.target.value as ThreatType])}
          icon={<ListFilter className="size-3" aria-hidden />}
          className="w-auto"
          options={[{ value: 'all', label: 'All types' }, ...THREAT_TYPES.map((t) => ({ value: t, label: threatTypeLabel(t) }))]}
        />

        <Select
          compact
          aria-label="Filter by time range"
          value={filters.timeRange ?? 'all'}
          onChange={(e) => set('timeRange', e.target.value)}
          className="w-auto"
          options={TIME_RANGES.map((r) => ({ value: r, label: r === 'all' ? 'All time' : r }))}
        />

        <div className="flex min-w-[130px] items-center">
          <SearchInput
            value={filters.source ?? ''}
            onValueChange={(v) => set('source', v || undefined)}
            placeholder="Source…"
            aria-label="Filter by source address"
            className="h-6 text-[11px]"
          />
        </div>

        {chips.length ? (
          <Button variant="ghost" size="xs" icon={<RotateCcw className="size-3" aria-hidden />} onClick={onReset}>
            Reset
          </Button>
        ) : null}

        {typeof resultCount === 'number' ? (
          <span className="ml-auto shrink-0 text-[11px] text-ink-4">
            {resultCount} match{resultCount === 1 ? '' : 'es'}
          </span>
        ) : null}
      </div>

      {!compact && chips.length ? (
        <FilterChips chips={chips} onClearAll={onReset} className="mt-2" />
      ) : null}

      {compact && chips.length ? (
        <button
          type="button"
          onClick={onReset}
          className="mono mt-1.5 inline-flex items-center gap-1 text-[11px] tracking-[0.01em] text-ink-4 uppercase transition-colors hover:text-critical"
        >
          <X className="size-2.5" aria-hidden /> {chips.length} FILTER{chips.length === 1 ? '' : 'S'} ACTIVE — CLEAR
        </button>
      ) : null}
    </div>
  );
}
