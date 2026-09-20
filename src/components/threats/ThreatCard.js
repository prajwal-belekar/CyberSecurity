import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Meter } from '@/components/ui/Meter';
import { formatRelative } from '@/utils/dates';
import { threatTypeLabel } from '@/utils/severity';
/** Compact threat card — used for board layouts and correlated-threat rails. */
export function ThreatCard({ threat, className, onSelect }) {
    const navigate = useNavigate();
    const accent = threat.severity === 'critical' ? 'border-l-critical'
        : threat.severity === 'high' ? 'border-l-high'
            : threat.severity === 'medium' ? 'border-l-medium' : 'border-l-low';
    return (_jsxs("article", { className: cn('panel group min-w-0 cursor-pointer border-l-2 p-2.5 transition-colors hover:border-line-3 hover:bg-panel-2', accent, className), onClick: () => (onSelect ? onSelect(threat) : navigate(`/threats/${threat.id}`)), onKeyDown: (e) => { if (e.key === 'Enter')
            navigate(`/threats/${threat.id}`); }, tabIndex: 0, role: "button", "aria-label": `Open threat ${threat.id}: ${threat.title}`, children: [_jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [_jsx("span", { className: "mono text-[11px] font-bold tracking-[0.01em] text-term", children: threat.id }), _jsx(SeverityBadge, { severity: threat.severity }), _jsx(StatusBadge, { status: threat.status }), _jsx("span", { className: "flex-1" }), _jsx(ArrowUpRight, { className: "size-3 text-ink-4 opacity-0 transition-opacity group-hover:opacity-100", "aria-hidden": true })] }), _jsx("h3", { className: "mt-1.5 truncate text-[12.5px] font-semibold text-ink", children: threat.title }), _jsxs("p", { className: "mono mt-0.5 truncate text-[11px] text-ink-4", children: [threatTypeLabel(threat.type), " \u00B7 ", threat.source, " \u2192 ", threat.target] }), _jsxs("div", { className: "mt-2 grid grid-cols-2 gap-x-3 gap-y-1", children: [_jsxs("div", { children: [_jsx("div", { className: "label-xs", children: "Confidence" }), _jsx(Meter, { value: threat.confidence * 100, tone: threat.confidence >= 0.8 ? 'term' : threat.confidence >= 0.6 ? 'warn' : 'neutral', className: "mt-0.5" })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "label-xs", children: "Occurrences" }), _jsx("div", { className: "mono tnum mt-0.5 text-[13px] font-semibold text-ink-2", children: threat.occurrences })] })] }), _jsxs("div", { className: "mono mt-1.5 flex items-center justify-between gap-2 border-t border-line pt-1.5 text-[11px] text-ink-4", children: [_jsxs("span", { children: ["FIRST ", formatRelative(threat.firstSeen)] }), _jsxs("span", { children: ["LAST ", formatRelative(threat.lastSeen)] })] })] }));
}
