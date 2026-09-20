import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Network as NetworkIcon } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { NetworkGraph, NodeInspector } from '@/components/network/NetworkGraph';
import { useNetworkSummary, useNetworkTopology } from '@/hooks/useNetworkEvents';
import { formatNumber } from '@/utils/formatting';
/** Dashboard topology tile: compact map + the four connection counters. */
export function NetworkOverview() {
    const navigate = useNavigate();
    const topology = useNetworkTopology();
    const summary = useNetworkSummary();
    const [selected, setSelected] = useState(null);
    const stats = summary.data;
    return (_jsxs(Panel, { title: "Network Overview", icon: _jsx(NetworkIcon, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", noPadding: true, actions: _jsxs("button", { type: "button", onClick: () => navigate('/network'), className: "inline-flex items-center gap-1 text-[11px] tracking-[0.01em] text-ink-3 transition-colors hover:text-term", children: ["Full monitor ", _jsx(ArrowUpRight, { className: "size-3", "aria-hidden": true })] }), children: [_jsx("div", { className: "grid grid-cols-2 divide-line border-b border-line sm:grid-cols-4 sm:divide-x", children: [
                    { label: 'DEVICES', value: stats?.connectedDevices, tone: 'text-ink' },
                    { label: 'ACTIVE CONN', value: stats?.activeConnections, tone: 'text-cyber' },
                    { label: 'SUSPICIOUS', value: stats?.suspiciousConnections, tone: 'text-medium' },
                    { label: 'BLOCKED', value: stats?.blockedConnections, tone: 'text-critical' },
                ].map((cell) => (_jsxs("div", { className: "min-w-0 border-b border-line px-2.5 py-1.5 last:border-b-0 sm:border-b-0", children: [_jsx("div", { className: "label-xs truncate", children: cell.label }), summary.isLoading ? (_jsx(Skeleton, { className: "mt-1 h-4 w-10" })) : (_jsx("div", { className: `mono tnum mt-0.5 text-[15px] leading-none font-semibold ${cell.tone}`, children: formatNumber(cell.value ?? 0) }))] }, cell.label))) }), topology.isError ? (_jsx(ErrorState, { title: "Unable to load topology", message: topology.error.message, onRetry: () => topology.refetch(), compact: true })) : topology.isLoading ? (_jsx("div", { className: "p-2.5", children: _jsx(Skeleton, { className: "h-[240px] w-full" }) })) : (_jsxs("div", { className: "p-2.5", children: [_jsx(NetworkGraph, { nodes: topology.data.nodes, links: topology.data.links, selectedId: selected?.id, onSelect: setSelected, height: 248 }), selected ? _jsx(NodeInspector, { node: selected, className: "mt-2", onClose: () => setSelected(null) }) : null] }))] }));
}
