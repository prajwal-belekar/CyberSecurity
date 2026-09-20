import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LayoutGrid } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { IncidentCard } from './IncidentCard';
import { INCIDENT_STATUS_ORDER, statusMetaFor } from '@/utils/incidentMeta';
/** Kanban board grouped by incident status, highest severity first per column. */
export function IncidentBoard({ incidents, loading }) {
    if (loading) {
        return (_jsx("div", { className: "grid min-w-0 gap-2.5 md:grid-cols-2 xl:grid-cols-5", children: INCIDENT_STATUS_ORDER.map((status) => (_jsxs("div", { className: "min-w-0 rounded-[2px] border border-line bg-panel p-2", children: [_jsx(Skeleton, { className: "h-4 w-24" }), _jsx("div", { className: "mt-2 space-y-2", children: Array.from({ length: 2 }).map((_, i) => _jsx(Skeleton, { className: "h-28 w-full" }, i)) })] }, status))) }));
    }
    const columns = INCIDENT_STATUS_ORDER.map((status) => ({
        status,
        items: incidents
            .filter((incident) => incident.status === status)
            .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    }));
    if (!incidents.length) {
        return _jsx(EmptyState, { icon: _jsx(LayoutGrid, { className: "size-4", "aria-hidden": true }), title: "No incidents match these filters", description: "Widen the filters, or switch to the table view to inspect the full queue." });
    }
    return (_jsx("div", { className: "grid min-w-0 gap-2.5 md:grid-cols-2 xl:grid-cols-5", children: columns.map(({ status, items }) => {
            const meta = statusMetaFor(status);
            return (_jsxs("section", { "aria-label": `${meta.label} incidents`, className: "min-w-0", children: [_jsxs("header", { className: "mb-1.5 flex items-center gap-1.5 border-b border-line pb-1.5", children: [_jsx("span", { className: "size-1.5 shrink-0 rounded-full", style: { background: meta.accent }, "aria-hidden": true }), _jsx("h2", { className: cn('text-[11px] font-semibold uppercase', meta.text), children: meta.label }), _jsx("span", { className: "mono tnum ml-auto text-[11px] text-ink-4", children: items.length })] }), items.length ? (_jsx("ul", { className: "space-y-1.5", children: items.map((incident) => (_jsx("li", { children: _jsx(IncidentCard, { incident: incident }) }, incident.id))) })) : (_jsx("p", { className: "mono rounded-[2px] border border-dashed border-line px-2 py-6 text-center text-[11px] tracking-[0.01em] text-ink-4 uppercase", children: "EMPTY" }))] }, status));
        }) }));
}
