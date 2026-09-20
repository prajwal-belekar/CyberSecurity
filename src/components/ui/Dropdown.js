import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
/** Keyboard-accessible menu (Arrow keys, Enter, Escape, Home/End). */
export function Dropdown({ trigger, items, align = 'right', width = 'w-56', header, footer, label }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    const listId = useId();
    useEffect(() => {
        if (!open)
            return;
        const onPointer = (e) => {
            if (!containerRef.current?.contains(e.target))
                setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setOpen(false);
                buttonRef.current?.focus();
            }
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const nodes = Array.from(containerRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])') ?? []);
                if (!nodes.length)
                    return;
                const current = nodes.indexOf(document.activeElement);
                const next = e.key === 'ArrowDown'
                    ? (current + 1) % nodes.length
                    : (current - 1 + nodes.length) % nodes.length;
                nodes[next]?.focus();
            }
            if (e.key === 'Home') {
                e.preventDefault();
                containerRef.current?.querySelector('[role="menuitem"]')?.focus();
            }
            if (e.key === 'End') {
                e.preventDefault();
                const nodes = containerRef.current?.querySelectorAll('[role="menuitem"]');
                nodes?.[nodes.length - 1]?.focus();
            }
        };
        document.addEventListener('mousedown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);
    return (_jsxs("div", { ref: containerRef, className: "relative inline-flex", children: [trigger({ open, toggle: () => setOpen((v) => !v), ref: buttonRef }), open ? (_jsxs("div", { role: "menu", id: listId, "aria-label": label, className: cn('panel absolute top-full z-[70] mt-1 overflow-hidden bg-base shadow-[0_16px_44px_rgba(0,0,0,0.8)]', align === 'right' ? 'right-0' : 'left-0', width), children: [header ? _jsx("div", { className: "border-b border-line px-2.5 py-1.5", children: header }) : null, _jsx("div", { className: "max-h-[60vh] overflow-y-auto py-1", children: items.map((item) => item.separator ? (_jsx("div", { className: "my-1 h-px bg-line", role: "separator" }, item.id)) : (_jsxs("button", { role: "menuitem", type: "button", disabled: item.disabled, onClick: () => { item.onSelect?.(); setOpen(false); }, className: cn('flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11.5px] transition-colors', 'focus:bg-raised focus:outline-none disabled:cursor-not-allowed disabled:opacity-40', item.danger ? 'text-critical hover:bg-critical/10' : 'text-ink-2 hover:bg-raised hover:text-ink'), children: [item.icon ? _jsx("span", { className: "shrink-0 text-ink-4", "aria-hidden": true, children: item.icon }) : null, _jsx("span", { className: "min-w-0 flex-1 truncate", children: item.label }), item.hint ? _jsx("span", { className: "mono shrink-0 text-[11px] text-ink-4", children: item.hint }) : null] }, item.id))) }), footer ? _jsx("div", { className: "border-t border-line px-2.5 py-1.5", children: footer }) : null] })) : null] }));
}
