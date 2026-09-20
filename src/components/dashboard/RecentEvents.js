import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ListFilter, Table2 } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useSecurityEvents } from '@/hooks/useSecurityEvents';
import { useUI } from '@/store/UIContext';
import { formatRelative } from '@/utils/dates';
import { severityRank } from '@/utils/severity';
const PAGE_SIZE = 8;
/**
 * Recent security events grid. Rows open the shared investigation drawer; the
 * "View all" action deep-links into the full threat monitor with filters intact.
 */
export function RecentEvents() {
    const navigate = useNavigate();
    const { openEvent } = useUI();
    const [page, setPage] = useState(1);
    const [severity, setSeverity] = useState('all');
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState(undefined);
    const [sortDir, setSortDir] = useState('desc');
    const query = { page, pageSize: PAGE_SIZE, severity, search: search || undefined };
    const { data, isLoading, isError, error, refetch, isFetching } = useSecurityEvents(query);
    const columns = [
        {
            key: 'severity',
            header: 'Severity',
            sortValue: (row) => severityRank(row.severity),
            width: '104px',
            render: (row) => _jsx(SeverityBadge, { severity: row.severity }),
        },
        {
            key: 'event',
            header: 'Event',
            sortValue: (row) => row.type,
            render: (row) => (_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "truncate text-[11.5px] font-medium text-ink", children: row.type }), _jsxs("div", { className: "mono truncate text-[11px] text-ink-4", children: [row.id, row.detectionRule ? ` · ${row.detectionRule}` : ''] })] })),
        },
        {
            key: 'source',
            header: 'Source',
            sortValue: (row) => row.source,
            hideBelow: 'md',
            render: (row) => _jsx("span", { className: "mono text-[11px] text-cyber", children: row.source }),
        },
        {
            key: 'target',
            header: 'Target',
            sortValue: (row) => row.target ?? '',
            hideBelow: 'lg',
            render: (row) => _jsx("span", { className: "mono truncate text-[11px] text-ink-3", children: row.target ?? '—' }),
        },
        {
            key: 'time',
            header: 'Time',
            sortValue: (row) => +new Date(row.timestamp),
            width: '84px',
            render: (row) => _jsx("span", { className: "mono tnum text-[10.5px] whitespace-nowrap text-ink-4", children: formatRelative(row.timestamp) }),
        },
        {
            key: 'status',
            header: 'Status',
            sortValue: (row) => row.status,
            width: '126px',
            render: (row) => _jsx(StatusBadge, { status: row.status }),
        },
    ];
    const onSort = (key) => {
        if (key === sortKey)
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortKey(key);
            setSortDir('desc');
        }
    };
    return (_jsxs(Panel, { title: "Recent Security Events", icon: _jsx(Table2, { className: "size-3.5", "aria-hidden": true }), noPadding: true, className: "min-w-0", actions: _jsxs(_Fragment, { children: [isFetching && !isLoading ? _jsx("span", { className: "mono text-[11px] text-cyber", children: "SYNC\u2026" }) : null, _jsx(Button, { variant: "ghost", size: "xs", iconRight: _jsx(ArrowUpRight, { className: "size-3", "aria-hidden": true }), onClick: () => navigate(severity !== 'all' ? `/threats?severity=${severity}` : '/threats'), children: "View all" })] }), children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2 border-b border-line bg-base px-2.5 py-1.5", children: [_jsx(SearchInput, { value: search, onValueChange: (v) => { setSearch(v); setPage(1); }, placeholder: "Filter events by type, source or target\u2026", "aria-label": "Search security events", className: "h-6 max-w-xs text-[11px]" }), _jsx(Select, { compact: true, "aria-label": "Filter by severity", value: severity, onChange: (e) => { setSeverity(e.target.value); setPage(1); }, options: [
                            { value: 'all', label: 'All severities' },
                            { value: 'critical', label: 'Critical' },
                            { value: 'high', label: 'High' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'low', label: 'Low' },
                            { value: 'info', label: 'Info' },
                        ], icon: _jsx(ListFilter, { className: "size-3", "aria-hidden": true }), className: "w-auto" }), _jsx("span", { className: "flex-1" }), _jsx("span", { className: "mono hidden text-[11px] text-ink-4 sm:inline", children: "Click a row to investigate" })] }), _jsx(DataTable, { columns: columns, rows: data?.items ?? [], rowKey: (row) => row.id, loading: isLoading, error: isError ? (error?.message ?? 'Unable to load security events.') : null, onRetry: () => refetch(), onRowClick: openEvent, sortBy: sortKey, sortDir: sortDir, onSortChange: onSort, rowAccent: (row) => row.severity === 'critical' ? 'var(--color-critical)'
                    : row.severity === 'high' ? 'var(--color-high)'
                        : row.severity === 'medium' ? 'var(--color-medium)' : undefined, emptyTitle: "No security events", emptyDescription: "No events match the current filters. The detection engine is still monitoring.", caption: "Recent security events", footer: _jsx(Pagination, { page: page, pageSize: PAGE_SIZE, total: data?.total ?? 0, onChange: setPage, label: "events" }) })] }));
}
