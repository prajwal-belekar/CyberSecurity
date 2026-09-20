import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
export function Skeleton({ className }) {
    return (_jsx("div", { "aria-hidden": true, className: cn('relative overflow-hidden rounded-[2px] bg-raised', className), children: _jsx("div", { className: "absolute inset-0 -translate-x-full animate-sweep bg-gradient-to-r from-transparent via-white/[0.045] to-transparent" }) }));
}
/**
 * Skeleton loaders. The spec forbids one giant app spinner — every
 * API-dependent surface ships a structural placeholder shaped like its content.
 */
export function SkeletonText({ lines = 3, className }) {
    return (_jsx("div", { className: cn('space-y-1.5', className), role: "status", "aria-label": "Loading", children: Array.from({ length: lines }).map((_, i) => (_jsx(Skeleton, { className: cn('h-2.5', i === lines - 1 ? 'w-2/3' : 'w-full') }, i))) }));
}
export function SkeletonTable({ rows = 6, cols = 5 }) {
    return (_jsxs("div", { role: "status", "aria-label": "Loading table", className: "space-y-0", children: [_jsx("div", { className: "flex gap-3 border-b border-line-2 bg-base px-2.5 py-2", children: Array.from({ length: cols }).map((_, i) => (_jsx(Skeleton, { className: "h-2 flex-1" }, i))) }), Array.from({ length: rows }).map((_, r) => (_jsx("div", { className: "flex gap-3 border-b border-line px-2.5 py-2.5", children: Array.from({ length: cols }).map((_, c) => (_jsx(Skeleton, { className: cn('h-2.5 flex-1', c === 0 && 'max-w-16') }, c))) }, r)))] }));
}
export function SkeletonStat({ count = 4 }) {
    return (_jsx("div", { className: "grid gap-2", style: { gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }, role: "status", "aria-label": "Loading statistics", children: Array.from({ length: count }).map((_, i) => (_jsxs("div", { className: "panel p-3", children: [_jsx(Skeleton, { className: "mb-2 h-2 w-20" }), _jsx(Skeleton, { className: "h-7 w-14" }), _jsx(Skeleton, { className: "mt-2 h-2 w-24" })] }, i))) }));
}
export function SkeletonChart({ height = 220, bars = 28 }) {
    return (_jsx("div", { role: "status", "aria-label": "Loading chart", className: "flex items-end gap-1.5", style: { height }, children: Array.from({ length: bars }).map((_, i) => (_jsx("div", { className: "flex-1", style: { height: `${28 + ((i * 37) % 62)}%` }, children: _jsx(Skeleton, { className: "h-full w-full" }) }, i))) }));
}
