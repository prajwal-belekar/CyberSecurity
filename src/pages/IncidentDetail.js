import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Activity, AlarmClock, ArrowLeft, Brain, FileSearch, ServerCog, StickyNote, FileText } from 'lucide-react';
import { useIncident, useIncidentEvidence } from '@/hooks/useIncidents';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Panel } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Badge, SeverityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Meter } from '@/components/ui/Meter';
import { IncidentSummaryPanel } from '@/components/incidents/IncidentSummaryPanel';
import { IncidentTimelinePanel } from '@/components/incidents/IncidentTimelinePanel';
import { EvidenceList } from '@/components/incidents/EvidenceList';
import { AffectedAssets } from '@/components/incidents/AffectedAssets';
import { AnalystNotes } from '@/components/incidents/AnalystNotes';
import { AiAnalysisPanel } from '@/components/incidents/AiAnalysisPanel';
import { IncidentActions } from '@/components/incidents/IncidentActions';
import { priorityMeta, slaState, statusMetaFor } from '@/utils/incidentMeta';
import { formatTimestamp, formatRelative } from '@/utils/dates';
import { cn } from '@/utils/cn';
/** Incident Detail — case file with summary, timeline, evidence, assets, notes and AI triage. */
export default function IncidentDetail() {
    const { incidentId: id = '' } = useParams();
    const [tab, setTab] = useState('overview');
    const incident = useIncident(id);
    const evidence = useIncidentEvidence(id);
    const record = incident.data;
    if (incident.isLoading) {
        return (_jsxs("div", { className: "space-y-2.5 p-2.5 sm:p-3", children: [_jsx(Skeleton, { className: "h-4 w-64" }), _jsx(Skeleton, { className: "h-10 w-full" }), _jsxs("div", { className: "grid gap-2.5 xl:grid-cols-[minmax(0,1fr)_330px]", children: [_jsx(Skeleton, { className: "h-[520px] w-full" }), _jsx(Skeleton, { className: "h-[520px] w-full" })] })] }));
    }
    if (incident.isError || !record) {
        return (_jsxs("div", { className: "space-y-2.5 p-2.5 sm:p-3", children: [_jsx(Breadcrumbs, { items: [{ label: 'Incidents', to: '/incidents' }, { label: id || 'unknown' }] }), _jsx(Panel, { className: "min-w-0", children: _jsx(ErrorState, { title: `Incident ${id || ''} could not be loaded`, message: incident.isError ? incident.error.message : 'No incident exists with this identifier. It may have been merged or purged from the retention window.', hint: "Check the identifier, or return to the incident queue and pick an active case.", onRetry: () => incident.refetch(), action: _jsx(Link, { to: "/incidents", children: _jsx(Button, { variant: "secondary", size: "sm", icon: _jsx(ArrowLeft, { className: "size-3.5", "aria-hidden": true }), children: "Back to incidents" }) }) }) })] }));
    }
    const priority = priorityMeta(record.priority);
    const sla = slaState(record.createdAt, record.priority, record.status);
    const status = statusMetaFor(record.status);
    const tabs = [
        { value: 'overview', label: 'OVERVIEW', icon: _jsx(FileText, { className: "size-3", "aria-hidden": true }) },
        { value: 'timeline', label: 'TIMELINE', icon: _jsx(Activity, { className: "size-3", "aria-hidden": true }), count: record.timeline.length },
        { value: 'evidence', label: 'EVIDENCE', icon: _jsx(FileSearch, { className: "size-3", "aria-hidden": true }), count: evidence.data?.length ?? record.evidenceEventIds.length },
        { value: 'assets', label: 'ASSETS', icon: _jsx(ServerCog, { className: "size-3", "aria-hidden": true }), count: record.affectedAssets.length },
        { value: 'notes', label: 'NOTES', icon: _jsx(StickyNote, { className: "size-3", "aria-hidden": true }), count: record.notes.length },
        { value: 'ai', label: 'AI ANALYSIS', icon: _jsx(Brain, { className: "size-3", "aria-hidden": true }) },
    ];
    return (_jsxs("div", { className: "space-y-2.5 p-2.5 sm:p-3", children: [_jsx(Breadcrumbs, { items: [{ label: 'Incidents', to: '/incidents' }, { label: record.id }] }), _jsx(PageHeader, { title: record.title, description: record.summary, status: _jsxs("span", { className: "flex flex-wrap items-center gap-1.5", children: [_jsx("span", { className: "mono text-[11px] font-bold text-term", children: record.id }), _jsx(SeverityBadge, { severity: record.severity }), _jsx("span", { className: cn('mono rounded-[2px] border px-1.5 py-[1px] text-[10.5px] font-bold tracking-[0.01em] uppercase', status.className), children: status.label }), _jsx("span", { className: cn('mono rounded-[2px] border px-1.5 py-[1px] text-[10.5px] font-bold tracking-[0.01em] uppercase', priority.className), children: priority.label })] }), actions: _jsx(Link, { to: "/incidents", children: _jsx(Button, { variant: "secondary", size: "sm", icon: _jsx(ArrowLeft, { className: "size-3.5", "aria-hidden": true }), children: "Incident queue" }) }) }), _jsxs("div", { className: "grid min-w-0 gap-2.5 xl:grid-cols-[minmax(0,1fr)_330px]", children: [_jsxs(Panel, { className: "min-w-0", noPadding: true, actions: _jsxs("span", { className: "mono text-[11px] tracking-[0.01em] text-ink-4 uppercase", children: ["UPDATED ", formatRelative(record.updatedAt)] }), children: [_jsx("div", { className: "border-b border-line bg-base px-2.5 py-1.5", children: _jsx(Tabs, { ariaLabel: "Incident sections", value: tab, onChange: (value) => setTab(value), items: tabs.map((entry) => ({ value: entry.value, label: entry.label, icon: entry.icon, count: entry.count })), scrollable: true }) }), _jsxs("div", { className: "p-2.5", children: [tab === 'overview' ? _jsx(IncidentSummaryPanel, { incident: record }) : null, tab === 'timeline' ? _jsx(IncidentTimelinePanel, { timeline: record.timeline }) : null, tab === 'evidence' ? (evidence.isLoading ? (_jsx("div", { className: "space-y-2", children: Array.from({ length: 5 }).map((_, i) => _jsx(Skeleton, { className: "h-9 w-full" }, i)) })) : evidence.isError ? (_jsx(ErrorState, { compact: true, title: "Evidence unavailable", message: evidence.error.message, onRetry: () => evidence.refetch() })) : (_jsx(EvidenceList, { events: evidence.data ?? [], incidentId: record.id }))) : null, tab === 'assets' ? _jsx(AffectedAssets, { assets: record.affectedAssets }) : null, tab === 'notes' ? _jsx(AnalystNotes, { incidentId: record.id, notes: record.notes }) : null, tab === 'ai' ? _jsx(AiAnalysisPanel, { analysis: record.aiAnalysis, incidentId: record.id }) : null] })] }), _jsxs("div", { className: "flex min-w-0 flex-col gap-2.5", children: [_jsx(Panel, { title: "Response Actions", icon: _jsx(AlarmClock, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", accent: record.priority === 'p1' ? 'critical' : undefined, children: _jsx(IncidentActions, { incident: record }) }), _jsxs(Panel, { title: "Response Clock", className: "min-w-0", children: [_jsxs("div", { className: "mb-1.5 flex items-baseline justify-between gap-2", children: [_jsxs("span", { className: "label-xs", children: [priority.label, " response target"] }), _jsxs("span", { className: "mono tnum text-[10.5px] text-ink-3", children: [priority.responseTargetMinutes, " min"] })] }), _jsx(Meter, { value: Math.min(100, (sla.elapsedMinutes / priority.responseTargetMinutes) * 100), tone: sla.tone === 'critical' ? 'err' : sla.tone === 'medium' ? 'warn' : 'term' }), _jsx("p", { className: cn('mono mt-1.5 text-[11px] tracking-[0.01em] uppercase', sla.tone === 'critical' ? 'text-critical' : sla.tone === 'medium' ? 'text-medium' : 'text-term'), children: sla.label }), _jsx("dl", { className: "mt-2 space-y-1 border-t border-line pt-2", children: [
                                            ['OPENED', formatTimestamp(record.createdAt)],
                                            ['LAST UPDATE', formatTimestamp(record.updatedAt)],
                                            ...(record.resolvedAt ? [['RESOLVED', formatTimestamp(record.resolvedAt)]] : []),
                                            ['OWNER', record.assignedTo ?? 'UNASSIGNED'],
                                        ].map(([label, value]) => (_jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [_jsx("dt", { className: "label-xs shrink-0", children: label }), _jsx("dd", { className: "mono truncate text-[11px] text-ink-3", children: value })] }, label))) })] }), _jsx(Panel, { title: "Escalation Path", className: "min-w-0", children: _jsx("ol", { className: "space-y-1", children: [
                                        { step: 'Detection & triage', done: true },
                                        { step: 'Analyst assignment', done: Boolean(record.assignedTo) },
                                        { step: 'Containment', done: record.status === 'contained' || record.status === 'resolved' },
                                        { step: 'Eradication & recovery', done: record.status === 'resolved' },
                                        { step: 'Post-incident review', done: record.status === 'resolved' || record.status === 'false_positive' },
                                    ].map((stage, index) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: cn('mono tnum flex size-4 shrink-0 items-center justify-center rounded-[2px] border text-[10.5px] font-bold', stage.done ? 'border-term/45 bg-term/10 text-term' : 'border-line-3 bg-raised text-ink-4'), "aria-hidden": true, children: index + 1 }), _jsx("span", { className: cn('min-w-0 flex-1 truncate text-[11px]', stage.done ? 'text-ink-2' : 'text-ink-4'), children: stage.step }), stage.done ? _jsx(Badge, { tone: "term", children: "DONE" }) : _jsx(Badge, { tone: "neutral", children: "PENDING" })] }, stage.step))) }) })] })] })] }));
}
