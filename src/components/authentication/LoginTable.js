import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Ban, CheckCircle2, Fingerprint, KeyRound, Lock, ShieldAlert, TriangleAlert } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { SeverityBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { AuthenticationFilters } from './AuthenticationFilters';
import { CopyButton } from '@/components/ui/CopyButton';
import { useQuery } from '@tanstack/react-query';
import { authenticationApi } from '@/services/authenticationApi';
import { queryKeys } from '@/services/queryKeys';
import { formatClockShort, formatRelative } from '@/utils/dates';
import { severityRank } from '@/utils/severity';
import { cn } from '@/utils/cn';
const PAGE_SIZE = 12;
const EMPTY_QUERY = { page: 1, pageSize: PAGE_SIZE };
const STATUS_META = {
    success: { label: 'SUCCESS', icon: _jsx(CheckCircle2, { className: "size-3", "aria-hidden": true }), className: 'border-term/35 bg-term/10 text-term' },
    failed: { label: 'FAILED', icon: _jsx(KeyRound, { className: "size-3", "aria-hidden": true }), className: 'border-high/35 bg-high/10 text-high' },
    locked: { label: 'LOCKED', icon: _jsx(Lock, { className: "size-3", "aria-hidden": true }), className: 'border-critical/35 bg-critical/10 text-critical' },
    mfa_challenge: { label: 'MFA CHALLENGE', icon: _jsx(Fingerprint, { className: "size-3", "aria-hidden": true }), className: 'border-cyber/35 bg-cyber/10 text-cyber' },
    mfa_failed: { label: 'MFA FAILED', icon: _jsx(TriangleAlert, { className: "size-3", "aria-hidden": true }), className: 'border-critical/35 bg-critical/10 text-critical' },
    suspicious: { label: 'SUSPICIOUS', icon: _jsx(ShieldAlert, { className: "size-3", "aria-hidden": true }), className: 'border-medium/35 bg-medium/10 text-medium' },
    blocked: { label: 'BLOCKED', icon: _jsx(Ban, { className: "size-3", "aria-hidden": true }), className: 'border-critical/35 bg-critical/10 text-critical' },
};
/** Login event grid: user, IP, location, time, outcome and risk. */
export function LoginTable() {
    const [query, setQuery] = useState(EMPTY_QUERY);
    const [sortKey, setSortKey] = useState('timestamp');
    const [sortDir, setSortDir] = useState('desc');
    const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
        queryKey: queryKeys.authEvents(query),
        queryFn: () => authenticationApi.events(query),
        placeholderData: (previous) => previous,
    });
    const columns = [
        { key: 'timestamp', header: 'Time', sortValue: (row) => +new Date(row.timestamp), width: '116px', render: (row) => (_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "mono tnum text-[10.5px] text-ink-3", children: formatClockShort(row.timestamp) }), _jsx("div", { className: "mono text-[10.5px] text-ink-4", children: formatRelative(row.timestamp) })] })) },
        { key: 'user', header: 'User', sortValue: (row) => row.user, render: (row) => (_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "truncate text-[11.5px] font-medium text-ink", children: row.user }), _jsxs("div", { className: "mono truncate text-[10.5px] text-ink-4", children: [row.userId, " \u00B7 ", row.device] })] })) },
        { key: 'ip', header: 'IP', sortValue: (row) => row.ip, width: '150px', render: (row) => (_jsxs("span", { className: "mono flex items-center gap-1 text-[10.5px] text-cyber", children: [_jsx("span", { className: "truncate", children: row.ip }), _jsx(CopyButton, { value: row.ip, label: `Copy ${row.ip}` })] })) },
        { key: 'location', header: 'Location', sortValue: (row) => row.location, hideBelow: 'md', render: (row) => (_jsxs("span", { className: "mono truncate text-[10.5px] text-ink-3", children: [_jsx("span", { className: "mr-1 text-ink-4", children: row.countryCode }), row.location] })) },
        { key: 'method', header: 'Method', sortValue: (row) => row.method, width: '80px', hideBelow: 'lg', render: (row) => (_jsx("span", { className: "mono text-[11px] tracking-[0.01em] text-ink-4 uppercase", children: row.method.replace('_', ' ') })) },
        { key: 'status', header: 'Status', sortValue: (row) => row.status, width: '132px', render: (row) => {
                const meta = STATUS_META[row.status];
                return (_jsxs("span", { className: cn('inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-[1px] font-mono text-[10.5px] font-semibold tracking-[0.01em] uppercase', meta.className), children: [meta.icon, meta.label] }));
            } },
        { key: 'risk', header: 'Risk', sortValue: (row) => severityRank(row.risk), width: '96px', render: (row) => _jsx(SeverityBadge, { severity: row.risk, showGlyph: false }) },
        { key: 'reason', header: 'Detail', sortValue: (row) => row.failureReason ?? '', hideBelow: 'xl', render: (row) => (_jsx("span", { className: "mono truncate text-[11px] text-ink-4", children: row.failureReason ?? (row.attemptNumber ? `attempt ${row.attemptNumber}` : '—') })) },
    ];
    const onSort = (key) => {
        if (key === sortKey)
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortKey(key);
            setSortDir('desc');
        }
    };
    return (_jsxs(Panel, { title: "Authentication Log", icon: _jsx(KeyRound, { className: "size-3.5", "aria-hidden": true }), noPadding: true, className: "min-w-0", actions: isFetching && !isLoading ? _jsx("span", { className: "mono text-[11px] text-cyber", children: "SYNC\u2026" }) : undefined, children: [_jsx("div", { className: "border-b border-line bg-base px-2.5 py-2", children: _jsx(AuthenticationFilters, { query: query, onChange: setQuery, onReset: () => setQuery(EMPTY_QUERY), resultCount: data?.total }) }), _jsx(DataTable, { columns: columns, rows: data?.items ?? [], rowKey: (row) => row.id, loading: isLoading, error: isError ? (error?.message ?? 'Unable to load authentication events.') : null, onRetry: () => refetch(), sortBy: sortKey, sortDir: sortDir, onSortChange: onSort, rowAccent: (row) => row.risk === 'critical' ? 'var(--color-critical)'
                    : row.risk === 'high' ? 'var(--color-high)'
                        : row.risk === 'medium' ? 'var(--color-medium)' : undefined, emptyTitle: "No authentication records", emptyDescription: "No logon events match the current filters.", emptyIcon: _jsx(KeyRound, { className: "size-4", "aria-hidden": true }), caption: "Authentication events", footer: _jsx(Pagination, { page: query.page ?? 1, pageSize: PAGE_SIZE, total: data?.total ?? 0, onChange: (page) => setQuery((q) => ({ ...q, page })), label: "logins" }) })] }));
}
