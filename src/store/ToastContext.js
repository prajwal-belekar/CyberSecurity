import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { severityMeta } from '@/utils/severity';
const ToastContext = createContext(null);
const ICONS = {
    critical: _jsx(ShieldAlert, { className: "size-4", "aria-hidden": true }),
    high: _jsx(AlertTriangle, { className: "size-4", "aria-hidden": true }),
    medium: _jsx(AlertTriangle, { className: "size-4", "aria-hidden": true }),
    low: _jsx(Info, { className: "size-4", "aria-hidden": true }),
    info: _jsx(CheckCircle2, { className: "size-4", "aria-hidden": true }),
};
export function ToastProvider({ children, enabled = true }) {
    const [toasts, setToasts] = useState([]);
    const counter = useRef(0);
    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
    const push = useCallback((toast) => {
        if (!enabled)
            return;
        counter.current += 1;
        const id = `toast-${counter.current}-${Date.now()}`;
        const next = { ...toast, id };
        setToasts((prev) => [...prev.slice(-4), next]);
        const duration = toast.durationMs ?? (toast.severity === 'critical' || toast.severity === 'high' ? 7000 : 4200);
        window.setTimeout(() => dismiss(id), duration);
    }, [dismiss, enabled]);
    const value = useMemo(() => ({
        push,
        dismiss,
        success: (title, description) => push({ severity: 'info', title, description }),
        error: (title, description) => push({ severity: 'critical', title, description }),
        info: (title, description) => push({ severity: 'low', title, description }),
        alert: (severity, title, description, href) => push({ severity, title, description, href }),
    }), [push, dismiss]);
    return (_jsxs(ToastContext.Provider, { value: value, children: [children, _jsx("div", { className: "pointer-events-none fixed right-3 bottom-3 z-[120] flex w-[min(360px,calc(100vw-1.5rem))] flex-col gap-1.5", role: "region", "aria-label": "Notifications", children: _jsx(AnimatePresence, { initial: false, children: toasts.map((toast) => {
                        const meta = severityMeta(toast.severity);
                        return (_jsx(motion.div, { layout: true, initial: { opacity: 0, x: 24, scale: 0.98 }, animate: { opacity: 1, x: 0, scale: 1 }, exit: { opacity: 0, x: 24, scale: 0.98 }, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] }, role: "status", "aria-live": toast.severity === 'critical' || toast.severity === 'high' ? 'assertive' : 'polite', className: cn('panel pointer-events-auto overflow-hidden border-l-2 bg-base/98 shadow-[0_14px_40px_rgba(0,0,0,0.75)]'), style: { borderLeftColor: meta.hex }, children: _jsxs("div", { className: "flex items-start gap-2.5 p-2.5", children: [_jsx("span", { className: cn('mt-px shrink-0', meta.text), children: ICONS[toast.severity] }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-baseline gap-2", children: [_jsx("span", { className: cn('mono shrink-0 text-[10.5px] font-bold tracking-[0.02em] uppercase', meta.text), children: meta.label }), _jsx("p", { className: "min-w-0 flex-1 truncate text-[11.5px] font-medium text-ink", children: toast.title })] }), toast.description ? (_jsx("p", { className: "mono mt-1 text-[10.5px] leading-relaxed break-words text-ink-3", children: toast.description })) : null, toast.href ? (_jsx("a", { href: toast.href, onClick: () => dismiss(toast.id), className: "mt-1.5 inline-block text-[11px] tracking-[0.01em] text-term underline-offset-2 hover:underline", children: "Open \u2192" })) : null] }), _jsx("button", { type: "button", onClick: () => dismiss(toast.id), "aria-label": "Dismiss notification", className: "shrink-0 rounded-[2px] p-0.5 text-ink-4 transition-colors hover:bg-raised hover:text-ink", children: _jsx(X, { className: "size-3.5", "aria-hidden": true }) })] }) }, toast.id));
                    }) }) })] }));
}
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx)
        throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
}
