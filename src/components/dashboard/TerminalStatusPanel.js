import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TerminalSquare } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { TerminalBlock } from '@/components/ui/Terminal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { useLive } from '@/store/LiveContext';
import { formatNumber } from '@/utils/formatting';
/**
 * Read-only status console on the dashboard. Mirrors `system status` output —
 * visual terminal styling only, no command execution.
 */
export function TerminalStatusPanel() {
    const { data, isLoading } = useSystemHealth();
    const { metrics, connected } = useLive();
    const rows = data?.subsystems ?? [];
    return (_jsx(Panel, { title: "System Console", icon: _jsx(TerminalSquare, { className: "size-3.5", "aria-hidden": true }), noPadding: true, className: "min-w-0", children: _jsx("div", { className: "p-2.5", children: isLoading ? (_jsx(Skeleton, { className: "h-[168px] w-full" })) : (_jsxs(TerminalBlock, { title: "SYSTEM STATUS", maxHeight: 188, showCaret: true, bodyClassName: "text-[11px]", children: [_jsx("div", { className: "text-ink-3", children: "> system status" }), _jsx("div", { className: "my-1 h-px bg-line", "aria-hidden": true }), rows.map((row) => (_jsxs("div", { className: "flex items-baseline gap-2", children: [_jsx("span", { className: "shrink-0 text-ink-2", children: row.name }), _jsx("span", { className: "h-px min-w-4 flex-1 bg-line", "aria-hidden": true }), _jsx("span", { className: row.state === 'online' ? 'text-term'
                                    : row.state === 'ready' ? 'text-cyber'
                                        : row.state === 'degraded' ? 'text-medium' : 'text-critical', children: row.state.toUpperCase() })] }, row.id))), _jsx("div", { className: "my-1 h-px bg-line", "aria-hidden": true }), _jsxs("div", { className: "text-ink-4", children: ["CPU ", _jsxs("span", { className: "text-ink-2", children: [metrics.cpu, "%"] }), " \u00B7 MEM ", _jsxs("span", { className: "text-ink-2", children: [metrics.mem, "%"] }), " \u00B7 NET", ' ', _jsxs("span", { className: "text-ink-2", children: [metrics.netMbps, " MB/s"] }), " \u00B7 EVENTS ", _jsx("span", { className: "text-ink-2", children: formatNumber(metrics.totalEvents) })] }), _jsx("div", { className: connected ? 'text-term' : 'text-medium', children: connected ? '[✓] Event stream connected' : '[!] Event stream paused' })] })) }) }));
}
