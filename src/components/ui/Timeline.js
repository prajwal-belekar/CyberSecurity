import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
const DOT = {
    critical: 'bg-critical border-critical/50',
    high: 'bg-high border-high/50',
    medium: 'bg-medium border-medium/50',
    term: 'bg-term border-term/50',
    cyber: 'bg-cyber border-cyber/50',
    ai: 'bg-ai border-ai/50',
    neutral: 'bg-ink-4 border-line-3',
};
const TEXT = {
    critical: 'text-critical', high: 'text-high', medium: 'text-medium',
    term: 'text-term', cyber: 'text-cyber', ai: 'text-ai', neutral: 'text-ink-2',
};
/**
 * Forensic timeline — chronological, monospace-stamped, with a rail that makes
 * the escalation order obvious at a glance.
 */
export function Timeline({ items, className, dense }) {
    if (!items.length) {
        return _jsx("p", { className: "mono px-1 py-3 text-[11px] text-ink-4", children: "No timeline entries recorded." });
    }
    return (_jsxs("ol", { className: cn('relative min-w-0', className), children: [_jsx("span", { className: "absolute top-1 bottom-1 left-[52px] w-px bg-line", "aria-hidden": true }), items.map((item) => {
                const tone = item.tone ?? 'neutral';
                return (_jsxs("li", { className: cn('relative flex gap-3', dense ? 'py-1' : 'py-1.5'), children: [_jsx("span", { className: "mono tnum w-11 shrink-0 pt-[3px] text-right text-[10.5px] text-ink-4", children: item.time }), _jsx("span", { className: "relative z-10 mt-[6px] flex size-2.5 shrink-0 items-center justify-center", children: _jsx("span", { className: cn('size-2 rounded-full border', DOT[tone]), "aria-hidden": true }) }), _jsxs("div", { className: "min-w-0 flex-1 pb-1", children: [_jsxs("div", { className: "flex flex-wrap items-baseline gap-x-2 gap-y-0.5", children: [_jsx("span", { className: cn('text-[11.5px] font-medium', TEXT[tone]), children: item.title }), item.actor ? (_jsx("span", { className: "mono shrink-0 rounded-[2px] border border-line-2 bg-raised px-1 py-px text-[10.5px] tracking-[0.01em] text-ink-4 uppercase", children: item.actor })) : null] }), item.detail ? (_jsx("p", { className: "mono mt-0.5 text-[10.5px] leading-relaxed break-words text-ink-4", children: item.detail })) : null] })] }, item.id));
            })] }));
}
