import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FileText, Crosshair } from 'lucide-react';
import { SectionRule, KeyValueGrid } from '@/components/ui/KeyValue';
import { SeverityBadge, IncidentStatusBadge, ThreatTypeBadge } from '@/components/ui/Badge';
import { priorityMeta, slaState } from '@/utils/incidentMeta';
import { formatTimestamp } from '@/utils/dates';
import { cn } from '@/utils/cn';
/** Executive summary: what happened, what it affected, and the case metadata. */
export function IncidentSummaryPanel({ incident }) {
    const priority = priorityMeta(incident.priority);
    const sla = slaState(incident.createdAt, incident.priority, incident.status);
    return (_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [_jsx(SeverityBadge, { severity: incident.severity }), _jsx(IncidentStatusBadge, { status: incident.status }), _jsx("span", { className: cn('mono rounded-[2px] border px-1.5 py-[1px] text-[10.5px] font-bold tracking-[0.01em] uppercase', priority.className), children: priority.label }), _jsx(ThreatTypeBadge, { type: incident.type }), _jsx("span", { className: "flex-1" }), _jsx("span", { className: cn('mono text-[11px] tracking-[0.01em] uppercase', sla.tone === 'critical' ? 'text-critical' : sla.tone === 'medium' ? 'text-medium' : 'text-term'), children: sla.label })] }), _jsxs("div", { className: "mt-2.5", children: [_jsx(SectionRule, { className: "mb-1", children: _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(FileText, { className: "size-3", "aria-hidden": true }), "SUMMARY"] }) }), _jsx("p", { className: "text-[12px] leading-relaxed text-ink-2", children: incident.summary })] }), _jsxs("div", { className: "mt-2.5", children: [_jsx(SectionRule, { className: "mb-1", children: _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(Crosshair, { className: "size-3", "aria-hidden": true }), "Business impact"] }) }), _jsx("p", { className: "text-[12px] leading-relaxed text-ink-2", children: incident.impact })] }), _jsx("div", { className: "mt-2.5", children: _jsx(KeyValueGrid, { columns: 2, rows: [
                        { label: 'Incident ID', value: incident.id, copy: incident.id, mono: true },
                        { label: 'Assigned to', value: incident.assignedTo ?? 'UNASSIGNED', tone: incident.assignedTo ? undefined : 'text-medium' },
                        { label: 'Source', value: incident.source, copy: incident.source, mono: true },
                        { label: 'Target', value: incident.target, copy: incident.target, mono: true },
                        { label: 'Opened', value: formatTimestamp(incident.createdAt), mono: true },
                        { label: 'Last update', value: formatTimestamp(incident.updatedAt), mono: true },
                        ...(incident.resolvedAt ? [{ label: 'Resolved', value: formatTimestamp(incident.resolvedAt), mono: true }] : []),
                        { label: 'Evidence items', value: `${incident.evidenceEventIds.length} events`, mono: true },
                        { label: 'Affected assets', value: `${incident.affectedAssets.length} (${incident.affectedAssets.filter((a) => a.compromised).length} compromised)`, mono: true },
                        { label: 'Timeline entries', value: `${incident.timeline.length}`, mono: true },
                        { label: 'Tags', value: incident.tags.length ? incident.tags.join(', ') : '—', span: true, mono: true },
                    ] }) })] }));
}
