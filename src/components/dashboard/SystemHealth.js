import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { HeartPulse } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { cn } from '@/utils/cn';
import { formatRelative } from '@/utils/dates';
import { Tooltip } from '@/components/ui/Tooltip';
const STATE_TONE = {
    online: 'text-term', ready: 'text-cyber', degraded: 'text-medium', offline: 'text-critical',
};
const STATE_DOT = {
    online: 'bg-term', ready: 'bg-cyber', degraded: 'bg-medium', offline: 'bg-critical',
};
/** Subsystem health grid — every monitored engine with state and latency. */
export function SystemHealth() {
    const { data, isLoading, isError, error, refetch } = useSystemHealth();
    return (_jsx(Panel, { title: "System Health", icon: _jsx(HeartPulse, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", noPadding: true, actions: data ? (_jsx("span", { className: cn('mono text-[11px] font-semibold tracking-[0.01em] uppercase', STATE_TONE[data.overall] ?? 'text-term'), children: data.overall })) : null, children: isLoading ? (_jsx("div", { className: "space-y-1.5 p-2.5", children: Array.from({ length: 6 }).map((_, i) => _jsx(Skeleton, { className: "h-5 w-full" }, i)) })) : isError ? (_jsx(ErrorState, { title: "Unable to load system health", message: error.message, onRetry: () => refetch(), compact: true })) : (_jsxs(_Fragment, { children: [_jsx("ul", { className: "divide-y divide-line", children: data.subsystems.map((subsystem) => (_jsxs("li", { className: "flex items-center gap-2 px-2.5 py-1.5", children: [_jsx(Tooltip, { content: subsystem.detail, label: subsystem.name, children: _jsx("span", { className: cn('size-1.5 shrink-0 rounded-full', STATE_DOT[subsystem.state] ?? 'bg-ink-4'), "aria-hidden": true }) }), _jsx("span", { className: "mono min-w-0 flex-1 truncate text-[10.5px] font-semibold tracking-[0.01em] text-ink-2 uppercase", children: subsystem.name }), _jsx("span", { className: "mono hidden max-w-[45%] truncate text-[11px] text-ink-4 lg:inline", children: subsystem.detail }), _jsxs("span", { className: cn('mono tnum shrink-0 text-[11px]', subsystem.latencyMs > 100 ? 'text-medium' : 'text-ink-4'), children: [subsystem.latencyMs, "ms"] }), _jsx("span", { className: cn('mono w-16 shrink-0 text-right text-[11px] font-bold tracking-[0.01em] uppercase', STATE_TONE[subsystem.state] ?? 'text-ink-3'), children: subsystem.state })] }, subsystem.id))) }), _jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line bg-base px-2.5 py-1.5", children: [_jsxs("span", { className: "mono text-[11px] text-ink-4", children: ["ENGINE ", _jsx("span", { className: "text-ink-2", children: data.engineVersion })] }), _jsxs("span", { className: "mono text-[11px] text-ink-4", children: ["RULESET ", _jsx("span", { className: "text-ink-2", children: data.rulesetVersion })] }), _jsxs("span", { className: "mono text-[11px] text-ink-4", children: ["SYNC ", _jsx("span", { className: "text-ink-2", children: formatRelative(data.lastRuleSync) })] }), _jsxs("span", { className: "mono text-[11px] text-ink-4", children: ["DB ", _jsx("span", { className: cn(data.database.status === 'connected' ? 'text-term' : 'text-medium'), children: data.database.status.toUpperCase() })] })] })] })) }));
}
