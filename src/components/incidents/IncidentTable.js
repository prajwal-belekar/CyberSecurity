import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { AlarmClock } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { SeverityBadge, IncidentStatusBadge, ThreatTypeBadge } from '@/components/ui/Badge';
import { priorityMeta, slaState } from '@/utils/incidentMeta';
import { formatClockShort, formatRelative } from '@/utils/dates';
import { severityRank } from '@/utils/severity';
import { cn } from '@/utils/cn';
/** Full incident queue: ID, priority, title, status, assignee, age and SLA. */
export function IncidentTable({ incidents, loading, error, onRetry, }) {
    const columns = [
        { key: 'id', header: 'Incident', sortValue: (row) => row.id, width: '86px', render: (row) => (_jsx(Link, { to: `/incidents/${row.id}`, className: "mono text-[10.5px] font-bold text-term underline-offset-2 hover:underline", children: row.id })) },
        { key: 'priority', header: 'Pri', sortValue: (row) => priorityMeta(row.priority).rank, width: '52px', align: 'center', render: (row) => {
                const meta = priorityMeta(row.priority);
                return _jsx("span", { className: cn('mono inline-flex rounded-[2px] border px-1 py-[1px] text-[10.5px] font-bold uppercase', meta.className), children: meta.label });
            } },
        { key: 'title', header: 'Title', sortValue: (row) => row.title, render: (row) => (_jsxs("div", { className: "min-w-0", children: [_jsx(Link, { to: `/incidents/${row.id}`, className: "block truncate text-[11.5px] font-medium text-ink underline-offset-2 hover:text-term hover:underline", children: row.title }), _jsxs("div", { className: "mono flex items-center gap-1.5 truncate text-[10.5px] text-ink-4", children: [_jsx("span", { className: "text-cyber", children: row.source }), _jsx("span", { "aria-hidden": true, children: "\u2192" }), _jsx("span", { className: "text-high", children: row.target })] })] })) },
        { key: 'severity', header: 'Severity', sortValue: (row) => severityRank(row.severity), width: '104px', render: (row) => _jsx(SeverityBadge, { severity: row.severity, showGlyph: false }) },
        { key: 'type', header: 'Type', sortValue: (row) => row.type, width: '136px', hideBelow: 'lg', render: (row) => _jsx(ThreatTypeBadge, { type: row.type }) },
        { key: 'status', header: 'Status', sortValue: (row) => row.status, width: '126px', render: (row) => _jsx(IncidentStatusBadge, { status: row.status }) },
        { key: 'assignedTo', header: 'Assignee', sortValue: (row) => row.assignedTo ?? '', width: '104px', hideBelow: 'md', render: (row) => (_jsx("span", { className: cn('mono truncate text-[10.5px]', row.assignedTo ? 'text-ink-2' : 'text-ink-4'), children: row.assignedTo ?? 'UNASSIGNED' })) },
        { key: 'sla', header: 'SLA', sortValue: (row) => slaState(row.createdAt, row.priority, row.status).elapsedMinutes, width: '170px', hideBelow: 'xl', render: (row) => {
                const sla = slaState(row.createdAt, row.priority, row.status);
                return (_jsxs("span", { className: cn('mono inline-flex items-center gap-1 text-[11px] tracking-[0.01em] uppercase', sla.tone === 'critical' ? 'text-critical' : sla.tone === 'medium' ? 'text-medium' : 'text-ink-4'), children: [sla.tone === 'critical' ? _jsx(AlarmClock, { className: "size-2.5", "aria-hidden": true }) : null, sla.label] }));
            } },
        { key: 'updatedAt', header: 'Updated', sortValue: (row) => +new Date(row.updatedAt), width: '110px', render: (row) => (_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "mono tnum text-[10.5px] text-ink-3", children: formatClockShort(row.updatedAt) }), _jsx("div", { className: "mono text-[10.5px] text-ink-4", children: formatRelative(row.updatedAt) })] })) },
    ];
    return (_jsx(DataTable, { columns: columns, rows: incidents, rowKey: (row) => row.id, loading: loading, error: error, onRetry: onRetry, rowAccent: (row) => (row.priority === 'p1' ? 'var(--color-critical)' : row.priority === 'p2' ? 'var(--color-high)' : row.priority === 'p3' ? 'var(--color-medium)' : undefined), emptyTitle: "No incidents match these filters", emptyDescription: "Widen the filters or switch to the board view.", emptyIcon: _jsx(AlarmClock, { className: "size-4", "aria-hidden": true }), caption: "Incident queue" }));
}
