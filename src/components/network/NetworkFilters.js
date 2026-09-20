import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ListFilter, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FilterChips } from '@/components/ui/FilterChips';
const PROTOCOLS = ['all', 'TCP', 'UDP', 'ICMP', 'DNS', 'HTTP', 'HTTPS', 'TLS', 'SSH', 'SMB'];
const ACTIONS = ['all', 'allowed', 'blocked', 'flagged'];
const RANGES = ['all', '1H', '6H', '24H', '7D'];
/** Severity / action / protocol / window filters for the flow table. */
export function NetworkFilters({ query, onChange, onReset, resultCount, className }) {
    const set = (patch) => onChange({ ...query, ...patch, page: 1 });
    const dirty = Boolean(query.search || (query.severity && query.severity !== 'all') || (query.action && query.action !== 'all') || (query.protocol && query.protocol !== 'all') || (query.timeRange && query.timeRange !== 'all'));
    const chips = [
        ...(query.severity && query.severity !== 'all' ? [{ id: 'sev', label: 'SEVERITY', value: query.severity.toUpperCase(), onRemove: () => set({ severity: 'all' }) }] : []),
        ...(query.action && query.action !== 'all' ? [{ id: 'act', label: 'ACTION', value: query.action.toUpperCase(), onRemove: () => set({ action: 'all' }) }] : []),
        ...(query.protocol && query.protocol !== 'all' ? [{ id: 'pro', label: 'PROTOCOL', value: query.protocol, onRemove: () => set({ protocol: 'all' }) }] : []),
        ...(query.timeRange && query.timeRange !== 'all' ? [{ id: 'win', label: 'WINDOW', value: query.timeRange, onRemove: () => set({ timeRange: 'all' }) }] : []),
        ...(query.search ? [{ id: 'q', label: 'SEARCH', value: query.search, onRemove: () => set({ search: undefined }) }] : []),
    ];
    return (_jsxs("div", { className: cn('min-w-0', className), children: [_jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [_jsx("div", { className: "flex min-w-[190px] flex-1", children: _jsx(SearchInput, { value: query.search ?? '', onValueChange: (v) => set({ search: v || undefined }), placeholder: "Filter by IP, port, host or category\u2026", "aria-label": "Search network events", className: "h-7 text-[11px]" }) }), _jsx(Select, { compact: true, "aria-label": "Filter by severity", className: "w-auto", icon: _jsx(ListFilter, { className: "size-3", "aria-hidden": true }), value: query.severity ?? 'all', onChange: (e) => set({ severity: e.target.value }), options: ['all', 'critical', 'high', 'medium', 'low', 'info'].map((v) => ({ value: v, label: v === 'all' ? 'All severities' : v.toUpperCase() })) }), _jsx(Select, { compact: true, "aria-label": "Filter by action", className: "w-auto", value: query.action ?? 'all', onChange: (e) => set({ action: e.target.value }), options: ACTIONS.map((v) => ({ value: v, label: v === 'all' ? 'All actions' : v.toUpperCase() })) }), _jsx(Select, { compact: true, "aria-label": "Filter by protocol", className: "w-auto", value: query.protocol ?? 'all', onChange: (e) => set({ protocol: e.target.value }), options: PROTOCOLS.map((v) => ({ value: v, label: v === 'all' ? 'All protocols' : v })) }), _jsx(Select, { compact: true, "aria-label": "Filter by time window", className: "w-auto", value: query.timeRange ?? 'all', onChange: (e) => set({ timeRange: e.target.value }), options: RANGES.map((v) => ({ value: v, label: v === 'all' ? 'All time' : v })) }), dirty ? (_jsx(Button, { variant: "ghost", size: "xs", icon: _jsx(RotateCcw, { className: "size-3", "aria-hidden": true }), onClick: onReset, children: "Reset" })) : null, typeof resultCount === 'number' ? (_jsxs("span", { className: "ml-auto shrink-0 text-[11px] text-ink-4", children: [resultCount, " flows"] })) : null] }), chips.length ? _jsx(FilterChips, { chips: chips, onClearAll: onReset, className: "mt-2" }) : null] }));
}
