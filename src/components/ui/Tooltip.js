import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { cn } from '@/utils/cn';
/**
 * Dependency-free tooltip. Hover *and* keyboard-focus both reveal it, and the
 * text is duplicated into aria-label/aria-describedby so screen readers get the
 * same information an icon-only button would otherwise hide.
 */
export function Tooltip({ content, children, side = 'top', className, label }) {
    const [open, setOpen] = useState(false);
    const id = `tip-${Math.random().toString(36).slice(2, 9)}`;
    const position = {
        top: 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
        bottom: 'top-full left-1/2 mt-1.5 -translate-x-1/2',
        left: 'right-full top-1/2 mr-1.5 -translate-y-1/2',
        right: 'left-full top-1/2 ml-1.5 -translate-y-1/2',
    }[side];
    return (_jsxs("span", { className: cn('relative inline-flex', className), onMouseEnter: () => setOpen(true), onMouseLeave: () => setOpen(false), onFocus: () => setOpen(true), onBlur: () => setOpen(false), children: [_jsx("span", { "aria-describedby": open ? id : undefined, "aria-label": label, className: "inline-flex", children: children }), open ? (_jsx("span", { role: "tooltip", id: id, className: cn('pointer-events-none absolute z-50 max-w-[260px] rounded-[2px] border border-line-3 bg-base px-2 py-1', 'font-mono text-[11px] leading-relaxed whitespace-normal text-ink-2 shadow-[0_6px_20px_rgba(0,0,0,0.65)]', position), children: content })) : null] }));
}
/** Icon-only button with a guaranteed accessible label. */
export function IconButton({ label, onClick, children, className, active, disabled, title, }) {
    return (_jsx(Tooltip, { content: title ?? label, label: label, children: _jsx("button", { type: "button", "aria-label": label, title: title ?? label, onClick: onClick, disabled: disabled, className: cn('inline-flex size-7 items-center justify-center rounded-[2px] border transition-colors duration-150', active
                ? 'border-term/45 bg-term/12 text-term'
                : 'border-transparent text-ink-3 hover:border-line-2 hover:bg-raised hover:text-ink', disabled && 'cursor-not-allowed opacity-40', className), children: children }) }));
}
