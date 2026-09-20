import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/Input';
import { FilterChips } from '@/components/ui/FilterChips';
import { cn } from '@/utils/cn';
import type { IncidentPriority, IncidentStatus } from '@/types/incident';

export interface IncidentFilterState {
  search?: string;
  status: IncidentStatus | 'all';
  priority: IncidentPriority | 'all';
  assignee: string | 'all';
}

export const EMPTY_INCIDENT_FILTERS: IncidentFilterState = { status: 'all', priority: 'all', assignee: 'all' };

const STATUSES: Array<IncidentStatus | 'all'> = ['all', 'open', 'investigating', 'contained', 'resolved', 'false_positive'];
const PRIORITIES: Array<IncidentPriority | 'all'> = ['all', 'p1', 'p2', 'p3', 'p4'];
const ASSIGNEES = ['all', 'a.reyes', 'k.nakamura', 'm.okafor', 'j.lindqvist', 'd.mensah'];

export interface IncidentFiltersProps {
  filters: IncidentFilterState;
  onChange: (filters: IncidentFilterState) => void;
  onReset: () => void;
  resultCount?: number;
  className?: string;
}

/** Status / priority / assignee filters shared by the board and table views. */
export function IncidentFilters({ filters, onChange, onReset, resultCount, className }: IncidentFiltersProps) {
  const set = (patch: Partial<IncidentFilterState>) => onChange({ ...filters, ...patch });
  const dirty = filters.status !== 'all' || filters.priority !== 'all' || filters.assignee !== 'all' || Boolean(filters.search);

  const chips = [
    ...(filters.status !== 'all' ? [{ id: 'status', label: 'STATUS', value: filters.status.replace('_', ' ').toUpperCase(), onRemove: () => set({ status: 'all' }) }] : []),
    ...(filters.priority !== 'all' ? [{ id: 'priority', label: 'PRIORITY', value: filters.priority.toUpperCase(), onRemove: () => set({ priority: 'all' }) }] : []),
    ...(filters.assignee !== 'all' ? [{ id: 'assignee', label: 'ASSIGNEE', value: filters.assignee, onRemove: () => set({ assignee: 'all' }) }] : []),
    ...(filters.search ? [{ id: 'search', label: 'SEARCH', value: filters.search, onRemove: () => set({ search: undefined }) }] : []),
  ];

  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="flex min-w-[190px] flex-1">
          <SearchInput
            value={filters.search ?? ''}
            onValueChange={(value) => set({ search: value || undefined })}
            placeholder="Filter by ID, title, source, target or tag…"
            aria-label="Search incidents"
            className="h-7 text-[11px]"
          />
        </div>
        <Select
          compact aria-label="Filter by status" className="w-auto"
          value={filters.status} onChange={(e) => set({ status: e.target.value as IncidentStatus | 'all' })}
          options={STATUSES.map((value) => ({ value, label: value === 'all' ? 'All statuses' : value.replace('_', ' ') }))}
        />
        <Select
          compact aria-label="Filter by priority" className="w-auto"
          value={filters.priority} onChange={(e) => set({ priority: e.target.value as IncidentPriority | 'all' })}
          options={PRIORITIES.map((value) => ({ value, label: value === 'all' ? 'All priorities' : value.toUpperCase() }))}
        />
        <Select
          compact aria-label="Filter by assignee" className="w-auto"
          value={filters.assignee} onChange={(e) => set({ assignee: e.target.value })}
          options={ASSIGNEES.map((value) => ({ value, label: value === 'all' ? 'All analysts' : value }))}
        />
        {dirty ? <Button variant="ghost" size="xs" icon={<RotateCcw className="size-3" aria-hidden />} onClick={onReset}>Reset</Button> : null}
        {typeof resultCount === 'number' ? (
          <span className="ml-auto shrink-0 text-[11px] text-ink-4">{resultCount} incidents</span>
        ) : null}
      </div>
      {chips.length ? <FilterChips chips={chips} onClearAll={onReset} className="mt-2" /> : null}
    </div>
  );
}
