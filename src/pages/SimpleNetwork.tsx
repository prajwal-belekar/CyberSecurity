import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Radio, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { NetworkOverviewStats, NetworkThroughput } from '@/components/network/NetworkOverview';
import { SimpleQA, TechnicalDetails } from '@/components/simple/SimpleParts';
import { useNetworkSummary, useNetworkTopology } from '@/hooks/useNetworkEvents';
import { severityRank } from '@/utils/severity';

/** Simple Mode Network Status — is my network healthy, and what is odd. */
export default function SimpleNetwork() {
  const meta = routeMetaFor('/network');
  const { data: summary, isError, error, refetch } = useNetworkSummary();
  const { data: topology } = useNetworkTopology();

  const attention = useMemo(() => {
    const nodes = topology?.nodes ?? [];
    const flagged = nodes.filter((n) => n.status === 'threat' || n.status === 'suspicious');
    return flagged.sort((a, b) => severityRank(b.risk) - severityRank(a.risk));
  }, [topology]);

  const posture = summary
    ? summary.blockedConnections > 0 || summary.suspiciousConnections > 0
      ? 'warn'
      : 'default'
    : 'default';

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={meta.segments} />
      <PageHeader
        title="Network Status"
        description="Who is talking to whom, and what looks out of place."
        status={<Badge tone={posture === 'warn' ? 'warn' : 'term'} dot>{posture === 'warn' ? 'NEEDS REVIEW' : 'NORMAL'}</Badge>}
      />

      <SimpleQA question="What is this showing me?" tone={posture}>
        <p>
          This is the health check for your network. Continuously monitored are the devices currently
          connected, suspicious or blocked connection attempts, and which systems are talking the most.
          If the posture reads warning, there are connections being blocked or flagged — read below
          for the details.
        </p>
      </SimpleQA>

      {isError ? (
        <ErrorState title="Unable to load network status" message={(error as Error)?.message ?? 'The network service could not be reached.'} onRetry={() => refetch()} />
      ) : (
        <>
          <NetworkOverviewStats />
          <div className="grid gap-2.5 xl:grid-cols-3">
            <NetworkThroughput />

            <Panel title="Systems needing attention" icon={<ShieldAlert className="size-3.5" aria-hidden />} className="min-w-0" accent={attention.length ? 'critical' : 'none'}>
              {!topology ? (
                <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
              ) : attention.length === 0 ? (
                <p className="text-[12px] leading-relaxed text-ink-3">No devices are currently flagged as suspicious. If something looks wrong the device will appear here.</p>
              ) : (
                <ul className="space-y-1.5">
                  {attention.map((node) => (
                    <li key={node.id} className="rounded-[2px] border border-line bg-raised p-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-semibold text-ink">{node.name}</span>
                        <span className="flex-1" />
                        <Badge tone={node.risk === 'critical' || node.risk === 'high' ? 'err' : 'warn'}>{node.status}</Badge>
                      </div>
                      <p className="mono mt-0.5 text-[10.5px] text-ink-3">{node.kind} · {node.ip}</p>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/network?mode=analyst" className="mt-2 block">
                <span className="mono text-[11px] tracking-[0.01em] text-term uppercase">Open network map →</span>
              </Link>
            </Panel>
          </div>

          <div className="grid gap-2.5 lg:grid-cols-2">
            <Panel title="Heaviest traffic" icon={<Radio className="size-3.5" aria-hidden />} className="min-w-0">
              {!summary ? (
                <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
              ) : (
                <ul className="space-y-1">
                  {summary.topTalkers.map((talker) => (
                    <li key={talker.ip} className="flex items-center gap-2 text-[12px]">
                      <span className="mono w-24 truncate text-cyber">{talker.name}</span>
                      <span className="mono flex-1 truncate text-ink-4">{talker.ip}</span>
                      <span className="flex h-1 flex-1 max-w-40 overflow-hidden rounded-[1px] bg-raised">
                        <span className="h-full bg-term" style={{ width: `${talker.share * 100}%` }} aria-hidden />
                      </span>
                      <span className="mono w-20 text-right text-[11px] text-ink-3">{talker.mbps.toFixed(1)} Mbps</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Blocked by country of origin" icon={<Globe className="size-3.5" aria-hidden />} className="min-w-0">
              {!summary ? (
                <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
              ) : summary.blockedByCountry.length === 0 ? (
                <p className="text-[12px] text-ink-3">Nothing is being blocked right now.</p>
              ) : (
                <ul className="space-y-1">
                  {summary.blockedByCountry.map((row) => (
                    <li key={row.code} className="flex items-center gap-2 text-[12px]">
                      <span className="mono w-20 truncate text-ink-2">{row.country}</span>
                      <span className="mono text-[10.5px] text-ink-4">{row.code}</span>
                      <span className="flex h-1 flex-1 overflow-hidden rounded-[1px] bg-raised">
                        <span className="h-full bg-high" style={{ width: `${Math.min(100, row.count * 4)}%` }} aria-hidden />
                      </span>
                      <span className="mono w-16 text-right text-[11px] text-ink-3">{row.count} attempts</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <SimpleQA question="What should I do next?" tone="default">
            {summary && (summary.blockedConnections > 0 || summary.suspiciousConnections > 0) ? (
              <ul className="space-y-1">
                <li className="text-[12px] text-ink-2">Treat blocked/failed connections as normal — the firewall is doing its job.</li>
                <li className="text-[12px] text-ink-2">If a device shows a threat or suspicious flag, open the network map from the Analyst view to inspect it.</li>
                <li className="text-[12px] text-ink-2">Cross-check any flagged device against Security Alerts before deciding.</li>
              </ul>
            ) : (
              <p className="text-[12px] text-ink-2">Nothing is blocked or flagged right now. Keep monitoring — this page updates live.</p>
            )}
          </SimpleQA>

          <TechnicalDetails title="Advanced: network map & traffic flows" hint="Interactive topology" defaultOpen={false}>
            <p className="mb-2 text-[12px] leading-relaxed text-ink-2">
              The analyst view renders the full interactive graph: connections, ports, per-node risk and
              the live event stream for allowed, flagged and blocked traffic.
            </p>
            <Link to="/network?mode=analyst">
              <span className="mono text-[11px] tracking-[0.01em] text-term uppercase">Open Analyst View →</span>
            </Link>
          </TechnicalDetails>
        </>
      )}
    </div>
  );
}