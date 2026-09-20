import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
const ACCENTS = {
    critical: 'border-critical/45',
    high: 'border-high/40',
    term: 'border-term/35',
    cyber: 'border-cyber/35',
    ai: 'border-ai/35',
    none: '',
};
export function Panel({ className, title, icon, actions, accent = 'none', bodyClassName, noPadding, children, ...props }) {
    return (_jsxs("section", { className: cn('panel flex min-w-0 flex-col', ACCENTS[accent], className), ...props, children: [title ? (_jsxs("header", { className: "panel-title shrink-0", children: [icon ? _jsx("span", { className: "text-ink-3", "aria-hidden": true, children: icon }) : null, _jsx("h2", { className: "min-w-0 flex-1 truncate text-ink-2", children: title }), actions ? _jsx("div", { className: "flex shrink-0 items-center gap-1.5", children: actions }) : null] })) : null, _jsx("div", { className: cn('min-w-0 flex-1', !noPadding && 'p-3', bodyClassName), children: children })] }));
}
export function PanelHeader({ className, children, ...props }) {
    return _jsx("div", { className: cn('panel-title', className), ...props, children: children });
}
export function PanelFooter({ className, children, ...props }) {
    return (_jsx("div", { className: cn('flex items-center gap-2 border-t border-line bg-base px-3 py-1.5', className), ...props, children: children }));
}
/** Backwards-compatible alias: the spec calls for a `Card` primitive. */
export const Card = Panel;
