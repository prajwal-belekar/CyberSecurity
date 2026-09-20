import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, CheckCircle2, FileText, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { SectionRule } from '@/components/ui/KeyValue';
import { Badge } from '@/components/ui/Badge';
import { useAssignIncident, useUpdateIncidentStatus } from '@/hooks/useIncidents';
import { useToast } from '@/store/ToastContext';
import { INCIDENT_STATUS_ORDER, statusMetaFor } from '@/utils/incidentMeta';
import { cn } from '@/utils/cn';
const ANALYSTS = ['a.reyes', 'k.nakamura', 'm.okafor', 'j.lindqvist', 'd.mensah'];
/**
 * Case actions: status transition (with confirmation), reassignment, and
 * hand-off links into evidence, reporting and the AI console.
 */
export function IncidentActions({ incident }) {
    const [pendingStatus, setPendingStatus] = useState(null);
    const toast = useToast();
    const updateStatus = useUpdateIncidentStatus(incident.id);
    const assign = useAssignIncident(incident.id);
    const applyStatus = () => {
        if (!pendingStatus)
            return;
        updateStatus.mutate(pendingStatus, {
            onSuccess: () => {
                toast.success('Status updated', `${incident.id} → ${statusMetaFor(pendingStatus).label}.`);
                setPendingStatus(null);
            },
            onError: (err) => toast.error('Status change failed', err.message),
        });
    };
    const target = pendingStatus ? statusMetaFor(pendingStatus) : null;
    return (_jsxs("div", { className: "min-w-0", children: [_jsx(SectionRule, { className: "mb-1.5", children: _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(ShieldCheck, { className: "size-3", "aria-hidden": true }), "Status transition"] }) }), _jsx("div", { className: "grid grid-cols-2 gap-1.5 sm:grid-cols-3", children: INCIDENT_STATUS_ORDER.map((status) => {
                    const meta = statusMetaFor(status);
                    const current = incident.status === status;
                    return (_jsxs(Button, { size: "xs", variant: current ? 'primary' : 'secondary', disabled: current || updateStatus.isPending, "aria-pressed": current, onClick: () => setPendingStatus(status), className: cn('justify-start', !current && meta.text), children: [_jsx("span", { className: "truncate", children: meta.label }), current ? _jsx(CheckCircle2, { className: "ml-auto size-3 shrink-0", "aria-hidden": true }) : null] }, status));
                }) }), _jsxs("div", { className: "mt-2.5", children: [_jsx(SectionRule, { className: "mb-1.5", children: _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(UserCheck, { className: "size-3", "aria-hidden": true }), "ASSIGNMENT"] }) }), _jsx(Select, { compact: true, "aria-label": "Reassign incident", value: incident.assignedTo ?? '', disabled: assign.isPending, onChange: (e) => {
                            const analyst = e.target.value;
                            assign.mutate(analyst, {
                                onSuccess: () => toast.success('Reassigned', `${incident.id} is now assigned to ${analyst}.`),
                                onError: (err) => toast.error('Assignment failed', err.message),
                            });
                        }, options: [
                            { value: '', label: 'UNASSIGNED' },
                            ...ANALYSTS.map((analyst) => ({ value: analyst, label: analyst })),
                        ] }), _jsx("p", { className: "mono mt-1 text-[11px] text-ink-4", children: assign.isPending ? 'UPDATING ASSIGNMENT…' : incident.assignedTo ? `CURRENT OWNER ${incident.assignedTo}` : 'NO OWNER — FIRST RESPONDER WILL CLAIM THIS CASE' })] }), _jsxs("div", { className: "mt-2.5", children: [_jsx(SectionRule, { className: "mb-1.5", children: _jsx("span", { children: "Hand-off" }) }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx(Link, { to: "/reports", className: "block", children: _jsx(Button, { variant: "secondary", size: "xs", className: "w-full justify-start", icon: _jsx(FileText, { className: "size-3", "aria-hidden": true }), children: "Generate incident report" }) }), _jsx(Link, { to: `/ai-assistant?incident=${incident.id}`, className: "block", children: _jsx(Button, { variant: "secondary", size: "xs", className: "w-full justify-start", icon: _jsx(ArrowUpRight, { className: "size-3", "aria-hidden": true }), children: "Investigate with AI assistant" }) }), _jsx(Link, { to: "/threat-intelligence", className: "block", children: _jsx(Button, { variant: "ghost", size: "xs", className: "w-full justify-start", icon: _jsx(AlertTriangle, { className: "size-3", "aria-hidden": true }), children: "Check indicators against intel" }) })] })] }), _jsxs("div", { className: "mt-2.5 flex flex-wrap items-center gap-1.5", children: [_jsx(Badge, { tone: incident.priority === 'p1' ? 'err' : incident.priority === 'p2' ? 'warn' : 'neutral', children: incident.priority.toUpperCase() }), _jsxs(Badge, { tone: "neutral", children: [incident.timeline.length, " TIMELINE"] }), _jsxs(Badge, { tone: "neutral", children: [incident.evidenceEventIds.length, " EVIDENCE"] }), _jsxs(Badge, { tone: "neutral", children: [incident.affectedAssets.length, " ASSETS"] }), _jsxs(Badge, { tone: "neutral", children: [incident.notes.length, " NOTES"] })] }), _jsx(Modal, { open: Boolean(pendingStatus), onClose: () => setPendingStatus(null), title: `Move ${incident.id} to ${target?.label ?? ''}?`, description: "Status changes are written to the incident audit trail with your analyst identity.", tone: pendingStatus === 'false_positive' ? 'danger' : 'default', footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setPendingStatus(null), disabled: updateStatus.isPending, children: "Cancel" }), _jsx(Button, { variant: "primary", size: "sm", loading: updateStatus.isPending, onClick: applyStatus, children: "Confirm transition" })] }), children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: cn('mono rounded-[2px] border px-1.5 py-[1px] text-[11px] font-bold tracking-[0.01em] uppercase', statusMetaFor(incident.status).className), children: statusMetaFor(incident.status).label }), _jsx("span", { className: "mono text-ink-4", "aria-hidden": true, children: "\u2192" }), target ? (_jsx("span", { className: cn('mono rounded-[2px] border px-1.5 py-[1px] text-[11px] font-bold tracking-[0.01em] uppercase', target.className), children: target.label })) : null] }), _jsx("p", { className: "text-[11.5px] leading-relaxed text-ink-2", children: incident.title }), pendingStatus === 'resolved' ? (_jsx("p", { className: "mono rounded-[2px] border border-medium/30 bg-medium/[0.06] px-2 py-1.5 text-[10.5px] leading-relaxed text-ink-2", children: "Confirm containment and remediation are complete before resolving \u2014 the resolution clock stops and the case moves to post-incident review." })) : null, pendingStatus === 'false_positive' ? (_jsx("p", { className: "mono rounded-[2px] border border-info/30 bg-info/[0.06] px-2 py-1.5 text-[10.5px] leading-relaxed text-ink-2", children: "Mark as benign only when evidence rules out compromise. Detection rules will be tuned so the same pattern stops alerting." })) : null] }) })] }));
}
