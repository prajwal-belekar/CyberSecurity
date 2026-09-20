import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { History } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { SeverityBadge } from '@/components/ui/Badge';
import { VERDICT_META } from './RiskScore';
import { useQuery } from '@tanstack/react-query';
import { phishingApi } from '@/services/phishingApi';
import { queryKeys } from '@/services/queryKeys';
import { formatRelative } from '@/utils/dates';
import { cn } from '@/utils/cn';
/** Previous URL analyses — URL, date, risk and verdict. */
export function ScanHistory({ onSelect }) {
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: queryKeys.phishingHistory(),
        queryFn: () => phishingApi.history(),
    });
    const columns = [
        { key: 'url', header: 'URL', sortValue: (row) => row.domain, render: (row) => (_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "mono truncate text-[11px] text-cyber", children: row.domain }), _jsx("div", { className: "mono truncate text-[10.5px] text-ink-4", children: row.url })] })) },
        { key: 'scannedAt', header: 'Date', sortValue: (row) => +new Date(row.scannedAt), width: '92px', render: (row) => (_jsx("span", { className: "mono tnum text-[10.5px] whitespace-nowrap text-ink-4", children: formatRelative(row.scannedAt) })) },
        { key: 'riskScore', header: 'Risk', sortValue: (row) => row.riskScore, width: '96px', align: 'right', render: (row) => (_jsxs("span", { className: "flex items-center justify-end gap-1.5", children: [_jsx("span", { className: "hidden h-1 w-10 overflow-hidden rounded-[1px] bg-raised sm:block", children: _jsx("span", { className: "block h-full", style: { width: `${row.riskScore}%`, background: VERDICT_META[row.verdict].color }, "aria-hidden": true }) }), _jsx("span", { className: "mono tnum text-[11px] font-semibold", style: { color: VERDICT_META[row.verdict].color }, children: row.riskScore })] })) },
        { key: 'verdict', header: 'Result', sortValue: (row) => row.verdict, width: '150px', render: (row) => (_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(SeverityBadge, { severity: row.severity, showGlyph: false }), _jsx("span", { className: cn('mono hidden truncate text-[11px] font-semibold tracking-[0.01em] uppercase lg:inline', VERDICT_META[row.verdict].tone), children: VERDICT_META[row.verdict].label })] })) },
        { key: 'scannedBy', header: 'Analyst', sortValue: (row) => row.scannedBy, width: '104px', hideBelow: 'xl', render: (row) => (_jsx("span", { className: "mono truncate text-[10.5px] text-ink-3", children: row.scannedBy })) },
    ];
    return (_jsx(Panel, { title: "Scan History", icon: _jsx(History, { className: "size-3.5", "aria-hidden": true }), noPadding: true, className: "min-w-0", children: _jsx(DataTable, { columns: columns, rows: data ?? [], rowKey: (row) => row.id, loading: isLoading, error: isError ? (error?.message ?? 'Unable to load scan history.') : null, onRetry: () => refetch(), onRowClick: onSelect, rowAccent: (row) => row.riskScore >= 80 ? 'var(--color-critical)' : row.riskScore >= 60 ? 'var(--color-high)' : row.riskScore >= 35 ? 'var(--color-medium)' : undefined, emptyTitle: "No previous scans", emptyDescription: "Analyzed URLs will be listed here so you can compare against earlier verdicts.", emptyIcon: _jsx(History, { className: "size-4", "aria-hidden": true }), caption: "Phishing scan history" }) }));
}
