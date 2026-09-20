import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FileText } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { formatDay, formatRelative } from '@/utils/dates';
import { cn } from '@/utils/cn';
const STATUS_TONE = {
    ready: 'border-term/40 bg-term/10 text-term',
    generating: 'border-cyber/40 bg-cyber/10 text-cyber',
    queued: 'border-medium/40 bg-medium/10 text-medium',
    draft: 'border-line-3 bg-raised text-ink-3',
    failed: 'border-critical/40 bg-critical/10 text-critical',
};
const CLASSIFICATION_TONE = {
    INTERNAL: 'neutral',
    CONFIDENTIAL: 'warn',
    RESTRICTED: 'err',
};
/** Report library: title, type, period, classification, status and age. */
export function ReportList({ reports, loading, error, onRetry, onSelect, selectedId, }) {
    const columns = [
        { key: 'id', header: 'Report', sortValue: (row) => row.id, width: '92px', render: (row) => (_jsx("span", { className: "mono text-[11px] font-bold text-term", children: row.id })) },
        { key: 'title', header: 'Title', sortValue: (row) => row.title, render: (row) => (_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "truncate text-[11.5px] font-medium text-ink", children: row.title }), _jsx("div", { className: "mono truncate text-[10.5px] text-ink-4", children: row.summary })] })) },
        { key: 'type', header: 'Type', sortValue: (row) => row.type, width: '132px', hideBelow: 'md', render: (row) => (_jsx("span", { className: "mono text-[11px] tracking-[0.01em] text-ink-3 uppercase", children: row.type.replace(/_/g, ' ') })) },
        { key: 'period', header: 'Period', sortValue: (row) => +new Date(row.periodStart), width: '168px', hideBelow: 'lg', render: (row) => (_jsxs("span", { className: "mono tnum text-[11px] text-ink-3", children: [formatDay(row.periodStart), " \u2192 ", formatDay(row.periodEnd)] })) },
        { key: 'classification', header: 'Class.', sortValue: (row) => row.classification, width: '118px', hideBelow: 'sm', render: (row) => (_jsx(Badge, { tone: CLASSIFICATION_TONE[row.classification], children: row.classification })) },
        { key: 'format', header: 'Format', sortValue: (row) => row.format, width: '72px', render: (row) => (_jsx("span", { className: "mono text-[11px] font-bold tracking-[0.01em] text-cyber uppercase", children: row.format })) },
        { key: 'status', header: 'Status', sortValue: (row) => row.status, width: '108px', render: (row) => (_jsxs("span", { className: cn('mono inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-[1px] text-[10.5px] font-bold tracking-[0.01em] uppercase', STATUS_TONE[row.status]), children: [row.status === 'generating' ? _jsx("span", { className: "size-1.5 animate-pulse rounded-full bg-current", "aria-hidden": true }) : null, row.status] })) },
        { key: 'generatedAt', header: 'Generated', sortValue: (row) => +new Date(row.generatedAt), width: '110px', render: (row) => (_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "mono tnum text-[11px] text-ink-3", children: formatDay(row.generatedAt) }), _jsx("div", { className: "mono text-[10.5px] text-ink-4", children: formatRelative(row.generatedAt) })] })) },
        { key: 'generatedBy', header: 'By', sortValue: (row) => row.generatedBy, width: '96px', hideBelow: 'xl', render: (row) => (_jsx("span", { className: "mono truncate text-[11px] text-ink-3", children: row.generatedBy })) },
    ];
    return (_jsx(DataTable, { columns: columns, rows: reports, rowKey: (row) => row.id, loading: loading, error: error, onRetry: onRetry, onRowClick: onSelect, selectedKey: selectedId ?? undefined, rowAccent: (row) => (row.classification === 'RESTRICTED' ? 'var(--color-critical)' : row.classification === 'CONFIDENTIAL' ? 'var(--color-medium)' : undefined), emptyTitle: "No reports yet", emptyDescription: "Generate a report above \u2014 the document and its sections will appear here.", emptyIcon: _jsx(FileText, { className: "size-4", "aria-hidden": true }), caption: "Generated reports" }));
}
