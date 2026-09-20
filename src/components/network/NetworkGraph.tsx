import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { NetworkLink, NetworkNode, NodeStatus } from '@/types/network';
import { severityMeta } from '@/utils/severity';
import { CopyButton } from '@/components/ui/CopyButton';
import { KeyValueGrid, SectionRule } from '@/components/ui/KeyValue';
import { Badge } from '@/components/ui/Badge';
import { formatBytes } from '@/utils/formatting';

const STATUS_COLOR: Record<NodeStatus, string> = {
  active: '#3fb37f',
  idle: '#4a9ec4',
  suspicious: '#d0a94f',
  threat: '#de6375',
  offline: '#828d9a',
};

const KIND_GLYPH: Record<string, string> = {
  internet: '◍', gateway: '▣', firewall: '▤', server: '▦',
  workstation: '▢', database: '▥', iot: '◈', external: '◇',
};

export interface NetworkGraphProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  selectedId?: string | null;
  onSelect?: (node: NetworkNode) => void;
  /** Compact variant for the dashboard tile: labels hidden on small nodes. */
  compact?: boolean;
  height?: number;
  className?: string;
}

/**
 * SVG topology canvas. Normalised node positions keep the layout responsive;
 * suspicious links carry an animated dash so lateral movement is visible at a
 * glance without any decorative noise.
 */
