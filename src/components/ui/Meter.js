import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
import { blockMeter } from '@/utils/formatting';
const TONE_BG = {
    term: 'bg-term', cyber: 'bg-cyber', warn: 'bg-medium', err: 'bg-critical',
    ai: 'bg-ai', volt: 'bg-volt', neutral: 'bg-ink-3',
};
const TONE_TEXT = {
    term: 'text-term', cyber: 'text-cyber', warn: 'text-medium', err: 'text-critical',
    ai: 'text-ai', volt: 'text-volt', neutral: 'text-ink-3',
};
/** Compact utilisation / threat-level meter. */
export function Meter({ value, max = 100, tone = 'term', label, suffix = '%', blocks, width = 10, className, showValue = true, }) {
    const percent = Math.max(0, Math.min(100, (value / max) * 100));
    if (blocks) {
        return (_jsxs("span", { className: cn('meter inline-flex items-center gap-1.5', TONE_TEXT[tone], className), children: [label ? _jsx("span", { className: "label-xs text-ink-4", children: label }) : null, _jsx("span", { "aria-hidden": true, children: blockMeter(percent, width) }), showValue ? _jsxs("span", { className: "tnum", children: [Math.round(percent), suffix] }) : null, _jsxs("span", { className: "sr-only", children: [label ? `${label}: ` : '', Math.round(percent), suffix] })] }));
    }
    return (_jsxs("div", { className: cn('min-w-0', className), children: [label ? (_jsxs("div", { className: "mb-1 flex items-baseline justify-between gap-2", children: [_jsx("span", { className: "label-xs truncate", children: label }), showValue ? _jsxs("span", { className: cn('mono tnum text-[10.5px]', TONE_TEXT[tone]), children: [Math.round(percent), suffix] }) : null] })) : null, _jsx("div", { className: "h-1.5 w-full overflow-hidden rounded-[1px] bg-raised", role: "progressbar", "aria-valuenow": Math.round(percent), "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": label ?? 'utilisation', children: _jsx("div", { className: cn('h-full transition-[width] duration-500 ease-out', TONE_BG[tone]), style: { width: `${percent}%` } }) })] }));
}
/** Indeterminate scan bar used by the scanner / analyzer pipelines. */
export function ScanBar({ className, tone = 'cyber' }) {
    return (_jsx("div", { className: cn('relative h-[3px] w-full overflow-hidden rounded-[1px] bg-raised', className), children: _jsx("div", { className: cn('absolute inset-y-0 w-1/3 animate-sweep', TONE_BG[tone], 'opacity-70') }) }));
}
