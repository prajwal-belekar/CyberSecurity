import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
/**
 * Page masthead: title, optional one-line description, status pill and actions.
 * Deliberately plain — no decorative prompt chrome.
 */
export function PageHeader({ title, description, actions, status, className, compact, meta, }) {
    return (_jsxs("header", { className: cn('flex flex-wrap items-start justify-between gap-3', className), children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2.5", children: [_jsx("h1", { className: cn('font-semibold tracking-[-0.01em] text-ink', compact ? 'text-[15px]' : 'text-[17px] sm:text-[19px]'), children: title }), status] }), description ? (_jsx("p", { className: "mt-1 max-w-2xl text-[11.5px] leading-relaxed text-ink-4", children: description })) : null, meta ? _jsx("div", { className: "mt-2 flex flex-wrap items-center gap-x-4 gap-y-1", children: meta }) : null] }), actions ? _jsx("div", { className: "flex flex-wrap items-center gap-1.5", children: actions }) : null] }));
}
