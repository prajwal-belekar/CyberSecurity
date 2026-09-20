import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Ban, Link2, Radio, ShieldAlert, Waypoints } from 'lucide-react';
import { StatTile } from '@/components/ui/StatTile';
import { Meter } from '@/components/ui/Meter';
import { useNetworkSummary } from '@/hooks/useNetworkEvents';
import { formatNumber } from '@/utils/formatting';
/** Four primary connection counters required at the top of the network monitor. */
export function NetworkOverviewStats() {
    const { data, isLoading } = useNetworkSummary();
    return (_jsxs("div", { className: "grid grid-cols-2 gap-2 xl:grid-cols-4", children: [_jsx(StatTile, { loading: isLoading, label: "Connected Devices", value: data?.connectedDevices ?? 0, icon: _jsx(Waypoints, { className: "size-4", "aria-hidden": true }), tone: "cyber", footer: _jsx(Meter, { value: Math.min(100, ((data?.connectedDevices ?? 0) / 200) * 100), tone: "cyber", showValue: false }) }), _jsx(StatTile, { loading: isLoading, label: "Active Connections", value: data?.activeConnections ?? 0, icon: _jsx(Link2, { className: "size-4", "aria-hidden": true }), tone: "term", trend: { delta: 4.2, period: 'vs 1h ago' }, description: `${data ? (data.inboundMbps + data.outboundMbps).toFixed(1) : '0'} Mbps total throughput`, footer: _jsx(Meter, { value: Math.min(100, ((data?.totalBandwidthMbps ?? 0) / 250) * 100), tone: "term", showValue: false }) }), _jsx(StatTile, { loading: isLoading, label: "Suspicious Connections", value: data?.suspiciousConnections ?? 0, icon: _jsx(ShieldAlert, { className: "size-4", "aria-hidden": true }), tone: "high", trend: { delta: 18, period: 'vs 1h ago' }, footer: _jsx(Meter, { value: Math.min(100, ((data?.suspiciousConnections ?? 0) / 60) * 100), tone: "warn", showValue: false }) }), _jsx(StatTile, { loading: isLoading, label: "Blocked Connections", value: data?.blockedConnections ?? 0, icon: _jsx(Ban, { className: "size-4", "aria-hidden": true }), tone: "critical", description: `${data ? Math.round(((data.blockedConnections / Math.max(1, data.activeConnections + data.blockedConnections)) * 100)) : 0}% of attempted sessions denied`, footer: _jsx(Meter, { value: Math.min(100, ((data?.blockedConnections ?? 0) / 500) * 100), tone: "err", showValue: false }) })] }));
}
/** Bandwidth + protocol posture strip rendered under the topology canvas. */
export function NetworkThroughput() {
    const { data, isLoading } = useNetworkSummary();
    if (isLoading || !data) {
        return (_jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-4", children: Array.from({ length: 4 }).map((_, i) => (_jsxs("div", { className: "panel p-2.5", children: [_jsx("div", { className: "label-xs mb-1.5", children: "Loading" }), _jsx("div", { className: "mono h-4 w-16 animate-pulse rounded-[2px] bg-raised" })] }, i))) }));
    }
    const cells = [
        { label: 'INBOUND', value: `${data.inboundMbps} Mbps`, tone: 'text-cyber', meter: (data.inboundMbps / data.totalBandwidthMbps) * 100, mTone: 'cyber' },
        { label: 'OUTBOUND', value: `${data.outboundMbps} Mbps`, tone: 'text-term', meter: (data.outboundMbps / data.totalBandwidthMbps) * 100, mTone: 'term' },
        { label: 'TOTAL', value: `${data.totalBandwidthMbps} Mbps`, tone: 'text-ink', meter: Math.min(100, (data.totalBandwidthMbps / 250) * 100), mTone: 'neutral' },
        { label: 'DENY RATE', value: `${Math.round((data.blockedConnections / Math.max(1, data.blockedConnections + data.activeConnections)) * 100)}%`, tone: 'text-critical', meter: (data.blockedConnections / Math.max(1, data.blockedConnections + data.activeConnections)) * 100, mTone: 'err' },
    ];
    return (_jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-4", children: cells.map((cell) => (_jsxs("div", { className: "panel p-2.5", children: [_jsx("div", { className: "label-xs", children: cell.label }), _jsx("div", { className: `mono tnum mt-1 text-[16px] leading-none font-semibold ${cell.tone}`, children: cell.value }), _jsx(Meter, { value: cell.meter, tone: cell.mTone, className: "mt-2", showValue: false })] }, cell.label))) }));
}
/** Live session indicator used in the network page header. */
export function NetworkLiveBadge() {
    return (_jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-[2px] border border-cyber/35 bg-cyber/10 px-1.5 py-[1px]", children: [_jsx(Radio, { className: "size-2.5 text-cyber", "aria-hidden": true }), _jsx("span", { className: "text-[11px] text-ink-3", children: "Flow capture active" })] }));
}
export { formatNumber };
