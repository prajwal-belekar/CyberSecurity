import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Ban, CheckCircle2, Flag, Network as NetworkIcon } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { SeverityBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { NetworkFilters } from './NetworkFilters';
import { useNetworkEvents } from '@/hooks/useNetworkEvents';
import { formatBytes } from '@/utils/formatting';
import { formatClockShort } from '@/utils/dates';
import { severityRank } from '@/utils/severity';
import { cn } from '@/utils/cn';
const PAGE_SIZE = 14;
const ACTION_META = {
    allowed: { label: 'ALLOWED', icon: _jsx(CheckCircle2, { className: "size-3", "aria-hidden": true }), className: 'border-term/35 bg-term/10 text-term' },
    blocked: { label: 'BLOCKED', icon: _jsx(Ban, { className: "size-3", "aria-hidden": true }), className: 'border-critical/35 bg-critical/10 text-critical' },
    flagged: { label: 'FLAGGED', icon: _jsx(Flag, { className: "size-3", "aria-hidden": true }), className: 'border-medium/35 bg-medium/10 text-medium' },
};
const EMPTY_QUERY = { page: 1, pageSize: PAGE_SIZE };
/** Flow-level network event grid with inline action semantics. */
export function NetworkEvents() {
    const [query, setQuery] = useState(EMPTY_QUERY);
    const [sortKey, setSortKey] = useState('timestamp');
    const [sortDir, setSortDir] = useState('desc');
    const { data, isLoading, isError, error, refetch, isFetching } = useNetworkEvents(query);
    const columns = [
        { key: 'timestamp', header: 'Time', sortValue: (row) => +new Date(row.timestamp), width: '64px', render: (row) => _jsx("span", { className: "mono tnum text-[10.5px] text-ink-4", children: formatClockShort(row.timestamp) }) },
        { key: 'severity', header: 'Sev', sortValue: (row) => severityRank(row.severity), width: '96px', render: (row) => _jsx(SeverityBadge, { severity: row.severity, showGlyph: false }) },
        { key: 'sourceIp', header: 'Source', sortValue: (row) => row.sourceIp, render: (row) => (_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "mono truncate text-[11px] text-cyber", children: row.sourceIp }), row.sourceName ? _jsx("div", { className: "mono truncate text-[10.5px] text-ink-4", children: row.sourceName }) : null] })) },
        { key: 'destIp', header: 'Destination', sortValue: (row) => row.destIp, render: (row) => (_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "mono truncate text-[11px] text-ink-2", children: row.destIp }), row.destName ? _jsx("div", { className: "mono truncate text-[10.5px] text-ink-4", children: row.destName }) : null] })) },
        { key: 'destPort', header: 'Port', sortValue: (row) => row.destPort, width: '58px', align: 'right', render: (row) => _jsx("span", { className: "mono tnum text-[11px] text-ink-2", children: row.destPort }) },
        { key: 'protocol', header: 'Proto', sortValue: (row) => row.protocol, width: '62px', hideBelow: 'sm', render: (row) => _jsx("span", { className: "mono text-[10.5px] text-ink-3", children: row.protocol }) },
        { key: 'bytes', header: 'Bytes', sortValue: (row) => row.bytes, width: '78px', align: 'right', hideBelow: 'md', render: (row) => _jsx("span", { className: "mono tnum text-[10.5px] text-ink-3", children: formatBytes(row.bytes) }) },
        { key: 'category', header: 'Category', sortValue: (row) => row.category, hideBelow: 'lg', render: (row) => _jsx("span", { className: "truncate text-[11px] text-ink-2", children: row.category }) },
        { key: 'action', header: 'Action', sortValue: (row) => row.action, width: '104px', render: (row) => {
                const meta = ACTION_META[row.action];
                return (_jsxs("span", { className: cn('inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-[1px] font-mono text-[11px] font-semibold tracking-[0.01em] uppercase', meta.className), children: [meta.icon, meta.label] }));
            } },
    ];
    const onSort = (key) => {
        if (key === sortKey)
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortKey(key);
            setSortDir('desc');
        }
    };
    return (_jsxs(Panel, { title: "Network Events", icon: _jsx(NetworkIcon, { className: "size-3.5", "aria-hidden": true }), noPadding: true, className: "min-w-0", actions: isFetching && !isLoading ? _jsx("span", { className: "mono text-[11px] text-cyber", children: "SYNC\u2026" }) : undefined, children: [_jsx("div", { className: "border-b border-line bg-base px-2.5 py-2", children: _jsx(NetworkFilters, { query: query, onChange: setQuery, onReset: () => setQuery(EMPTY_QUERY), resultCount: data?.total }) }), _jsx(DataTable, { columns: columns, rows: data?.items ?? [], rowKey: (row) => row.id, loading: isLoading, error: isError ? (error?.message ?? 'Unable to load network events.') : null, onRetry: () => refetch(), sortBy: sortKey, sortDir: sortDir, onSortChange: onSort, rowAccent: (row) => row.action === 'blocked' ? 'var(--color-critical)' : row.action === 'flagged' ? 'var(--color-medium)' : undefined, emptyTitle: "No network events", emptyDescription: "No flows match the current filters.", emptyIcon: _jsx(NetworkIcon, { className: "size-4", "aria-hidden": true }), caption: "Network flow events", maxHeight: "none", footer: _jsx(Pagination, { page: query.page ?? 1, pageSize: PAGE_SIZE, total: data?.total ?? 0, onChange: (page) => setQuery((q) => ({ ...q, page })), label: "flows" }) })] }));
}
