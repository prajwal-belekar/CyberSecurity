import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, FolderKanban, User } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { IncidentStatusBadge, PriorityBadge, SeverityBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useIncidents } from '@/hooks/useIncidents';
import { formatRelative } from '@/utils/dates';
import { cn } from '@/utils/cn';
/** Compact incident cards for the dashboard — full management lives in /incidents. */
export function ActiveIncidents({ limit = 4 }) {
    const navigate = useNavigate();
    const { data, isLoading, isError, error, refetch } = useIncidents('all');
    const active = (data ?? [])
        .filter((i) => i.status === 'open' || i.status === 'investigating' || i.status === 'contained')
        .slice(0, limit);
    return (_jsx(Panel, { title: "Active Incidents", icon: _jsx(FolderKanban, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", noPadding: true, actions: _jsxs("button", { type: "button", onClick: () => navigate('/incidents'), className: "inline-flex items-center gap-1 text-[11px] tracking-[0.01em] text-ink-3 transition-colors hover:text-term", children: ["Incident console ", _jsx(ArrowUpRight, { className: "size-3", "aria-hidden": true })] }), children: isLoading ? (_jsx("div", { className: "space-y-2 p-2.5", children: Array.from({ length: 3 }).map((_, i) => (_jsxs("div", { className: "panel-inset p-2.5", children: [_jsx(Skeleton, { className: "mb-2 h-2.5 w-24" }), _jsx(Skeleton, { className: "mb-2 h-3 w-40" }), _jsx(Skeleton, { className: "h-2 w-full" })] }, i))) })) : isError ? (_jsx(ErrorState, { title: "Unable to load incidents", message: error.message, onRetry: () => refetch(), compact: true })) : !active.length ? (_jsx(EmptyState, { compact: true, icon: _jsx(FolderKanban, { className: "size-4", "aria-hidden": true }), title: "No active incidents", description: "There are currently no incidents requiring investigation." })) : (_jsx("ul", { className: "divide-y divide-line", children: active.map((incident) => (_jsx("li", { children: _jsxs("button", { type: "button", onClick: () => navigate(`/incidents/${incident.id}`), className: cn('group flex w-full items-start gap-2.5 px-2.5 py-2 text-left transition-colors hover:bg-panel-2', 'focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-term'), children: [_jsx("span", { className: cn('mt-0.5 w-[2px] shrink-0 self-stretch rounded-[1px]', incident.severity === 'critical' ? 'bg-critical'
                                : incident.severity === 'high' ? 'bg-high'
                                    : incident.severity === 'medium' ? 'bg-medium' : 'bg-ink-4'), "aria-hidden": true }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsxs("span", { className: "flex flex-wrap items-center gap-1.5", children: [_jsx("span", { className: "mono text-[11px] font-bold tracking-[0.01em] text-term", children: incident.id }), _jsx(SeverityBadge, { severity: incident.severity }), _jsx(IncidentStatusBadge, { status: incident.status }), _jsx(PriorityBadge, { priority: incident.priority })] }), _jsx("span", { className: "mt-1 block truncate text-[12px] font-medium text-ink group-hover:text-term", children: incident.title }), _jsxs("span", { className: "mono mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-ink-4", children: [_jsxs("span", { children: ["SRC ", incident.source] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(User, { className: "size-2.5", "aria-hidden": true }), incident.assignedTo ?? 'UNASSIGNED'] }), _jsx("span", { children: formatRelative(incident.createdAt) }), _jsxs("span", { className: "hidden sm:inline", children: [incident.timeline.length, " timeline entries"] })] })] }), _jsx(ArrowUpRight, { className: "mt-0.5 size-3.5 shrink-0 text-ink-4 opacity-0 transition-opacity group-hover:opacity-100", "aria-hidden": true })] }) }, incident.id))) })) }));
}
