import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { severityMeta } from '@/utils/severity';
import { CopyButton } from '@/components/ui/CopyButton';
import { KeyValueGrid, SectionRule } from '@/components/ui/KeyValue';
import { Badge } from '@/components/ui/Badge';
import { formatBytes } from '@/utils/formatting';
const STATUS_COLOR = {
    active: '#3fb37f',
    idle: '#4a9ec4',
    suspicious: '#d0a94f',
    threat: '#de6375',
    offline: '#828d9a',
};
const KIND_GLYPH = {
    internet: '◍', gateway: '▣', firewall: '▤', server: '▦',
    workstation: '▢', database: '▥', iot: '◈', external: '◇',
};
/**
 * SVG topology canvas. Normalised node positions keep the layout responsive;
 * suspicious links carry an animated dash so lateral movement is visible at a
 * glance without any decorative noise.
 */
export function NetworkGraph({ nodes, links, selectedId, onSelect, compact, height = 420, className, }) {
    const [hovered, setHovered] = useState(null);
    const W = 100;
    const H = 100;
    const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
    const linkPaths = useMemo(() => links.map((link) => {
        const from = nodeById.get(link.from);
        const to = nodeById.get(link.to);
        if (!from || !to)
            return null;
        return {
            link,
            x1: from.position.x * W,
            y1: from.position.y * H,
            x2: to.position.x * W,
            y2: to.position.y * H,
        };
    }).filter(Boolean), [links, nodeById]);
    return (_jsxs("div", { className: cn('relative min-w-0 overflow-hidden rounded-[2px] border border-line bg-void', className), children: [_jsx("div", { className: "pointer-events-none absolute inset-0 opacity-[0.55]", style: {
                    backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.022) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                }, "aria-hidden": true }), _jsx("div", { className: "pointer-events-none absolute inset-0", style: { background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(74,158,196,0.05), transparent 70%)' }, "aria-hidden": true }), _jsxs("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid meet", className: "relative block w-full", style: { height }, role: "img", "aria-label": "Network topology map", children: [_jsx("defs", { children: _jsx("marker", { id: "arrow", markerWidth: "3", markerHeight: "3", refX: "2.4", refY: "1.5", orient: "auto", children: _jsx("path", { d: "M0,0 L3,1.5 L0,3 z", style: { fill: 'var(--color-line-3)' } }) }) }), _jsx("g", { children: linkPaths.map(({ link, x1, y1, x2, y2 }) => {
                            const involved = hovered === link.from || hovered === link.to || selectedId === link.from || selectedId === link.to;
                            const stroke = link.blocked ? '#de6375' : link.suspicious ? '#d0a94f' : involved ? '#4a9ec4' : '#2b343e';
                            return (_jsxs("g", { children: [_jsx("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: stroke, strokeWidth: involved ? 0.5 : 0.32, strokeDasharray: link.suspicious || link.blocked ? '1.6 1.2' : undefined, markerEnd: "url(#arrow)", opacity: involved ? 1 : 0.75 }), link.suspicious || link.blocked ? (_jsx("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: stroke, strokeWidth: 0.55, strokeDasharray: "2 8", opacity: 0.9, children: _jsx("animate", { attributeName: "stroke-dashoffset", from: "20", to: "0", dur: "1.6s", repeatCount: "indefinite" }) })) : null] }, link.id));
                        }) }), _jsx("g", { children: nodes.map((node) => {
                            const color = STATUS_COLOR[node.status];
                            const x = node.position.x * W;
                            const y = node.position.y * H;
                            const isSelected = selectedId === node.id;
                            const isHovered = hovered === node.id;
                            const r = node.kind === 'internet' ? 2.6 : node.kind === 'gateway' || node.kind === 'firewall' ? 2.3 : 1.9;
                            return (_jsxs("g", { transform: `translate(${x} ${y})`, className: "cursor-pointer", onMouseEnter: () => setHovered(node.id), onMouseLeave: () => setHovered(null), onClick: () => onSelect?.(node), role: "button", tabIndex: 0, "aria-label": `${node.name}, ${node.ip}, status ${node.status}, risk ${node.risk}`, onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onSelect?.(node);
                                } }, children: [(node.status === 'threat' || node.status === 'suspicious') && !compact ? (_jsxs("circle", { r: r + 2.4, fill: "none", stroke: color, strokeWidth: 0.22, opacity: 0.5, children: [_jsx("animate", { attributeName: "r", values: `${r + 1.2};${r + 3.4};${r + 1.2}`, dur: "2.6s", repeatCount: "indefinite" }), _jsx("animate", { attributeName: "opacity", values: "0.55;0.05;0.55", dur: "2.6s", repeatCount: "indefinite" })] })) : null, isSelected ? (_jsx("rect", { x: -r - 1.6, y: -r - 1.6, width: (r + 1.6) * 2, height: (r + 1.6) * 2, fill: "none", strokeWidth: 0.28, strokeDasharray: "1 0.8", style: { stroke: 'var(--color-term)' } })) : null, _jsx("rect", { x: -r, y: -r, width: r * 2, height: r * 2, stroke: color, strokeWidth: isHovered || isSelected ? 0.5 : 0.34, style: { fill: 'var(--color-base)' } }), _jsx("text", { x: 0, y: 0.85, textAnchor: "middle", fontSize: r * 0.95, fill: color, style: { fontFamily: 'var(--font-mono)' }, children: KIND_GLYPH[node.kind] ?? '▢' }), !compact ? (_jsxs(_Fragment, { children: [_jsx("text", { x: 0, y: r + 2.6, textAnchor: "middle", fontSize: 1.85, fill: isHovered || isSelected ? '#e6ebf1' : '#aeb9c6', style: { fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }, children: node.name }), _jsx("text", { x: 0, y: r + 4.7, textAnchor: "middle", fontSize: 1.5, style: { fontFamily: 'var(--font-mono)', fill: 'var(--color-ink-3)' }, children: node.ip })] })) : (_jsx("text", { x: 0, y: r + 2.4, textAnchor: "middle", fontSize: 1.6, style: { fontFamily: 'var(--font-mono)', fill: 'var(--color-ink-2)' }, children: node.name.split('-')[0] }))] }, node.id));
                        }) })] }), _jsx("div", { className: "pointer-events-none absolute bottom-1.5 left-2 flex flex-wrap items-center gap-x-3 gap-y-1", children: ['active', 'idle', 'suspicious', 'threat'].map((status) => (_jsxs("span", { className: "mono flex items-center gap-1 text-[10.5px] tracking-[0.01em] text-ink-4 uppercase", children: [_jsx("span", { className: "size-1.5 rounded-[1px]", style: { background: STATUS_COLOR[status] }, "aria-hidden": true }), status] }, status))) }), _jsxs("div", { className: "pointer-events-none absolute top-1.5 right-2 mono text-[10.5px] tracking-[0.02em] text-ink-4 uppercase", children: [nodes.length, " NODES \u00B7 ", links.length, " LINKS"] })] }));
}
/** Node inspector shown beside the canvas when a node is selected. */
export function NodeInspector({ node, className, onClose }) {
    if (!node) {
        return (_jsxs("div", { className: cn('panel flex flex-col items-center justify-center gap-2 p-4 text-center', className), children: [_jsx("p", { className: "text-[11px] text-ink-3", children: "Select a node" }), _jsx("p", { className: "max-w-[220px] text-[10.5px] leading-relaxed text-ink-4", children: "Choose a host on the topology map to inspect its addresses, open ports, traffic and risk rating." })] }));
    }
    const meta = severityMeta(node.risk);
    const color = STATUS_COLOR[node.status];
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.18 }, className: cn('panel min-w-0 overflow-hidden', className), children: [_jsxs("div", { className: "flex items-center gap-2 border-b border-line bg-base px-2.5 py-1.5", children: [_jsx("span", { className: "text-[11px] font-semibold tracking-[0.02em] text-ink-3", children: "Node information" }), _jsx("span", { className: "flex-1" }), _jsx("span", { className: "size-1.5 rounded-full", style: { background: color }, "aria-hidden": true }), _jsx("span", { className: "mono text-[11px] font-semibold tracking-[0.01em] uppercase", style: { color }, children: node.status }), onClose ? (_jsx("button", { type: "button", onClick: onClose, "aria-label": "Clear node selection", className: "mono ml-1 text-[11px] text-ink-4 hover:text-ink", children: "\u2715" })) : null] }), _jsxs("div", { className: "p-2.5", children: [_jsxs("div", { className: "mb-2 flex items-baseline gap-2", children: [_jsx("h3", { className: "mono truncate text-[13px] font-bold tracking-[0.01em] text-ink uppercase", children: node.name }), _jsxs(Badge, { tone: node.risk === 'critical' || node.risk === 'high' ? 'err' : node.risk === 'medium' ? 'warn' : 'term', children: [meta.glyph, " RISK ", meta.label] })] }), _jsx(KeyValueGrid, { columns: 1, rows: [
                            { label: 'IP', value: node.ip, copy: node.ip },
                            ...(node.mac ? [{ label: 'MAC', value: node.mac, copy: node.mac }] : []),
                            ...(node.os ? [{ label: 'OS', value: node.os }] : []),
                            { label: 'Type', value: node.kind.replace('_', ' ') },
                            { label: 'Ports', value: node.openPorts.length ? node.openPorts.join(' · ') : 'none observed' },
                            ...(node.protocol ? [{ label: 'Protocol', value: node.protocol }] : []),
                            { label: 'In / Out', value: `${formatBytes(node.bytesIn ?? 0)} / ${formatBytes(node.bytesOut ?? 0)}` },
                        ] }), node.notes ? (_jsxs("div", { className: "mt-2", children: [_jsx(SectionRule, { className: "mb-1", children: "Notes" }), _jsx("p", { className: "mono text-[10.5px] leading-relaxed text-ink-3", children: node.notes })] })) : null, _jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-1.5", children: [_jsx("span", { className: "label-xs", children: "Copy" }), _jsx(CopyButton, { value: node.ip, withValue: true, label: `Copy ${node.name} address` })] })] })] }, node.id));
}
