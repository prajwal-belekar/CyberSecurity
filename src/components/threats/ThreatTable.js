import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { ExternalLink, ShieldAlert } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { SeverityBadge, StatusBadge, ThreatTypeBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { formatRelative } from '@/utils/dates';
import { severityRank } from '@/utils/severity';
/** Dense threat data grid — the primary triage surface of the monitor. */
export function ThreatTable({ threats, loading, error, onRetry, page, pageSize, total, onPageChange, sortBy, sortDir, onSortChange, onSelect, selectedId, }) {
    const navigate = useNavigate();
    const columns = [
        {
            key: 'id', header: 'ID', sortValue: (row) => row.id, width: '86px',
            render: (row) => _jsx("span", { className: "mono text-[10.5px] font-semibold text-term", children: row.id }),
        },
        {
            key: 'severity', header: 'Severity', sortValue: (row) => severityRank(row.severity), width: '104px',
            render: (row) => _jsx(SeverityBadge, { severity: row.severity }),
        },
        {
            key: 'title', header: 'Threat', sortValue: (row) => row.title,
            render: (row) => (_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "truncate text-[11.5px] font-medium text-ink", children: row.title }), _jsx("div", { className: "mono truncate text-[11px] text-ink-4", children: row.detectionRule })] })),
        },
        {
            key: 'type', header: 'Type', sortValue: (row) => row.type, hideBelow: 'lg', width: '150px',
            render: (row) => _jsx(ThreatTypeBadge, { type: row.type }),
        },
        {
            key: 'source', header: 'Source', sortValue: (row) => row.source, hideBelow: 'md',
            render: (row) => _jsx("span", { className: "mono truncate text-[10.5px] text-cyber", children: row.source }),
        },
        {
            key: 'occurrences', header: 'Hits', sortValue: (row) => row.occurrences, align: 'right', width: '58px', hideBelow: 'sm',
            render: (row) => _jsx("span", { className: "mono tnum text-[11px] text-ink-2", children: row.occurrences }),
        },
        {
            key: 'confidence', header: 'Conf', sortValue: (row) => row.confidence, align: 'right', width: '62px', hideBelow: 'xl',
            render: (row) => (_jsx("span", { className: `mono tnum text-[10.5px] ${row.confidence >= 0.8 ? 'text-term' : row.confidence >= 0.6 ? 'text-medium' : 'text-ink-4'}`, children: row.confidence.toFixed(2) })),
        },
        {
            key: 'lastSeen', header: 'Last Seen', sortValue: (row) => +new Date(row.lastSeen), width: '92px',
            render: (row) => _jsx("span", { className: "mono tnum text-[10.5px] whitespace-nowrap text-ink-4", children: formatRelative(row.lastSeen) }),
        },
        {
            key: 'status', header: 'Status', sortValue: (row) => row.status, width: '128px',
            render: (row) => _jsx(StatusBadge, { status: row.status }),
        },
        {
            key: 'open', header: _jsx("span", { className: "sr-only", children: "Open" }), ariaLabel: 'Open threat', width: '34px', align: 'center',
            render: (row) => (_jsx("button", { type: "button", "aria-label": `Open ${row.id} investigation console`, onClick: (e) => { e.stopPropagation(); navigate(`/threats/${row.id}`); }, className: "inline-flex size-5 items-center justify-center rounded-[2px] text-ink-4 transition-colors hover:bg-term/10 hover:text-term", children: _jsx(ExternalLink, { className: "size-3", "aria-hidden": true }) })),
        },
    ];
    return (_jsx(DataTable, { columns: columns, rows: threats, rowKey: (row) => row.id, loading: loading, error: error, onRetry: onRetry, onRowClick: onSelect ?? ((threat) => navigate(`/threats/${threat.id}`)), selectedKey: selectedId, sortBy: sortBy, sortDir: sortDir, onSortChange: onSortChange, rowAccent: (row) => row.severity === 'critical' ? 'var(--color-critical)'
            : row.severity === 'high' ? 'var(--color-high)'
                : row.severity === 'medium' ? 'var(--color-medium)' : undefined, emptyTitle: "No threats match these filters", emptyDescription: "Adjust or clear the filters above. The detection engine continues to monitor all segments.", emptyIcon: _jsx(ShieldAlert, { className: "size-4", "aria-hidden": true }), caption: "Detected threats", footer: _jsx(Pagination, { page: page, pageSize: pageSize, total: total, onChange: onPageChange, label: "threats" }) }));
}
