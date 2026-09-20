import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSearch, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { SeverityBadge, ThreatTypeBadge, StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionRule } from '@/components/ui/KeyValue';
import { CopyButton } from '@/components/ui/CopyButton';
import { formatClockShort, formatRelative } from '@/utils/dates';
import { severityRank } from '@/utils/severity';
import { cn } from '@/utils/cn';
/** Linked evidence events with an inline forensic detail row. */
export function EvidenceList({ events, incidentId }) {
    const [expanded, setExpanded] = useState(null);
    if (!events.length) {
        return _jsx(EmptyState, { compact: true, icon: _jsx(FileSearch, { className: "size-4", "aria-hidden": true }), title: "No evidence linked", description: "Correlated events will appear here once detection rules attach them to this case." });
    }
    const columns = [
        {
            key: 'expander', header: _jsx("span", { className: "sr-only", children: "Expand" }), ariaLabel: 'Expand evidence', width: '28px', align: 'center',
            render: (row) => (_jsx("span", { className: cn('inline-flex size-4 items-center justify-center text-ink-4', expanded === row.id && 'text-term'), children: expanded === row.id ? _jsx(ChevronUp, { className: "size-3", "aria-hidden": true }) : _jsx(ChevronDown, { className: "size-3", "aria-hidden": true }) })),
        },
        { key: 'timestamp', header: 'Time', sortValue: (row) => +new Date(row.timestamp), width: '104px', render: (row) => (_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "mono tnum text-[10.5px] text-ink-3", children: formatClockShort(row.timestamp) }), _jsx("div", { className: "mono text-[10.5px] text-ink-4", children: formatRelative(row.timestamp) })] })) },
        { key: 'id', header: 'Event', sortValue: (row) => row.id, width: '86px', render: (row) => _jsx("span", { className: "mono text-[11px] text-term", children: row.id }) },
        { key: 'source', header: 'Source', sortValue: (row) => row.source, width: '128px', hideBelow: 'md', render: (row) => (_jsx("span", { className: "mono truncate text-[10.5px] text-cyber", children: row.source })) },
        { key: 'description', header: 'Observation', sortValue: (row) => row.description ?? row.type, render: (row) => (_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "truncate text-[11.5px] font-medium text-ink", children: row.description ?? row.type }), _jsx("div", { className: "mono truncate text-[10.5px] text-ink-4", children: row.detectionRule ?? row.channel })] })) },
        { key: 'severity', header: 'Severity', sortValue: (row) => severityRank(row.severity), width: '100px', render: (row) => _jsx(SeverityBadge, { severity: row.severity, showGlyph: false }) },
        { key: 'type', header: 'Type', sortValue: (row) => row.type, width: '132px', hideBelow: 'lg', render: (row) => _jsx(ThreatTypeBadge, { type: row.type }) },
        { key: 'status', header: 'Status', sortValue: (row) => row.status, width: '112px', hideBelow: 'md', render: (row) => _jsx(StatusBadge, { status: row.status }) },
        { key: 'open', header: _jsx("span", { className: "sr-only", children: "Open" }), ariaLabel: 'Open full event', width: '30px', align: 'center', render: (row) => (_jsx(Link, { to: `/threats/${row.id}`, "aria-label": `Open ${row.id}`, className: "inline-flex size-5 items-center justify-center rounded-[2px] text-ink-4 transition-colors hover:bg-raised hover:text-cyber", children: _jsx(ExternalLink, { className: "size-3", "aria-hidden": true }) })) },
    ];
    return (_jsxs("div", { className: "min-w-0", children: [_jsx(SectionRule, { className: "mb-1.5", children: _jsxs("span", { children: ["Linked evidence \u00B7 ", events.length, " EVENT", events.length === 1 ? '' : 'S'] }) }), _jsx(DataTable, { columns: columns, rows: events, rowKey: (row) => row.id, onRowClick: (row) => setExpanded((current) => (current === row.id ? null : row.id)), selectedKey: expanded, rowAccent: (row) => (row.severity === 'critical' ? 'var(--color-critical)' : row.severity === 'high' ? 'var(--color-high)' : undefined), caption: `Evidence linked to ${incidentId}` }), expanded ? (() => {
                const event = events.find((candidate) => candidate.id === expanded);
                if (!event)
                    return null;
                return (_jsxs("div", { className: "mt-2 rounded-[2px] border border-line-2 bg-base p-2.5", children: [_jsx("p", { className: "text-[11.5px] leading-relaxed text-ink-2", children: event.description }), _jsx("dl", { className: "mt-2 grid gap-x-3 gap-y-1 sm:grid-cols-2 xl:grid-cols-3", children: [
                                ['SOURCE', event.source],
                                ['TARGET', event.target ?? '—'],
                                ['CHANNEL', event.channel],
                                ['DETECTION RULE', event.detectionRule ?? '—'],
                                ['THREAT', event.threatId ?? '—'],
                                ['INCIDENT', event.incidentId ?? incidentId],
                            ].map(([label, value]) => (_jsxs("div", { className: "flex items-baseline gap-1.5 border-b border-line py-1", children: [_jsx("dt", { className: "label-xs shrink-0", children: label }), _jsxs("dd", { className: "mono flex min-w-0 flex-1 items-baseline justify-end gap-1 truncate text-[10.5px] text-ink-2", children: [_jsx("span", { className: "min-w-0 truncate", children: value }), value !== '—' ? _jsx(CopyButton, { value: value, label: `Copy ${label.toLowerCase()}` }) : null] })] }, label))) }), event.metadata && Object.keys(event.metadata).length ? (_jsxs("div", { className: "mt-2", children: [_jsx(SectionRule, { className: "mb-1", children: _jsx("span", { children: "Event metadata" }) }), _jsx("ul", { className: "flex flex-wrap gap-1", children: Object.entries(event.metadata).map(([key, value]) => (_jsxs("li", { className: "mono inline-flex items-center gap-1 rounded-[2px] border border-line-2 bg-raised px-1.5 py-[1px] text-[11px] text-ink-3", children: [_jsx("span", { className: "text-ink-4 uppercase", children: key }), _jsx("span", { className: "text-cyber", children: String(value) }), _jsx(CopyButton, { value: `${key}=${String(value)}`, label: `Copy ${key}` })] }, key))) })] })) : null] }));
            })() : null] }));
}
