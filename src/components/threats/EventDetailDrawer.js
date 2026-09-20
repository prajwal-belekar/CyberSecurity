import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bot, FileSearch, Gavel, Layers, Link2, ListTree, ShieldCheck, Siren, } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUI } from '@/store/UIContext';
import { useToast } from '@/store/ToastContext';
import { Drawer } from '@/components/ui/Drawer';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { KeyValueGrid, SectionRule } from '@/components/ui/KeyValue';
import { Timeline } from '@/components/ui/Timeline';
import { CopyButton } from '@/components/ui/CopyButton';
import { SkeletonText } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { eventsApi } from '@/services/eventsApi';
import { incidentsApi } from '@/services/incidentsApi';
import { queryKeys } from '@/services/queryKeys';
import { formatRelative, formatTimestamp } from '@/utils/dates';
import { severityMeta } from '@/utils/severity';
/**
 * Right-side investigation drawer opened from any event row, stream entry or
 * dashboard card. Shows identity, evidence, chronology and the three analyst
 * actions: Investigate · Create Incident · Mark Reviewed.
 */
export function EventDetailDrawer({ event }) {
    const { activeEvent, closeEvent, openEvent } = useUI();
    const target = event ?? activeEvent;
    const navigate = useNavigate();
    const toast = useToast();
    const queryClient = useQueryClient();
    const [creatingIncident, setCreatingIncident] = useState(false);
    const relatedQuery = useQuery({
        queryKey: queryKeys.eventRelated(target?.id ?? 'none'),
        queryFn: () => eventsApi.related(target),
        enabled: Boolean(target),
    });
    const statusMutation = useMutation({
        mutationFn: (status) => eventsApi.setStatus(target.id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['threat-summary'] });
            toast.success('Event status updated', `${target?.id} marked as reviewed.`);
        },
        onError: (err) => toast.error('Could not update event', err.message),
    });
    const escalateMutation = useMutation({
        mutationFn: () => incidentsApi.escalateToIncident(target.id),
        onMutate: () => setCreatingIncident(true),
        onSuccess: (result) => {
            setCreatingIncident(false);
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            if (result?.incidentId) {
                toast.success('Incident created', `${result.incidentId} raised from ${target?.id}.`);
                closeEvent();
                navigate(`/incidents/${result.incidentId}`);
            }
        },
        onError: (err) => {
            setCreatingIncident(false);
            toast.error('Could not create incident', err.message);
        },
    });
    const timeline = useMemo(() => {
        if (!target)
            return [];
        const related = relatedQuery.data ?? [];
        return [
            ...related
                .slice()
                .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp))
                .map((e) => ({
                id: e.id,
                time: formatTimestamp(e.timestamp).slice(11),
                title: e.type,
                detail: `${e.id} · ${e.source}${e.target ? ` → ${e.target}` : ''}`,
                tone: (e.severity === 'critical' || e.severity === 'high'
                    ? e.severity === 'critical' ? 'critical' : 'high'
                    : e.severity === 'medium' ? 'medium' : 'neutral'),
                actor: e.detectionRule,
            })),
            {
                id: target.id,
                time: formatTimestamp(target.timestamp).slice(11),
                title: target.type,
                detail: `Selected event · ${target.description ?? 'No additional detail recorded.'}`,
                tone: (severityMeta(target.severity).rank >= 5 ? 'critical' : severityMeta(target.severity).rank >= 4 ? 'high' : severityMeta(target.severity).rank >= 3 ? 'medium' : 'term'),
                actor: target.channel,
            },
        ].sort((a, b) => a.time.localeCompare(b.time));
    }, [target, relatedQuery.data]);
    return (_jsx(Drawer, { open: Boolean(target), onClose: closeEvent, title: "Event Details", subtitle: target ? `${target.id} · ${target.type}` : undefined, badge: target ? _jsx(SeverityBadge, { severity: target.severity }) : undefined, footer: target ? (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "primary", size: "sm", icon: _jsx(FileSearch, { className: "size-3.5", "aria-hidden": true }), onClick: () => {
                        closeEvent();
                        navigate(target.incidentId ? `/incidents/${target.incidentId}` : target.threatId ? `/threats/${target.threatId}` : '/threats');
                    }, children: "Investigate" }), _jsx(Button, { variant: "danger", size: "sm", icon: _jsx(Siren, { className: "size-3.5", "aria-hidden": true }), onClick: () => escalateMutation.mutate(), loading: creatingIncident || escalateMutation.isPending, disabled: Boolean(target.incidentId), children: target.incidentId ? `Linked · ${target.incidentId}` : 'Create Incident' }), _jsx(Button, { variant: "secondary", size: "sm", icon: _jsx(ShieldCheck, { className: "size-3.5", "aria-hidden": true }), onClick: () => statusMutation.mutate('resolved'), loading: statusMutation.isPending, disabled: target.status === 'resolved', children: "Mark Reviewed" }), _jsx("span", { className: "flex-1" }), _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Bot, { className: "size-3.5", "aria-hidden": true }), onClick: () => {
                        closeEvent();
                        navigate(`/ai-assistant?event=${target.id}${target.incidentId ? `&incident=${target.incidentId}` : ''}`);
                    }, children: "Ask AI" })] })) : null, children: !target ? (_jsx(EmptyState, { icon: _jsx(Link2, { className: "size-4", "aria-hidden": true }), title: "No event selected", description: "Select a row in any event table or stream to inspect it here.", prompt: true })) : (_jsxs("div", { className: "space-y-3 p-3", children: [_jsx(KeyValueGrid, { columns: 2, rows: [
                        { label: 'Event ID', value: target.id, copy: target.id },
                        { label: 'Event Type', value: target.type },
                        { label: 'Severity', value: _jsx(SeverityBadge, { severity: target.severity }) },
                        { label: 'Status', value: _jsx(StatusBadge, { status: target.status }) },
                        { label: 'Source', value: target.source, copy: target.source },
                        { label: 'Target', value: target.target ?? '—', copy: target.target },
                        { label: 'Channel', value: target.channel },
                        { label: 'Detection Rule', value: target.detectionRule ?? '—', span: true },
                        { label: 'Timestamp', value: formatTimestamp(target.timestamp), span: true },
                        { label: 'Observed', value: formatRelative(target.timestamp), span: true },
                    ] }), target.description ? (_jsxs("div", { className: "panel-inset p-2.5", children: [_jsx(SectionRule, { children: "Description" }), _jsx("p", { className: "mt-1.5 text-[11.5px] leading-relaxed text-ink-2", children: target.description })] })) : null, target.metadata && Object.keys(target.metadata).length ? (_jsxs("div", { children: [_jsx(SectionRule, { className: "mb-1.5", children: "Metadata" }), _jsx(KeyValueGrid, { columns: 2, rows: Object.entries(target.metadata).map(([key, value]) => ({
                                label: key.replace(/_/g, ' '),
                                value: String(value),
                                mono: true,
                                copy: typeof value === 'string' ? value : undefined,
                            })) })] })) : null, _jsxs("div", { children: [_jsx(SectionRule, { className: "mb-1.5", right: _jsxs("span", { className: "mono", children: [relatedQuery.data?.length ?? 0, " related"] }), children: "EVIDENCE" }), relatedQuery.isLoading ? (_jsx(SkeletonText, { lines: 3 })) : relatedQuery.isError ? (_jsx(ErrorState, { compact: true, title: "Unable to load related events", message: relatedQuery.error.message, onRetry: () => relatedQuery.refetch() })) : !relatedQuery.data?.length ? (_jsx(EmptyState, { compact: true, icon: _jsx(Layers, { className: "size-4", "aria-hidden": true }), title: "No correlated events", description: "No other events share this source, target or detection context yet." })) : (_jsx("ul", { className: "space-y-px", children: relatedQuery.data.map((related) => {
                                const meta = severityMeta(related.severity);
                                return (_jsx("li", { children: _jsxs("button", { type: "button", onClick: () => openEvent(related), className: cn('flex w-full items-center gap-2 rounded-[2px] border border-transparent px-2 py-1.5 text-left transition-colors', 'hover:border-line-2 hover:bg-panel-2'), children: [_jsx("span", { className: cn('mono shrink-0 text-[11px] font-bold', meta.text), children: meta.short }), _jsx("span", { className: "mono shrink-0 text-[11px] text-ink-4", children: related.id }), _jsx("span", { className: "min-w-0 flex-1 truncate text-[11px] text-ink-2", children: related.type }), _jsx("span", { className: "mono hidden shrink-0 text-[11px] text-ink-4 sm:inline", children: formatRelative(related.timestamp) })] }) }, related.id));
                            }) }))] }), _jsxs("div", { children: [_jsx(SectionRule, { className: "mb-1.5", children: _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(ListTree, { className: "size-3", "aria-hidden": true }), " TIMELINE"] }) }), _jsx(Timeline, { items: timeline, dense: true })] }), target.incidentId || target.threatId ? (_jsxs("div", { children: [_jsx(SectionRule, { className: "mb-1.5", children: "Correlation" }), _jsxs("div", { className: "flex flex-wrap gap-1.5", children: [target.threatId ? (_jsxs("button", { type: "button", onClick: () => { closeEvent(); navigate(`/threats/${target.threatId}`); }, className: "mono inline-flex items-center gap-1 rounded-[2px] border border-high/35 bg-high/10 px-2 py-1 text-[11px] tracking-[0.01em] text-high uppercase transition-colors hover:bg-high/20", children: [_jsx(Gavel, { className: "size-3", "aria-hidden": true }), " ", target.threatId] })) : null, target.incidentId ? (_jsxs("button", { type: "button", onClick: () => { closeEvent(); navigate(`/incidents/${target.incidentId}`); }, className: "mono inline-flex items-center gap-1 rounded-[2px] border border-critical/35 bg-critical/10 px-2 py-1 text-[11px] tracking-[0.01em] text-critical uppercase transition-colors hover:bg-critical/20", children: [_jsx(Siren, { className: "size-3", "aria-hidden": true }), " ", target.incidentId] })) : null] })] })) : null, _jsxs("div", { className: "flex flex-wrap items-center gap-2 border-t border-line pt-2", children: [_jsx("span", { className: "text-[11px] tracking-[0.01em] text-ink-4", children: "Quick copy" }), _jsx(CopyButton, { value: target.id, withValue: true, label: "Copy event ID" }), _jsx(CopyButton, { value: target.source, withValue: true, label: "Copy source address" })] })] })) }));
}
