import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';
import { systemApi } from '@/services/systemApi';
/**
 * Structural placeholder shown while a lazy page chunk loads (spec §34).
 *
 * The visible line is terminal-flavoured loading copy resolved from the
 * service layer, so it names the subsystem actually being fetched
 * ("INITIALIZING THREAT ENGINE") rather than a generic spinner label.
 * The skeleton beneath mirrors the real page rhythm — header, stat row,
 * chart, table — so the layout does not jump when the chunk arrives.
 */
export function RouteFallback() {
    const { pathname } = useLocation();
    const label = systemApi.routeLoadingLabel(pathname);
    return (_jsxs("div", { className: "space-y-3 p-3 sm:p-4", role: "status", children: [_jsxs("p", { className: "mono flex items-center gap-2 text-[11px] text-term", children: [_jsx("span", { className: "tracking-[0.04em] uppercase", children: label }), _jsx("span", { "aria-hidden": true, children: "\u2026" }), _jsx("span", { className: "h-px flex-1 bg-line", "aria-hidden": true })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Skeleton, { className: "h-4 w-52" }), _jsx(Skeleton, { className: "h-4 w-24" })] }), _jsx("div", { className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-4", children: Array.from({ length: 4 }).map((_, i) => (_jsxs("div", { className: "panel p-3", children: [_jsx(Skeleton, { className: "mb-2.5 h-2 w-20" }), _jsx(Skeleton, { className: "h-7 w-16" }), _jsx(Skeleton, { className: "mt-2.5 h-2 w-24" })] }, i))) }), _jsxs("div", { className: "panel p-3", children: [_jsx(Skeleton, { className: "mb-3 h-3 w-40" }), _jsx(Skeleton, { className: "h-56 w-full" })] }), _jsxs("div", { className: "panel p-3", children: [_jsx(Skeleton, { className: "mb-3 h-3 w-48" }), Array.from({ length: 6 }).map((_, i) => (_jsx(Skeleton, { className: "mb-2 h-6 w-full" }, i)))] })] }));
}
