import { useState } from 'react';
import { Ban, Globe2, Layers, Network as NetworkIcon, Server, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Meter } from '@/components/ui/Meter';
import { Badge } from '@/components/ui/Badge';
import { NetworkGraph, NodeInspector } from '@/components/network/NetworkGraph';
import { NetworkEvents } from '@/components/network/NetworkEvents';
import { NetworkLiveBadge, NetworkOverviewStats, NetworkThroughput } from '@/components/network/NetworkOverview';
import { useNetworkSummary, useNetworkTopology } from '@/hooks/useNetworkEvents';
import type { NetworkNode } from '@/types/network';

/** Network Monitor — topology canvas, throughput posture and flow grid. */
export default function Network() {
  const topology = useNetworkTopology();
  const summary = useNetworkSummary();
  const [selected, setSelected] = useState<NetworkNode | null>(null);
  const meta = routeMetaFor('/network');

  const atRisk = (topology.data?.nodes ?? []).filter((n) => n.status === 'suspicious' || n.status === 'threat');

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={meta.segments} />
      <PageHeader
        title="Network Monitor"
        description="Topology, session posture and flow telemetry."
        status={<NetworkLiveBadge />}
      />

      <NetworkOverviewStats />

      <div className="grid min-w-0 gap-2.5 xl:grid-cols-3">
        <Panel
          title="Topology Map"
          icon={<NetworkIcon className="size-3.5" aria-hidden />}
          className="min-w-0 xl:col-span-2"
          noPadding
          actions={
            topology.data ? (
              <span className="mono text-[11px] tracking-[0.01em] text-ink-4 uppercase">
                {topology.data.nodes.length} HOSTS · {topology.data.links.length} LINKS
              </span>
            ) : undefined
          }
        >
          <div className="p-2.5">
            {topology.isLoading ? (
              <Skeleton className="h-[440px] w-full" />
            ) : topology.isError ? (
              <ErrorState title="Unable to load topology" message={(topology.error as Error).message} onRetry={() => topology.refetch()} />
            ) : (
              <>
                <NetworkGraph
                  nodes={topology.data!.nodes}
                  links={topology.data!.links}
                  selectedId={selected?.id}
                  onSelect={setSelected}
                  height={440}
                />
                {atRisk.length ? (
                  <div className="mt-2 border-t border-line pt-2">
                    <div className="section-rule mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <ShieldAlert className="size-3 text-high" aria-hidden /> Hosts requiring attention
                      </span>
                    </div>
                    <ul className="flex flex-wrap gap-1.5">
                      {atRisk.map((node) => (
                        <li key={node.id}>
                          <button
                            type="button"
                            onClick={() => setSelected(node)}
                            className="mono inline-flex items-center gap-1.5 rounded-[2px] border border-high/35 bg-high/10 px-2 py-1 text-[11px] tracking-[0.01em] text-high uppercase transition-colors hover:bg-high/20"
                          >
                            <span className="size-1.5 rounded-full bg-current" aria-hidden />
                            {node.name} · {node.ip}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </Panel>

        <div className="flex min-w-0 flex-col gap-2.5">
          <NodeInspector node={selected} onClose={() => setSelected(null)} />

          <Panel title="Protocol Mix" icon={<Layers className="size-3.5" aria-hidden />} className="min-w-0">
            {summary.isLoading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}</div>
            ) : !summary.data?.protocolMix.length ? (
              <EmptyState compact icon={<Layers className="size-4" aria-hidden />} title="No protocol data" />
            ) : (
              <ul className="space-y-1.5">
                {summary.data.protocolMix.map((protocol) => (
                  <li key={protocol.protocol}>
                    <div className="mb-0.5 flex items-baseline justify-between gap-2">
                      <span className="mono text-[10.5px] font-semibold tracking-[0.01em] text-ink-2">{protocol.protocol}</span>
                      <span className="mono tnum text-[11px] text-ink-4">{protocol.count.toLocaleString()} · {protocol.percent}%</span>
                    </div>
                    <Meter value={protocol.percent} tone={protocol.protocol === 'SMB' ? 'warn' : 'cyber'} showValue={false} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Top Talkers" icon={<Server className="size-3.5" aria-hidden />} className="min-w-0" noPadding>
            {summary.isLoading ? (
              <div className="space-y-2 p-2.5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}</div>
            ) : !summary.data?.topTalkers.length ? (
              <EmptyState compact icon={<Server className="size-4" aria-hidden />} title="No talkers recorded" />
            ) : (
              <ul className="divide-y divide-line">
                {summary.data.topTalkers.map((talker) => (
                  <li key={talker.ip} className="flex items-center gap-2 px-2.5 py-1.5">
                    <span className="mono min-w-0 flex-1 truncate text-[11px] text-ink-2">{talker.name}</span>
                    <span className="mono shrink-0 text-[11px] text-ink-4">{talker.ip}</span>
                    <span className="mono tnum w-16 shrink-0 text-right text-[10.5px] text-cyber">{talker.mbps} Mb</span>
                    <span className="hidden w-12 shrink-0 sm:block">
                      <Meter value={talker.share} tone={talker.share > 20 ? 'warn' : 'term'} showValue={false} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Blocked Origins" icon={<Ban className="size-3.5" aria-hidden />} className="min-w-0" noPadding>
            {summary.isLoading ? (
              <div className="space-y-2 p-2.5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}</div>
            ) : !summary.data?.blockedByCountry.length ? (
              <EmptyState compact icon={<Globe2 className="size-4" aria-hidden />} title="Nothing blocked" description="No connections were denied in this window." />
            ) : (
              <ul className="divide-y divide-line">
                {summary.data.blockedByCountry.map((entry) => (
                  <li key={entry.code} className="flex items-center gap-2 px-2.5 py-1.5">
                    <Badge tone="err">{entry.code}</Badge>
                    <span className="min-w-0 flex-1 truncate text-[11px] text-ink-2">{entry.country}</span>
                    <span className="mono tnum text-[11px] font-semibold text-critical">{entry.count}</span>
                  </li>
                ))}
              </ul>
            )}
            {summary.data ? (
              <div className="flex items-center justify-between border-t border-line bg-base px-2.5 py-1.5">
                <span className="text-[11px] text-ink-4">Total denied</span>
                <span className="mono tnum text-[11px] font-semibold text-critical">{summary.data.blockedConnections.toLocaleString()}</span>
              </div>
            ) : null}
          </Panel>
        </div>
      </div>

      <NetworkThroughput />

      <NetworkEvents />

    </div>
  );
}
