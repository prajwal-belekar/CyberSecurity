import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Download, ExternalLink, FileText, Lock } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionRule } from '@/components/ui/KeyValue';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/store/ToastContext';
import { formatDay, formatTimestamp } from '@/utils/dates';
import { cn } from '@/utils/cn';
const CLASSIFICATION_TONE = {
    INTERNAL: 'border-info/40 bg-info/10 text-info',
    CONFIDENTIAL: 'border-medium/40 bg-medium/10 text-medium',
    RESTRICTED: 'border-critical/40 bg-critical/10 text-critical',
};
/** Rendered document preview: metadata, sections, metrics and linked incidents. */
export function ReportViewer({ report, onClose }) {
    const toast = useToast();
    const download = () => {
        if (!report)
            return;
        // The frontend renders a text rendition; the backend produces the real PDF/CSV.
        const body = [
            `${report.classification} — ${report.title}`,
            `${report.id} · ${report.type.replace(/_/g, ' ')} · ${report.format}`,
            `Period ${formatDay(report.periodStart)} → ${formatDay(report.periodEnd)}`,
            `Generated ${formatTimestamp(report.generatedAt)} by ${report.generatedBy}`,
            '',
            report.summary,
            '',
            ...report.sections.flatMap((section) => [
                `## ${section.heading}`,
                section.body,
                ...(section.metrics?.length ? ['', ...section.metrics.map((metric) => `  - ${metric.label}: ${metric.value}`)] : []),
                '',
            ]),
            report.relatedIncidentIds.length ? `Related incidents: ${report.relatedIncidentIds.join(', ')}` : '',
        ].join('\n');
        const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${report.id}-${report.type}.${report.format === 'PDF' ? 'txt' : report.format.toLowerCase()}`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        toast.success('Export started', `${report.id} downloaded as a text rendition. The backend renderer produces the final ${report.format}.`);
    };
    return (_jsx(Drawer, { open: Boolean(report), onClose: onClose, title: report ? report.title : 'Report', subtitle: report ? _jsxs("span", { className: "mono truncate text-[10.5px] text-cyber", children: [report.id, " \u00B7 ", report.format] }) : undefined, width: "max-w-2xl", badge: report ? _jsx("span", { className: cn('mono rounded-[2px] border px-1.5 py-[1px] text-[10.5px] font-bold tracking-[0.01em] uppercase', CLASSIFICATION_TONE[report.classification]), children: report.classification }) : undefined, footer: report ? (_jsxs("div", { className: "flex w-full flex-wrap items-center gap-1.5", children: [_jsxs("span", { className: "mono inline-flex items-center gap-1 text-[11px] text-ink-4", children: [_jsx(Lock, { className: "size-2.5", "aria-hidden": true }), "HANDLE PER ", report.classification, " POLICY"] }), _jsx("span", { className: "flex-1" }), _jsxs(Button, { variant: "secondary", size: "xs", icon: _jsx(Download, { className: "size-3", "aria-hidden": true }), onClick: download, children: ["Download ", report.format] })] })) : undefined, children: !report ? (_jsx(EmptyState, { icon: _jsx(FileText, { className: "size-4", "aria-hidden": true }), title: "No report selected", description: "Choose a report from the library to preview its sections.", prompt: true })) : (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "rounded-[2px] border border-line-2 bg-base p-2.5", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [_jsx(Badge, { tone: "neutral", children: report.type.replace(/_/g, ' ').toUpperCase() }), _jsx(Badge, { tone: report.status === 'ready' ? 'term' : 'warn', children: report.status.toUpperCase() }), _jsx("span", { className: "flex-1" }), report.sizeKb ? _jsxs("span", { className: "mono tnum text-[11px] text-ink-4", children: [report.sizeKb, " KB"] }) : null] }), _jsx("p", { className: "mt-2 text-[11.5px] leading-relaxed text-ink-2", children: report.summary }), _jsx("dl", { className: "mono mt-2 grid gap-x-3 gap-y-1 border-t border-line pt-2 text-[11px] sm:grid-cols-2", children: [
                                ['PERIOD', `${formatDay(report.periodStart)} → ${formatDay(report.periodEnd)}`],
                                ['GENERATED', formatTimestamp(report.generatedAt)],
                                ['AUTHOR', report.generatedBy],
                                ['FORMAT', report.format],
                                ['SECTIONS', `${report.sections.length}`],
                                ['CLASSIFICATION', report.classification],
                            ].map(([label, value]) => (_jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [_jsx("dt", { className: "field-label shrink-0", children: label }), _jsx("dd", { className: "min-w-0 truncate text-ink-3", children: value })] }, label))) })] }), _jsxs("div", { children: [_jsx(SectionRule, { className: "mb-1.5", children: _jsx("span", { children: "Document sections" }) }), _jsx("ol", { className: "space-y-2", children: report.sections.map((section, index) => (_jsxs("li", { className: "rounded-[2px] border border-line bg-void p-2.5", children: [_jsxs("div", { className: "flex items-baseline gap-2", children: [_jsx("span", { className: "mono tnum shrink-0 text-[11px] text-term", children: String(index + 1).padStart(2, '0') }), _jsx("h3", { className: "min-w-0 flex-1 truncate text-[12px] font-semibold text-ink", children: section.heading })] }), _jsx("p", { className: "mt-1.5 text-[11.5px] leading-relaxed whitespace-pre-wrap text-ink-2", children: section.body }), section.metrics?.length ? (_jsx("dl", { className: "mt-2 grid gap-x-3 gap-y-1 border-t border-line pt-2 sm:grid-cols-2", children: section.metrics.map((metric) => (_jsxs("div", { className: "flex items-baseline justify-between gap-2 border-b border-line py-0.5 last:border-b-0", children: [_jsx("dt", { className: "field-label shrink-0", children: metric.label }), _jsx("dd", { className: "mono tnum min-w-0 truncate text-[10.5px] text-cyber", children: metric.value })] }, metric.label))) })) : null] }, section.heading))) })] }), report.relatedIncidentIds.length ? (_jsxs("div", { children: [_jsx(SectionRule, { className: "mb-1.5", children: _jsx("span", { children: "Related incidents" }) }), _jsx("ul", { className: "flex flex-wrap gap-1.5", children: report.relatedIncidentIds.map((incidentId) => (_jsx("li", { children: _jsxs(Link, { to: `/incidents/${incidentId}`, className: "mono inline-flex items-center gap-1 rounded-[2px] border border-line-2 bg-raised px-1.5 py-[2px] text-[11px] text-term transition-colors hover:border-term/40 hover:bg-term/10", children: [incidentId, _jsx(ExternalLink, { className: "size-2.5", "aria-hidden": true })] }) }, incidentId))) })] })) : null] })) }));
}
