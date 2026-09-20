import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ListFilter, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FilterChips } from '@/components/ui/FilterChips';
import { SEVERITIES, EVENT_STATUSES, THREAT_TYPES } from '@/types/common';
import { SEVERITY_META, STATUS_META, threatTypeLabel } from '@/utils/severity';
const TIME_RANGES = ['all', '1H', '6H', '24H', '7D', '30D'];
/** Severity / status / type / time-range / source filter bar with visible chips. */
export function ThreatFilters({ filters, onChange, onReset, resultCount, className, compact }) {
    const set = (key, value) => onChange({ ...filters, [key]: value });
    const toggleArray = (key, value) => {
        const current = (filters[key] ?? []);
        const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        set(key, (next.length ? next : undefined));
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
    return (_jsxs("div", { className: cn('min-w-0', className), children: [_jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [_jsx("div", { className: "flex min-w-[180px] flex-1 items-center", children: _jsx(SearchInput, { value: filters.search ?? '', onValueChange: (v) => set('search', v || undefined), placeholder: "Search threats, sources, indicators, IDs\u2026", "aria-label": "Search threats", className: "h-7 text-[11px]" }) }), _jsx("div", { className: "flex items-center gap-0.5 rounded-[2px] border border-line-2 bg-base p-0.5", role: "group", "aria-label": "Severity filter", children: SEVERITIES.map((severity) => {
                            const active = (filters.severity ?? []).includes(severity);
                            const meta = SEVERITY_META[severity];
                            return (_jsx("button", { type: "button", "aria-pressed": active, onClick: () => toggleArray('severity', severity), className: cn('mono rounded-[1px] border px-1.5 py-[2px] text-[11px] font-bold tracking-[0.01em] uppercase transition-colors', active ? cn(meta.border, meta.soft, meta.text) : 'border-transparent text-ink-4 hover:bg-raised hover:text-ink-2'), title: `Filter by ${meta.label} severity`, children: meta.short }, severity));
                        }) }), _jsx(Select, { compact: true, "aria-label": "Filter by status", value: filters.status?.[0] ?? 'all', onChange: (e) => set('status', e.target.value === 'all' ? undefined : [e.target.value]), icon: _jsx(SlidersHorizontal, { className: "size-3", "aria-hidden": true }), className: "w-auto", options: [{ value: 'all', label: 'All statuses' }, ...EVENT_STATUSES.map((s) => ({ value: s, label: STATUS_META[s].label }))] }), _jsx(Select, { compact: true, "aria-label": "Filter by threat type", value: filters.type?.[0] ?? 'all', onChange: (e) => set('type', e.target.value === 'all' ? undefined : [e.target.value]), icon: _jsx(ListFilter, { className: "size-3", "aria-hidden": true }), className: "w-auto", options: [{ value: 'all', label: 'All types' }, ...THREAT_TYPES.map((t) => ({ value: t, label: threatTypeLabel(t) }))] }), _jsx(Select, { compact: true, "aria-label": "Filter by time range", value: filters.timeRange ?? 'all', onChange: (e) => set('timeRange', e.target.value), className: "w-auto", options: TIME_RANGES.map((r) => ({ value: r, label: r === 'all' ? 'All time' : r })) }), _jsx("div", { className: "flex min-w-[130px] items-center", children: _jsx(SearchInput, { value: filters.source ?? '', onValueChange: (v) => set('source', v || undefined), placeholder: "Source\u2026", "aria-label": "Filter by source address", className: "h-6 text-[11px]" }) }), chips.length ? (_jsx(Button, { variant: "ghost", size: "xs", icon: _jsx(RotateCcw, { className: "size-3", "aria-hidden": true }), onClick: onReset, children: "Reset" })) : null, typeof resultCount === 'number' ? (_jsxs("span", { className: "ml-auto shrink-0 text-[11px] text-ink-4", children: [resultCount, " match", resultCount === 1 ? '' : 'es'] })) : null] }), !compact && chips.length ? (_jsx(FilterChips, { chips: chips, onClearAll: onReset, className: "mt-2" })) : null, compact && chips.length ? (_jsxs("button", { type: "button", onClick: onReset, className: "mono mt-1.5 inline-flex items-center gap-1 text-[11px] tracking-[0.01em] text-ink-4 uppercase transition-colors hover:text-critical", children: [_jsx(X, { className: "size-2.5", "aria-hidden": true }), " ", chips.length, " FILTER", chips.length === 1 ? '' : 'S', " ACTIVE \u2014 CLEAR"] })) : null] }));
}
