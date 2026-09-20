import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle, RotateCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';
/** Professional, actionable failure state. */
export function ErrorState({ title = 'Unable to load data', message, hint, onRetry, retrying, action, className, compact, }) {
    return (_jsxs("div", { role: "alert", className: cn('flex flex-col items-center justify-center border border-critical/25 bg-critical/[0.04] text-center', compact ? 'gap-2 px-3 py-5' : 'gap-3 px-6 py-10', className), children: [_jsx("div", { className: "flex size-9 items-center justify-center rounded-[2px] border border-critical/35 bg-critical/10 text-critical", children: _jsx(AlertTriangle, { className: "size-4.5", "aria-hidden": true }) }), _jsxs("div", { className: "max-w-md", children: [_jsx("p", { className: "font-mono text-[11.5px] font-semibold tracking-[0.01em] text-critical uppercase", children: title }), _jsx("p", { className: cn('mt-1.5 leading-relaxed text-ink-2', compact ? 'text-[11px]' : 'text-xs'), children: message }), hint ? _jsx("p", { className: "mono mt-2 text-[10.5px] leading-relaxed text-ink-4", children: hint }) : null] }), onRetry || action ? (_jsxs("div", { className: "flex flex-wrap items-center justify-center gap-1.5", children: [onRetry ? (_jsx(Button, { variant: "danger", size: "sm", icon: _jsx(RotateCw, { className: "size-3.5", "aria-hidden": true }), onClick: onRetry, loading: retrying, children: "Retry" })) : null, action] })) : null] }));
}
