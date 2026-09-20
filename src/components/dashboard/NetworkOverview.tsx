import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Network as NetworkIcon } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { NetworkGraph, NodeInspector } from '@/components/network/NetworkGraph';
import { useNetworkSummary, useNetworkTopology } from '@/hooks/useNetworkEvents';
import { formatNumber } from '@/utils/formatting';
import type { NetworkNode } from '@/types/network';

/** Dashboard topology tile: compact map + the four connection counters. */
export function NetworkOverview() {
  const navigate = useNavigate();
  const topology = useNetworkTopology();
  const summary = useNetworkSummary();
  const [selected, setSelected] = useState<NetworkNode | null>(null);

  const stats = summary.data;

  return (
    <Panel
      title="Network Overview"
      icon={<NetworkIcon className="size-3.5" aria-hidden />}
      className="min-w-0"
      noPadding
      actions={
        <button
          type="button"
          onClick={() => navigate('/network')}
          className="inline-flex items-center gap-1 text-[11px] tracking-[0.01em] text-ink-3 transition-colors hover:text-term"
        >
          Full monitor <ArrowUpRight className="size-3" aria-hidden />
        </button>
      }
    >
      <div className="grid grid-cols-2 divide-line border-b border-line sm:grid-cols-4 sm:divide-x">
        {[
          { label: 'DEVICES', value: stats?.connectedDevices, tone: 'text-ink' },
          { label: 'ACTIVE CONN', value: stats?.activeConnections, tone: 'text-cyber' },
          { label: 'SUSPICIOUS', value: stats?.suspiciousConnections, tone: 'text-medium' },
          { label: 'BLOCKED', value: stats?.blockedConnections, tone: 'text-critical' },
        ].map((cell) => (
          <div key={cell.label} className="min-w-0 border-b border-line px-2.5 py-1.5 last:border-b-0 sm:border-b-0">
            <div className="label-xs truncate">{cell.label}</div>
            {summary.isLoading ? (
              <Skeleton className="mt-1 h-4 w-10" />
            ) : (
              <div className={`mono tnum mt-0.5 text-[15px] leading-none font-semibold ${cell.tone}`}>
                {formatNumber(cell.value ?? 0)}
              </div>
            )}
          </div>
        ))}
      </div>

      {topology.isError ? (
        <ErrorState title="Unable to load topology" message={(topology.error as Error).message} onRetry={() => topology.refetch()} compact />
      ) : topology.isLoading ? (
        <div className="p-2.5"><Skeleton className="h-[240px] w-full" /></div>
      ) : (
        <div className="p-2.5">
          <NetworkGraph
            nodes={topology.data!.nodes}
            links={topology.data!.links}
            selectedId={selected?.id}
            onSelect={setSelected}
            height={248}
          />
          {selected ? <NodeInspector node={selected} className="mt-2" onClose={() => setSelected(null)} /> : null}
        </div>
      )}
    </Panel>
  );
}
