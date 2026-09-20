import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
/** Fade + scale modal for confirmations and forms. */
export function Modal({ open, onClose, title, description, children, footer, width = 'max-w-lg', tone = 'default' }) {
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e) => { if (e.key === 'Escape')
            onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);
    return (_jsx(AnimatePresence, { children: open ? (_jsxs("div", { className: "fixed inset-0 z-[90] flex items-center justify-center p-4", role: "presentation", children: [_jsx(motion.div, { className: "absolute inset-0 bg-black/65", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.14 }, onClick: onClose, "aria-hidden": true }), _jsxs(motion.div, { role: "dialog", "aria-modal": "true", "aria-label": typeof title === 'string' ? title : 'Dialog', className: cn('panel relative flex w-full flex-col overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.85)]', width, tone === 'danger' && 'border-critical/45'), initial: { opacity: 0, scale: 0.97, y: 6 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.97, y: 6 }, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] }, children: [_jsxs("header", { className: cn('flex items-start gap-3 border-b px-3 py-2.5', tone === 'danger' ? 'border-critical/25 bg-critical/5' : 'border-line bg-panel-2'), children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("h2", { className: "text-[13px] font-semibold text-ink", children: title }), description ? _jsx("p", { className: "mt-1 text-[11px] leading-relaxed text-ink-4", children: description }) : null] }), _jsx("button", { type: "button", onClick: onClose, "aria-label": "Close dialog", className: "shrink-0 rounded-[2px] p-1 text-ink-3 transition-colors hover:bg-raised hover:text-ink", children: _jsx(X, { className: "size-4", "aria-hidden": true }) })] }), _jsx("div", { className: "min-h-0 flex-1 overflow-y-auto p-3", children: children }), footer ? (_jsx("footer", { className: "flex flex-wrap items-center justify-end gap-2 border-t border-line bg-base px-3 py-2", children: footer })) : null] })] })) : null }));
}
/** Small confirm dialog — used before irreversible mock actions. */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'default', loading, }) {
    return (_jsx(Modal, { open: open, onClose: onClose, title: title, tone: tone, width: "max-w-md", footer: _jsxs(_Fragment, { children: [_jsx("button", { type: "button", onClick: onClose, className: "h-7 rounded-[2px] border border-line-2 bg-raised px-2.5 font-mono text-[11px] font-semibold tracking-[0.01em] text-ink-2 uppercase transition-colors hover:border-line-3 hover:text-ink", children: cancelLabel }), _jsx("button", { type: "button", onClick: onConfirm, disabled: loading, className: cn('h-7 rounded-[2px] border px-2.5 font-mono text-[11px] font-semibold tracking-[0.01em] uppercase transition-colors disabled:opacity-50', tone === 'danger'
                        ? 'border-critical/50 bg-critical/15 text-critical hover:bg-critical/25'
                        : 'border-term/45 bg-term/12 text-term hover:bg-term/20'), children: loading ? 'Working…' : confirmLabel })] }), children: _jsx("div", { className: "text-xs leading-relaxed text-ink-2", children: message }) }));
}
