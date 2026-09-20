import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bot, Crosshair, FileText, Gavel, Layers, Siren, Target, Wrench, } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Panel } from '@/components/ui/Card';
import { Badge, SeverityBadge, StatusBadge, ThreatTypeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { KeyValueGrid, SectionRule } from '@/components/ui/KeyValue';
import { CopyButton } from '@/components/ui/CopyButton';
import { Meter } from '@/components/ui/Meter';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/store/ToastContext';
import { threatsApi } from '@/services/threatsApi';
import { incidentsApi } from '@/services/incidentsApi';
import { formatRelative, formatTimestamp } from '@/utils/dates';
const STATUS_ACTIONS = [
    { status: 'investigating', label: 'Investigate' },
    { status: 'contained', label: 'Contain' },
    { status: 'resolved', label: 'Resolve' },
    { status: 'false_positive', label: 'False positive' },
];
/** Full forensic breakdown of a single threat. */
export function ThreatDetails({ threat }) {
    const navigate = useNavigate();
    const toast = useToast();
    const queryClient = useQueryClient();
    const statusMutation = useMutation({
        mutationFn: (status) => threatsApi.updateStatus(threat.id, status),
        onSuccess: (_data, status) => {
            queryClient.invalidateQueries({ queryKey: ['threats'] });
            queryClient.invalidateQueries({ queryKey: ['threat-summary'] });
            toast.success('Threat status updated', `${threat.id} → ${status.replace('_', ' ').toUpperCase()}`);
        },
        onError: (err) => toast.error('Could not update threat', err.message),
    });
    const escalateMutation = useMutation({
        mutationFn: () => incidentsApi.escalateToIncident(threat.relatedEventIds[0] ?? ''),
        onSuccess: (result) => {
            if (result?.incidentId) {
                toast.success('Incident created', `${result.incidentId} raised from ${threat.id}.`);
                navigate(`/incidents/${result.incidentId}`);
            }
            else {
                toast.info('No linked event', 'This threat has no correlated event to escalate from. Open an event and create the incident there.');
            }
        },
        onError: (err) => toast.error('Could not create incident', err.message),
    });
    return (_jsxs("div", { className: "space-y-2.5", children: [_jsxs(Panel, { accent: threat.severity === 'critical' ? 'critical' : threat.severity === 'high' ? 'high' : 'none', noPadding: true, className: "min-w-0", children: [_jsxs("div", { className: "border-b border-line bg-panel-2 px-3 py-2.5", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "text-[11px] font-semibold tracking-[0.01em] text-ink-4", children: "Threat /" }), _jsx("span", { className: "mono text-[13px] font-bold tracking-[0.01em] text-term", children: threat.id }), _jsx(SeverityBadge, { severity: threat.severity }), _jsx(StatusBadge, { status: threat.status }), _jsx(ThreatTypeBadge, { type: threat.type }), _jsx("span", { className: "flex-1" }), _jsxs(Badge, { tone: threat.confidence >= 0.8 ? 'term' : threat.confidence >= 0.6 ? 'warn' : 'neutral', children: ["CONFIDENCE ", threat.confidence.toFixed(2)] })] }), _jsx("h2", { className: "mt-1.5 text-[15px] font-semibold tracking-[-0.01em] text-ink sm:text-[17px]", children: threat.title })] }), _jsxs("div", { className: "grid gap-x-4 px-3 py-2 lg:grid-cols-2", children: [_jsx(KeyValueGrid, { columns: 1, rows: [
                                    { label: 'Source', value: threat.source, copy: threat.source },
                                    { label: 'Target', value: threat.target, copy: threat.target },
                                    { label: 'First seen', value: formatTimestamp(threat.firstSeen) },
                                    { label: 'Last seen', value: `${formatTimestamp(threat.lastSeen)} · ${formatRelative(threat.lastSeen)}` },
                                ] }), _jsx(KeyValueGrid, { columns: 1, rows: [
                                    { label: 'Occurrences', value: String(threat.occurrences) },
                                    { label: 'Detection rule', value: threat.detectionRule, copy: threat.detectionRule },
                                    { label: 'MITRE', value: threat.mitre ? `${threat.mitre.id} · ${threat.mitre.technique}` : '—' },
                                    { label: 'Tactic', value: threat.mitre?.tactic ?? '—' },
                                    ...(threat.incidentId ? [{ label: 'Incident', value: threat.incidentId, copy: threat.incidentId }] : []),
                                ] })] })] }), _jsxs("div", { className: "grid min-w-0 gap-2.5 lg:grid-cols-3", children: [_jsxs(Panel, { title: "Assessment", icon: _jsx(FileText, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0 lg:col-span-2", children: [_jsx("p", { className: "text-[12px] leading-relaxed text-ink-2", children: threat.description }), threat.mitre ? (_jsxs("div", { className: "mt-2.5 border-t border-line pt-2", children: [_jsx(SectionRule, { className: "mb-1.5", children: "ATT&CK mapping" }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx(Badge, { tone: "ai", children: threat.mitre.id }), _jsx("span", { className: "mono text-[11px] text-ink-2", children: threat.mitre.technique }), _jsxs("span", { className: "mono text-[11px] text-ink-4", children: ["\u00B7 ", threat.mitre.tactic] })] })] })) : null] }), _jsxs(Panel, { title: "Detection Confidence", icon: _jsx(Crosshair, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", children: [_jsxs("div", { className: "flex items-baseline gap-2", children: [_jsx("span", { className: cn('mono tnum text-[30px] leading-none font-bold', threat.confidence >= 0.8 ? 'text-term' : threat.confidence >= 0.6 ? 'text-medium' : 'text-ink-2'), children: (threat.confidence * 100).toFixed(0) }), _jsx("span", { className: "mono text-[11px] text-ink-4", children: "/ 100" })] }), _jsx(Meter, { value: threat.confidence * 100, tone: threat.confidence >= 0.8 ? 'term' : threat.confidence >= 0.6 ? 'warn' : 'neutral', className: "mt-2", showValue: false }), _jsx("dl", { className: "mt-2.5 space-y-1", children: [
                                    { k: 'Correlated events', v: String(threat.relatedEventIds.length) },
                                    { k: 'Indicators matched', v: String(threat.indicators.length) },
                                    { k: 'Observation window', v: `${Math.max(1, Math.round((+new Date(threat.lastSeen) - +new Date(threat.firstSeen)) / 60000))}m` },
                                    { k: 'Repeat occurrences', v: String(threat.occurrences) },
                                ].map((row) => (_jsxs("div", { className: "flex items-baseline justify-between gap-2 border-b border-line pb-1 last:border-b-0", children: [_jsx("dt", { className: "label-xs", children: row.k }), _jsx("dd", { className: "mono tnum text-[11px] text-ink", children: row.v })] }, row.k))) })] })] }), _jsxs("div", { className: "grid min-w-0 gap-2.5 lg:grid-cols-2", children: [_jsx(Panel, { title: "Indicators", icon: _jsx(Layers, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", children: threat.indicators.length ? (_jsx("ul", { className: "space-y-1", children: threat.indicators.map((indicator) => (_jsxs("li", { className: "flex items-center gap-2 rounded-[2px] border border-line bg-base px-2 py-1", children: [_jsx(Target, { className: "size-3 shrink-0 text-cyber", "aria-hidden": true }), _jsx("span", { className: "mono min-w-0 flex-1 truncate text-[11px] text-ink-2", children: indicator }), _jsx(CopyButton, { value: indicator, label: `Copy indicator ${indicator}` })] }, indicator))) })) : (_jsx(EmptyState, { compact: true, icon: _jsx(Layers, { className: "size-4", "aria-hidden": true }), title: "No indicators extracted", description: "The detection rule fired without exporting discrete indicators." })) }), _jsxs(Panel, { title: "Recommended Actions", icon: _jsx(Wrench, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", children: [_jsx("ol", { className: "space-y-1.5", children: threat.recommendedActions.map((action, index) => (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("span", { className: "mono mt-px shrink-0 rounded-[2px] border border-line-2 bg-raised px-1 text-[10.5px] text-ink-4", children: String(index + 1).padStart(2, '0') }), _jsx("span", { className: "text-[11.5px] leading-relaxed text-ink-2", children: action })] }, action))) }), _jsx(SectionRule, { className: "mt-3 mb-2", children: "Analyst actions" }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: STATUS_ACTIONS.map((action) => (_jsx(Button, { size: "xs", variant: threat.status === action.status ? 'primary' : 'secondary', icon: _jsx(Gavel, { className: "size-3", "aria-hidden": true }), onClick: () => statusMutation.mutate(action.status), loading: statusMutation.isPending && statusMutation.variables === action.status, disabled: threat.status === action.status, children: action.label }, action.status))) }), _jsxs("div", { className: "mt-1.5 flex flex-wrap gap-1.5", children: [_jsx(Button, { size: "xs", variant: "danger", icon: _jsx(Siren, { className: "size-3", "aria-hidden": true }), onClick: () => escalateMutation.mutate(), loading: escalateMutation.isPending, disabled: Boolean(threat.incidentId), children: threat.incidentId ? `Linked · ${threat.incidentId}` : 'Create incident' }), _jsx(Button, { size: "xs", variant: "ghost", icon: _jsx(Bot, { className: "size-3", "aria-hidden": true }), onClick: () => navigate(`/ai-assistant?threat=${threat.id}${threat.incidentId ? `&incident=${threat.incidentId}` : ''}`), children: "Ask AI terminal" }), threat.incidentId ? (_jsxs(Button, { size: "xs", variant: "outline", icon: _jsx(Siren, { className: "size-3", "aria-hidden": true }), onClick: () => navigate(`/incidents/${threat.incidentId}`), children: ["Open ", threat.incidentId] })) : null] })] })] })] }));
}
