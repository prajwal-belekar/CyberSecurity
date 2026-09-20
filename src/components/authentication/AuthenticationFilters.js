import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ListFilter, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FilterChips } from '@/components/ui/FilterChips';
const STATUSES = ['all', 'success', 'failed', 'suspicious', 'locked', 'mfa_challenge', 'mfa_failed', 'blocked'];
const RISKS = ['all', 'critical', 'high', 'medium', 'low', 'info'];
const RANGES = ['all', '1H', '6H', '24H', '7D', '30D'];
/** Status / risk / window filters for the login grid. */
export function AuthenticationFilters({ query, onChange, onReset, resultCount, className }) {
    const set = (patch) => onChange({ ...query, ...patch, page: 1 });
    const chips = [
        ...(query.status && query.status !== 'all' ? [{ id: 'st', label: 'STATUS', value: query.status.replace('_', ' ').toUpperCase(), onRemove: () => set({ status: 'all' }) }] : []),
        ...(query.risk && query.risk !== 'all' ? [{ id: 'rk', label: 'RISK', value: query.risk.toUpperCase(), onRemove: () => set({ risk: 'all' }) }] : []),
        ...(query.timeRange && query.timeRange !== 'all' ? [{ id: 'win', label: 'WINDOW', value: query.timeRange, onRemove: () => set({ timeRange: 'all' }) }] : []),
        ...(query.search ? [{ id: 'q', label: 'SEARCH', value: query.search, onRemove: () => set({ search: undefined }) }] : []),
    ];
    const dirty = chips.length > 0;
    return (_jsxs("div", { className: cn('min-w-0', className), children: [_jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [_jsx("div", { className: "flex min-w-[190px] flex-1", children: _jsx(SearchInput, { value: query.search ?? '', onValueChange: (v) => set({ search: v || undefined }), placeholder: "Filter by user, IP, location or device\u2026", "aria-label": "Search authentication events", className: "h-7 text-[11px]" }) }), _jsx(Select, { compact: true, "aria-label": "Filter by outcome", className: "w-auto", icon: _jsx(ListFilter, { className: "size-3", "aria-hidden": true }), value: query.status ?? 'all', onChange: (e) => set({ status: e.target.value }), options: STATUSES.map((v) => ({ value: v, label: v === 'all' ? 'All outcomes' : v.replace('_', ' ') })) }), _jsx(Select, { compact: true, "aria-label": "Filter by risk", className: "w-auto", value: query.risk ?? 'all', onChange: (e) => set({ risk: e.target.value }), options: RISKS.map((v) => ({ value: v, label: v === 'all' ? 'All risk levels' : v.toUpperCase() })) }), _jsx(Select, { compact: true, "aria-label": "Filter by time window", className: "w-auto", value: query.timeRange ?? 'all', onChange: (e) => set({ timeRange: e.target.value }), options: RANGES.map((v) => ({ value: v, label: v === 'all' ? 'All time' : v })) }), dirty ? _jsx(Button, { variant: "ghost", size: "xs", icon: _jsx(RotateCcw, { className: "size-3", "aria-hidden": true }), onClick: onReset, children: "Reset" }) : null, typeof resultCount === 'number' ? (_jsxs("span", { className: "ml-auto shrink-0 text-[11px] text-ink-4", children: [resultCount, " records"] })) : null] }), chips.length ? _jsx(FilterChips, { chips: chips, onClearAll: onReset, className: "mt-2" }) : null] }));
}
