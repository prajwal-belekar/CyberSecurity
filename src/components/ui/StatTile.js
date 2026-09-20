import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
import { formatDelta } from '@/utils/formatting';
import { Skeleton } from './Skeleton';
import { Tooltip } from './Tooltip';
const TONES = {
    critical: { text: 'text-critical', bar: 'bg-critical', icon: 'text-critical' },
    high: { text: 'text-high', bar: 'bg-high', icon: 'text-high' },
    medium: { text: 'text-medium', bar: 'bg-medium', icon: 'text-medium' },
    term: { text: 'text-term', bar: 'bg-term', icon: 'text-term' },
    cyber: { text: 'text-cyber', bar: 'bg-cyber', icon: 'text-cyber' },
    ai: { text: 'text-ai', bar: 'bg-ai', icon: 'text-ai' },
    neutral: { text: 'text-ink', bar: 'bg-ink-3', icon: 'text-ink-3' },
};
/**
 * Security summary tile: icon, large numeric readout, label, trend and one line
 * of context. Sharp, flat and dense — the dashboard's primary instrument.
 */
export function StatTile({ label, value, icon, trend, description, tone = 'neutral', loading, onClick, href, className, padded, footer, }) {
    const t = TONES[tone];
    const display = padded && typeof value === 'number' ? String(value).padStart(2, '0') : value;
    if (loading) {
        return (_jsxs("div", { className: cn('panel p-3', className), children: [_jsx(Skeleton, { className: "mb-2.5 h-2 w-20" }), _jsx(Skeleton, { className: "h-8 w-16" }), _jsx(Skeleton, { className: "mt-2.5 h-2 w-24" })] }));
    }
    const content = (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("span", { className: "label-xs truncate", children: label }), icon ? (_jsx(Tooltip, { content: label, children: _jsx("span", { className: cn('shrink-0', t.icon), "aria-hidden": true, children: icon }) })) : null] }), _jsxs("div", { className: "mt-1.5 flex items-end gap-2", children: [_jsx("span", { className: cn('mono tnum text-[26px] leading-none font-semibold tracking-tight', t.text), children: display }), trend ? (_jsx("span", { className: cn('mono tnum mb-0.5 text-[11px] font-semibold', trend.delta > 0 ? 'text-critical' : trend.delta < 0 ? 'text-term' : 'text-ink-4'), children: formatDelta(trend.delta) })) : null] }), description ? (_jsx("p", { className: "mt-1.5 text-[10.5px] leading-snug text-ink-4", children: description })) : null, footer ? _jsx("div", { className: "mt-2", children: footer }) : null, _jsx("span", { className: cn('absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100', t.bar), "aria-hidden": true })] }));
    const base = cn('panel group relative overflow-hidden p-3 transition-colors duration-200', onClick && 'cursor-pointer hover:border-line-3 hover:bg-panel-2 focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-term', className);
    if (onClick) {
        return _jsx("button", { type: "button", onClick: onClick, className: cn(base, 'text-left'), children: content });
    }
    if (href) {
        return _jsx("a", { href: href, className: base, children: content });
    }
    return _jsx("div", { className: base, children: content });
}