export function NetworkGraph({
  nodes, links, selectedId, onSelect, compact, height = 420, className,
}: NetworkGraphProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const W = 100;
  const H = 100;

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const linkPaths = useMemo(() => links.map((link) => {
    const from = nodeById.get(link.from);
    const to = nodeById.get(link.to);
    if (!from || !to) return null;
    return {
      link,
      x1: from.position.x * W,
      y1: from.position.y * H,
      x2: to.position.x * W,
      y2: to.position.y * H,
    };
  }).filter(Boolean) as Array<{ link: NetworkLink; x1: number; y1: number; x2: number; y2: number }>, [links, nodeById]);

  return (
    <div className={cn('relative min-w-0 overflow-hidden rounded-[2px] border border-line bg-void', className)}>
      {/* faint technical backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(74,158,196,0.05), transparent 70%)' }}
        aria-hidden
      />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="relative block w-full"
        style={{ height }}
        role="img"
        aria-label="Network topology map"
      >
        <defs>
          <marker id="arrow" markerWidth="3" markerHeight="3" refX="2.4" refY="1.5" orient="auto">
            <path d="M0,0 L3,1.5 L0,3 z" style={{ fill: 'var(--color-line-3)' }} />
          </marker>
        </defs>

        {/* links */}
        <g>
          {linkPaths.map(({ link, x1, y1, x2, y2 }) => {
            const involved = hovered === link.from || hovered === link.to || selectedId === link.from || selectedId === link.to;
            const stroke = link.blocked ? '#de6375' : link.suspicious ? '#d0a94f' : involved ? '#4a9ec4' : '#2b343e';
            return (
              <g key={link.id}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={stroke}
                  strokeWidth={involved ? 0.5 : 0.32}
                  strokeDasharray={link.suspicious || link.blocked ? '1.6 1.2' : undefined}
                  markerEnd="url(#arrow)"
                  opacity={involved ? 1 : 0.75}
                />
                {link.suspicious || link.blocked ? (
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={stroke}
                    strokeWidth={0.55}
                    strokeDasharray="2 8"
                    opacity={0.9}
                  >
                    <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.6s" repeatCount="indefinite" />
                  </line>
                ) : null}
              </g>
            );
          })}
        </g>

        {/* nodes */}
        <g>
          {nodes.map((node) => {
            const color = STATUS_COLOR[node.status];
            const x = node.position.x * W;
            const y = node.position.y * H;
            const isSelected = selectedId === node.id;
            const isHovered = hovered === node.id;
            const r = node.kind === 'internet' ? 2.6 : node.kind === 'gateway' || node.kind === 'firewall' ? 2.3 : 1.9;
            return (
              <g
                key={node.id}
                transform={`translate(${x} ${y})`}
                className="cursor-pointer"
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect?.(node)}
                role="button"
                tabIndex={0}
                aria-label={`${node.name}, ${node.ip}, status ${node.status}, risk ${node.risk}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(node); } }}
              >
                {(node.status === 'threat' || node.status === 'suspicious') && !compact ? (
                  <circle r={r + 2.4} fill="none" stroke={color} strokeWidth={0.22} opacity={0.5}>
                    <animate attributeName="r" values={`${r + 1.2};${r + 3.4};${r + 1.2}`} dur="2.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.55;0.05;0.55" dur="2.6s" repeatCount="indefinite" />
                  </circle>
                ) : null}
                {isSelected ? (
                  <rect x={-r - 1.6} y={-r - 1.6} width={(r + 1.6) * 2} height={(r + 1.6) * 2} fill="none" strokeWidth={0.28} strokeDasharray="1 0.8" style={{ stroke: 'var(--color-term)' }} />
                ) : null}
                <rect x={-r} y={-r} width={r * 2} height={r * 2} stroke={color} strokeWidth={isHovered || isSelected ? 0.5 : 0.34} style={{ fill: 'var(--color-base)' }} />
                <text x={0} y={0.85} textAnchor="middle" fontSize={r * 0.95} fill={color} style={{ fontFamily: 'var(--font-mono)' }}>
                  {KIND_GLYPH[node.kind] ?? '▢'}
                </text>
                {!compact ? (
                  <>
                    <text x={0} y={r + 2.6} textAnchor="middle" fontSize={1.85} fill={isHovered || isSelected ? '#e6ebf1' : '#aeb9c6'} style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                      {node.name}
                    </text>
                    <text x={0} y={r + 4.7} textAnchor="middle" fontSize={1.5} style={{ fontFamily: 'var(--font-mono)', fill: 'var(--color-ink-3)' }}>
                      {node.ip}
                    </text>
                  </>
                ) : (
                  <text x={0} y={r + 2.4} textAnchor="middle" fontSize={1.6} style={{ fontFamily: 'var(--font-mono)', fill: 'var(--color-ink-2)' }}>
                    {node.name.split('-')[0]}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* legend */}
      <div className="pointer-events-none absolute bottom-1.5 left-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        {(['active', 'idle', 'suspicious', 'threat'] as NodeStatus[]).map((status) => (
          <span key={status} className="mono flex items-center gap-1 text-[10.5px] tracking-[0.01em] text-ink-4 uppercase">
            <span className="size-1.5 rounded-[1px]" style={{ background: STATUS_COLOR[status] }} aria-hidden />
            {status}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute top-1.5 right-2 mono text-[10.5px] tracking-[0.02em] text-ink-4 uppercase">
        {nodes.length} NODES · {links.length} LINKS
      </div>
    </div>
  );
}

/** Node inspector shown beside the canvas when a node is selected. */
export function NodeInspector({ node, className, onClose }: { node: NetworkNode | null; className?: string; onClose?: () => void }) {
  if (!node) {
    return (
      <div className={cn('panel flex flex-col items-center justify-center gap-2 p-4 text-center', className)}>
        <p className="text-[11px] text-ink-3">Select a node</p>
        <p className="max-w-[220px] text-[10.5px] leading-relaxed text-ink-4">
          Choose a host on the topology map to inspect its addresses, open ports, traffic and risk rating.
        </p>
      </div>
    );
  }

  const meta = severityMeta(node.risk);
  const color = STATUS_COLOR[node.status];

  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn('panel min-w-0 overflow-hidden', className)}
    >
      <div className="flex items-center gap-2 border-b border-line bg-base px-2.5 py-1.5">
        <span className="text-[11px] font-semibold tracking-[0.02em] text-ink-3">Node information</span>
        <span className="flex-1" />
        <span className="size-1.5 rounded-full" style={{ background: color }} aria-hidden />
        <span className="mono text-[11px] font-semibold tracking-[0.01em] uppercase" style={{ color }}>
          {node.status}
        </span>
        {onClose ? (
          <button type="button" onClick={onClose} aria-label="Clear node selection" className="mono ml-1 text-[11px] text-ink-4 hover:text-ink">
            ✕
          </button>
        ) : null}
      </div>

      <div className="p-2.5">
        <div className="mb-2 flex items-baseline gap-2">
          <h3 className="mono truncate text-[13px] font-bold tracking-[0.01em] text-ink uppercase">{node.name}</h3>
          <Badge tone={node.risk === 'critical' || node.risk === 'high' ? 'err' : node.risk === 'medium' ? 'warn' : 'term'}>
            {meta.glyph} RISK {meta.label}
          </Badge>
        </div>

        <KeyValueGrid
          columns={1}
          rows={[
            { label: 'IP', value: node.ip, copy: node.ip },
            ...(node.mac ? [{ label: 'MAC', value: node.mac, copy: node.mac }] : []),
            ...(node.os ? [{ label: 'OS', value: node.os }] : []),
            { label: 'Type', value: node.kind.replace('_', ' ') },
            { label: 'Ports', value: node.openPorts.length ? node.openPorts.join(' · ') : 'none observed' },
            ...(node.protocol ? [{ label: 'Protocol', value: node.protocol }] : []),
            { label: 'In / Out', value: `${formatBytes(node.bytesIn ?? 0)} / ${formatBytes(node.bytesOut ?? 0)}` },
          ]}
        />

        {node.notes ? (
          <div className="mt-2">
            <SectionRule className="mb-1">Notes</SectionRule>
            <p className="mono text-[10.5px] leading-relaxed text-ink-3">{node.notes}</p>
          </div>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="label-xs">Copy</span>
          <CopyButton value={node.ip} withValue label={`Copy ${node.name} address`} />
        </div>
      </div>
    </motion.div>
  );
}
