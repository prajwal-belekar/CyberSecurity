import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SeverityBadge, ThreatTypeBadge } from '@/components/ui/Badge';
import { priorityMeta, statusMetaFor } from '@/utils/incidentMeta';
import { formatRelative } from '@/utils/dates';
const PRIORITY_BAR = {
    p1: 'bg-critical',
    p2: 'bg-high',
    p3: 'bg-medium',
    p4: 'bg-low',
};
/** Compact incident card used across the kanban board and the card grid. */
export function IncidentCard({ incident, className }) {
    const priority = priorityMeta(incident.priority);
    const status = statusMetaFor(incident.status);
    return (_jsxs(Link, { to: `/incidents/${incident.id}`, className: cn('group relative block min-w-0 overflow-hidden rounded-[2px] border border-line-2 bg-panel-2 p-2.5 transition-colors hover:border-line-3 hover:bg-raised focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-term', className), children: [_jsx("span", { className: cn('absolute inset-y-0 left-0 w-[2px]', PRIORITY_BAR[incident.priority]), "aria-hidden": true }), _jsxs("div", { className: "flex items-baseline gap-1.5", children: [_jsx("span", { className: "mono shrink-0 text-[11px] font-bold text-term", children: incident.id }), _jsx("span", { className: cn('mono shrink-0 rounded-[2px] border px-1 py-[1px] text-[10.5px] font-bold tracking-[0.01em] uppercase', priority.className), children: priority.label }), _jsx("span", { className: "flex-1" }), _jsx("span", { className: cn('mono shrink-0 text-[10.5px] font-bold tracking-[0.01em] uppercase', status.text), children: status.label })] }), _jsx("h3", { className: "mt-1.5 line-clamp-2 text-[12px] leading-snug font-medium text-ink transition-colors group-hover:text-term", children: incident.title }), _jsx("p", { className: "mono mt-1 line-clamp-2 text-[11px] leading-relaxed text-ink-4", children: incident.summary }), _jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-1.5", children: [_jsx(SeverityBadge, { severity: incident.severity, showGlyph: false }), _jsx(ThreatTypeBadge, { type: incident.type })] }), _jsxs("dl", { className: "mt-2 space-y-0.5 border-t border-line pt-1.5", children: [_jsxs("div", { className: "flex items-baseline gap-1.5", children: [_jsx("dt", { className: "field-label shrink-0", children: "Source" }), _jsx("dd", { className: "mono min-w-0 flex-1 truncate text-[11px] text-cyber", children: incident.source })] }), _jsxs("div", { className: "flex items-baseline gap-1.5", children: [_jsx("dt", { className: "field-label shrink-0", children: "Target" }), _jsx("dd", { className: "mono min-w-0 flex-1 truncate text-[11px] text-high", children: incident.target })] })] }), _jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ink-4", children: [_jsxs("span", { className: "mono inline-flex items-center gap-1", children: [_jsx(User, { className: "size-2.5", "aria-hidden": true }), incident.assignedTo ?? 'UNASSIGNED'] }), _jsxs("span", { className: "mono inline-flex items-center gap-1", children: [_jsx(Clock, { className: "size-2.5", "aria-hidden": true }), formatRelative(incident.updatedAt)] }), _jsxs("span", { className: "mono tnum ml-auto", children: [incident.timeline.length, " ENTRIES"] })] })] }));
}
