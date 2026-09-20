import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/Input';
import { FilterChips } from '@/components/ui/FilterChips';
import { cn } from '@/utils/cn';
export const EMPTY_INCIDENT_FILTERS = { status: 'all', priority: 'all', assignee: 'all' };
const STATUSES = ['all', 'open', 'investigating', 'contained', 'resolved', 'false_positive'];
const PRIORITIES = ['all', 'p1', 'p2', 'p3', 'p4'];
const ASSIGNEES = ['all', 'a.reyes', 'k.nakamura', 'm.okafor', 'j.lindqvist', 'd.mensah'];
/** Status / priority / assignee filters shared by the board and table views. */
export function IncidentFilters({ filters, onChange, onReset, resultCount, className }) {
    const set = (patch) => onChange({ ...filters, ...patch });
    const dirty = filters.status !== 'all' || filters.priority !== 'all' || filters.assignee !== 'all' || Boolean(filters.search);
    const chips = [
        ...(filters.status !== 'all' ? [{ id: 'status', label: 'STATUS', value: filters.status.replace('_', ' ').toUpperCase(), onRemove: () => set({ status: 'all' }) }] : []),
        ...(filters.priority !== 'all' ? [{ id: 'priority', label: 'PRIORITY', value: filters.priority.toUpperCase(), onRemove: () => set({ priority: 'all' }) }] : []),
        ...(filters.assignee !== 'all' ? [{ id: 'assignee', label: 'ASSIGNEE', value: filters.assignee, onRemove: () => set({ assignee: 'all' }) }] : []),
        ...(filters.search ? [{ id: 'search', label: 'SEARCH', value: filters.search, onRemove: () => set({ search: undefined }) }] : []),
    ];
    return (_jsxs("div", { className: cn('min-w-0', className), children: [_jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [_jsx("div", { className: "flex min-w-[190px] flex-1", children: _jsx(SearchInput, { value: filters.search ?? '', onValueChange: (value) => set({ search: value || undefined }), placeholder: "Filter by ID, title, source, target or tag\u2026", "aria-label": "Search incidents", className: "h-7 text-[11px]" }) }), _jsx(Select, { compact: true, "aria-label": "Filter by status", className: "w-auto", value: filters.status, onChange: (e) => set({ status: e.target.value }), options: STATUSES.map((value) => ({ value, label: value === 'all' ? 'All statuses' : value.replace('_', ' ') })) }), _jsx(Select, { compact: true, "aria-label": "Filter by priority", className: "w-auto", value: filters.priority, onChange: (e) => set({ priority: e.target.value }), options: PRIORITIES.map((value) => ({ value, label: value === 'all' ? 'All priorities' : value.toUpperCase() })) }), _jsx(Select, { compact: true, "aria-label": "Filter by assignee", className: "w-auto", value: filters.assignee, onChange: (e) => set({ assignee: e.target.value }), options: ASSIGNEES.map((value) => ({ value, label: value === 'all' ? 'All analysts' : value })) }), dirty ? _jsx(Button, { variant: "ghost", size: "xs", icon: _jsx(RotateCcw, { className: "size-3", "aria-hidden": true }), onClick: onReset, children: "Reset" }) : null, typeof resultCount === 'number' ? (_jsxs("span", { className: "ml-auto shrink-0 text-[11px] text-ink-4", children: [resultCount, " incidents"] })) : null] }), chips.length ? _jsx(FilterChips, { chips: chips, onClearAll: onReset, className: "mt-2" }) : null] }));
}
