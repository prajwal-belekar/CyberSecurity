import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
import { severityMeta, statusMeta, INCIDENT_STATUS_META, threatTypeLabel } from '@/utils/severity';
const TONES = {
    neutral: 'border-line-2 bg-raised text-ink-3',
    term: 'border-term/35 bg-term/10 text-term',
    cyber: 'border-cyber/35 bg-cyber/10 text-cyber',
    ai: 'border-ai/35 bg-ai/10 text-ai',
    volt: 'border-volt/35 bg-volt/10 text-volt',
    warn: 'border-medium/35 bg-medium/10 text-medium',
    err: 'border-critical/35 bg-critical/10 text-critical',
};
/** Small uppercase monospace tag — the atom of the status vocabulary. */
export function Badge({ children, className, tone = 'neutral', size = 'xs', dot, title }) {
    return (_jsxs("span", { title: title, className: cn('inline-flex items-center gap-1 rounded-[2px] border font-mono font-semibold uppercase tracking-[0.02em] whitespace-nowrap', size === 'xs' ? 'px-1.5 py-[1px] text-[11px]' : 'px-2 py-0.5 text-[10.5px]', TONES[tone], className), children: [dot ? _jsx("span", { className: "size-1.5 shrink-0 rounded-full bg-current", "aria-hidden": true }) : null, children] }));
}
/**
 * Severity badge. Colour is always paired with a glyph + label so severity is
 * never communicated by colour alone (WCAG 1.4.1).
 */
export function SeverityBadge({ severity, className, showGlyph = true }) {
    const meta = severityMeta(severity);
    return (_jsxs("span", { className: cn('inline-flex items-center gap-1 rounded-[2px] border bg-current/10 px-1.5 py-[1px] font-mono text-[11px] font-bold uppercase tracking-[0.02em] whitespace-nowrap', meta.text, meta.border, className), style: { backgroundColor: `${meta.hex}1a` }, title: `Severity: ${meta.label}`, children: [showGlyph ? _jsx("span", { "aria-hidden": true, children: meta.glyph }) : null, _jsx("span", { children: meta.label }), _jsx("span", { className: "sr-only", children: "severity" })] }));
}
export function StatusBadge({ status, className }) {
    const meta = statusMeta(status);
    return (_jsx("span", { className: cn('inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-[1px] font-mono text-[11px] font-semibold uppercase tracking-[0.02em] whitespace-nowrap', meta.className, className), children: meta.label }));
}
export function IncidentStatusBadge({ status, className }) {
    const meta = INCIDENT_STATUS_META[status];
    return (_jsx("span", { className: cn('inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-[1px] font-mono text-[11px] font-semibold uppercase tracking-[0.02em] whitespace-nowrap', meta.className, className), children: meta.label }));
}
export function ThreatTypeBadge({ type, className }) {
    return _jsx(Badge, { className: className, tone: "neutral", children: threatTypeLabel(type) });
}
export function PriorityBadge({ priority, className }) {
    return (_jsx("span", { className: cn('inline-flex items-center rounded-[2px] border border-line-3 bg-raised px-1.5 py-[1px] font-mono text-[11px] font-bold uppercase tracking-[0.02em] text-ink-2', className), children: priority.toUpperCase() }));
}
