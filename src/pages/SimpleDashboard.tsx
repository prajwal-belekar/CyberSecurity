import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowUpRight, BarChart3, Bug, FileSearch, FileText, FolderKanban,
  Globe, KeyRound, Network as NetworkIcon, Radio, Radar, Search, ShieldCheck,
  ShieldAlert, Waypoints, Bot,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Panel } from '@/components/ui/Card';
import { Badge, IncidentStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Meter } from '@/components/ui/Meter';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Timeline } from '@/components/ui/Timeline';
import { SectionRule } from '@/components/ui/KeyValue';
import { AskAIButton, SeverityLine, SimpleQA, SimpleStatus, TechnicalDetails } from '@/components/simple/SimpleParts';
import { SystemHealth } from '@/components/dashboard/SystemHealth';
import { RecentEvents } from '@/components/dashboard/RecentEvents';
import { useIncidents } from '@/hooks/useIncidents';
import { useThreats } from '@/hooks/useThreats';
import { useThreatSummary } from '@/hooks/useSecurityEvents';
import { useNetworkSummary } from '@/hooks/useNetworkEvents';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { useLive } from '@/store/LiveContext';
import { authenticationApi } from '@/services/authenticationApi';
import { queryKeys } from '@/services/queryKeys';
import { cn } from '@/utils/cn';
import { formatRelative } from '@/utils/dates';
import { severityMeta, threatTypeLabel } from '@/utils/severity';
import type { SecurityEvent } from '@/types/threat';

/**
 * Simple Mode Dashboard — answers, in order:
 * What is happening? How serious? Why does it matter?
 * What has CyberSentinel done? What should I do next?
 *
 * Same hooks/services as Analyst Mode — only presentation differs.
 */
export default function SimpleDashboard() {
  const { connected, metrics } = useLive();
  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'evening' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const incidents = useIncidents('all');
  const threatSummary = useThreatSummary();
  const threats = useThreats();
  const network = useNetworkSummary();
  const health = useSystemHealth();

  const authSummary = useQuery({
    queryKey: queryKeys.authSummary(),
    queryFn: () => authenticationApi.summary(),
    staleTime: 15_000,
  });

  const activeIncidents = useMemo(
    () => (incidents.data ?? []).filter((i) => i.status === 'open' || i.status === 'investigating'),
    [incidents.data],
  );

  const activeThreats = useMemo(() => {
    const rank: Record<string, number> = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
    return (threats.data ?? [])
      .filter((t) => t.status !== 'resolved' && t.status !== 'false_positive')
      .slice()
      .sort((a, b) => (rank[b.severity] ?? 0) - (rank[a.severity] ?? 0));
  }, [threats.data]);

  const criticalThreats = threatSummary.data?.critical ?? 0;
  const highThreats = threatSummary.data?.high ?? 0;
  const hasCritical = criticalThreats > 0 || activeIncidents.some((i) => i.severity === 'critical');
  const hasHigh = highThreats > 0 || activeIncidents.some((i) => i.severity === 'high');

  const posture = hasCritical
    ? { label: 'ACTION NEEDED', tone: 'critical' as const, description: 'Something serious is happening right now. Review the critical alerts below and follow the recommended steps.' }
    : hasHigh
      ? { label: 'NEEDS REVIEW', tone: 'warn' as const, description: 'A few things look suspicious. Nothing is blocked yet — review the alerts below when you can.' }
      : { label: 'GOOD', tone: 'ok' as const, description: 'No urgent concerns. CyberSentinel is monitoring your environment continuously.' };

  const suspiciousNetwork = network.data?.suspiciousConnections ?? 0;
  const auth = authSummary.data;
  const authNeedsAttention = (auth?.suspicious ?? 0) > 0 || (auth?.lockedAccounts ?? 0) > 0;

  const degraded = health.data?.subsystems.filter((s) => s.state !== 'online' && s.state !== 'ready').length ?? 0;
  const totalSubs = health.data?.subsystems.length ?? 0;

  const blockedNetwork = network.data?.blockedConnections ?? 0;
  const netAvailable = Boolean(network.data);

  const malwareActive = useMemo(() => activeThreats.filter((t) => t.type === 'malware'), [activeThreats]);
  const phishingActive = useMemo(() => activeThreats.filter((t) => t.type === 'phishing'), [activeThreats]);
  const overviewSeverity = (list: Array<{ severity: string }>) => {
    if (list.some((t) => t.severity === 'critical' || t.severity === 'high')) return 'err' as const;
    if (list.length) return 'warn' as const;
    return 'good' as const;
  };

  const overviewTiles = [
    {
      key: 'accounts', label: 'Accounts', icon: KeyRound, to: '/authentication',
      state: !auth ? ('pending' as const) : authNeedsAttention ? ('warn' as const) : ('good' as const),
      status: !auth ? 'Checking…' : authNeedsAttention ? 'Needs review' : 'Good',
      note: !auth
        ? 'Waiting for sign-in data'
        : authNeedsAttention
          ? `${auth.suspicious} suspicious, ${auth.lockedAccounts} locked`
          : 'Sign-in activity looks normal',
    },
    {
      key: 'network', label: 'Network', icon: NetworkIcon, to: '/network',
      state: blockedNetwork > 0 ? ('ok' as const) : suspiciousNetwork > 0 ? ('warn' as const) : netAvailable ? ('good' as const) : ('pending' as const),
      status: blockedNetwork > 0 ? 'Protected' : suspiciousNetwork > 0 ? 'Needs review' : netAvailable ? 'Good' : 'Checking…',
      note: blockedNetwork > 0
        ? `${blockedNetwork} connections auto-blocked`
        : suspiciousNetwork > 0
          ? `${suspiciousNetwork} suspicious connections`
          : netAvailable ? 'No suspicious network traffic' : 'Waiting for network data',
    },
    {
      key: 'malware', label: 'Malware', icon: Radar, to: '/malware',
      state: overviewSeverity(malwareActive),
      status: overviewSeverity(malwareActive) === 'err' ? 'Action needed' : overviewSeverity(malwareActive) === 'warn' ? 'Needs review' : 'Good',
      note: malwareActive.length
        ? `${malwareActive.length} active malware detection${malwareActive.length === 1 ? '' : 's'}`
        : 'No malware files detected',
    },
    {
      key: 'phishing', label: 'Phishing', icon: Globe, to: '/phishing',
      state: overviewSeverity(phishingActive),
      status: overviewSeverity(phishingActive) === 'err' ? 'Action needed' : overviewSeverity(phishingActive) === 'warn' ? 'Needs review' : 'Good',
      note: phishingActive.length
        ? `${phishingActive.length} active phishing detection${phishingActive.length === 1 ? '' : 's'}`
        : 'No phishing URLs detected',
    },
  ];
  const tileDot: Record<string, string> = { good: 'bg-term', warn: 'bg-high', err: 'bg-critical', ok: 'bg-cyber', pending: 'bg-ink-4' };
  const tileText: Record<string, string> = { good: 'text-term', warn: 'text-high', err: 'text-critical', ok: 'text-cyber', pending: 'text-ink-4' };

  const activityTimeline = useMemo(() => {
    const events: SecurityEvent[] = [];
    activeIncidents.slice(0, 4).forEach((incident) => {
      incident.timeline.slice(0, 3).forEach((entry) => {
        events.push({
          id: entry.id,
          type: entry.title,
          channel: 'INCIDENT',
          severity: incident.severity,
          source: incident.source,
          target: incident.target,
          timestamp: entry.timestamp,
          status: 'investigating',
          description: entry.detail,
          incidentId: incident.id,
        });
      });
    });
    return events
      .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
      .slice(0, 8);
  }, [activeIncidents]);

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      {/* 1 · SECURITY STATUS */}
      <p className="px-0.5 text-[12.5px] text-ink-3">
        Good {greeting}, here&apos;s what&apos;s happening with your security today.
      </p>
      <SimpleStatus
        tone={posture.tone}
        headline={posture.label}
        description={posture.description}
        reassurance={
          posture.tone === 'ok'
            ? 'CyberSentinel is monitoring your environment. You only need to act if something appears here.'
            : 'Your investigation context, filters and settings carry over to Analyst Mode unchanged.'
        }
        actions={
          <span className="flex items-center gap-1.5">
            <span className={cn('size-1.5 rounded-full', connected ? 'bg-term text-term' : 'bg-ink-4 text-ink-4')} aria-hidden />
            <span className="mono text-[11px] font-semibold tracking-[0.02em] text-ink-2 uppercase">
              {connected ? 'SYSTEM ONLINE' : 'SYSTEM PAUSED'}
            </span>
          </span>
        }
      >
        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-4">
          {[
            { label: 'THREAT LEVEL', value: hasCritical ? 'CRITICAL' : hasHigh ? 'ELEVATED' : 'LOW', tone: hasCritical ? 'text-critical' : hasHigh ? 'text-high' : 'text-term' },
            { label: 'ACTIVE INCIDENTS', value: String(activeIncidents.length), tone: activeIncidents.length ? 'text-high' : 'text-term' },
            { label: 'EVENTS TODAY', value: (threatSummary.data?.eventsToday ?? metrics.totalEvents).toLocaleString(), tone: 'text-ink' },
            { label: 'SYSTEMS MONITORED', value: totalSubs ? `${totalSubs - degraded}/${totalSubs}` : '—', tone: degraded ? 'text-medium' : 'text-term' },
          ].map((cell) => (
            <div key={cell.label} className="min-w-0 rounded-[2px] border border-line bg-raised px-2.5 py-1.5">
              <div className="label-xs truncate">{cell.label}</div>
              <div className={cn('mono tnum mt-0.5 text-[14px] leading-none font-semibold', cell.tone)}>{cell.value}</div>
            </div>
          ))}
        </div>
      </SimpleStatus>

      <Panel title="Security overview" icon={<ShieldCheck className="size-3.5" aria-hidden />} className="min-w-0">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {overviewTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.key}
                to={tile.to}
                className="group min-w-0 rounded-[2px] border border-line bg-raised px-2.5 py-2 transition-colors hover:border-term/40 hover:bg-line"
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Icon className="size-3.5 shrink-0 text-cyber" aria-hidden />
                    <span className="truncate text-[11.5px] font-semibold text-ink">{tile.label}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    <span className={cn('size-1.5 rounded-full', tileDot[tile.state])} aria-hidden />
                    <span className={cn('mono text-[10px] font-bold tracking-[0.03em] uppercase', tileText[tile.state])}>{tile.status}</span>
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 truncate text-[11px] leading-relaxed text-ink-4 group-hover:text-ink-3">{tile.note}</p>
              </Link>
            );
          })}
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-2 rounded-[2px] border border-line-2 bg-raised px-2.5 py-2">
        <Badge tone={posture.tone === 'critical' ? 'err' : posture.tone === 'warn' ? 'warn' : 'term'}>
          {criticalThreats + highThreats} PRIORITY ALERTS
        </Badge>
        <Badge tone="neutral">{metrics.totalEvents.toLocaleString()} EVENTS / 24H</Badge>
        <Badge tone="neutral">SIMULATED ENVIRONMENT</Badge>
        <span className="flex-1" />
        <Link to="/threats" className="mono inline-flex items-center gap-1 text-[11px] font-semibold text-cyber uppercase hover:underline">
          Review alerts <ArrowUpRight className="size-3" aria-hidden />
        </Link>
      </div>

      {/* 2 · ACTIVE THREATS — what is happening right now */}
      <div className="grid min-w-0 grid-cols-1 gap-2.5 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <Panel
            title="Active security alerts"
            icon={<AlertTriangle className="size-3.5" aria-hidden />}
            className="min-w-0"
            actions={
              <Link to="/threats">
                <Button variant="ghost" size="xs" iconRight={<ArrowUpRight className="size-3" aria-hidden />}>All alerts</Button>
              </Link>
            }
          >
            {threats.isLoading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : threats.isError ? (
              <ErrorState compact title="Alerts unavailable" message={(threats.error as Error).message} onRetry={() => threats.refetch()} />
            ) : activeThreats.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <span className="flex size-10 items-center justify-center rounded-[2px] border border-term/30 bg-term/10 text-term">
                  <ShieldAlert className="size-5" aria-hidden />
                </span>
                <p className="text-[13px] font-medium text-ink">No active alerts</p>
                <p className="mono text-[11px] text-ink-4">Nothing is demanding attention right now.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {activeThreats.slice(0, 4).map((threat) => {
                  const sev = severityMeta(threat.severity);
                  return (
                    <li key={threat.id} className="rounded-[2px] border border-line bg-raised p-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <SeverityLine severity={threat.severity} />
                        <span className="mono text-[11px] font-bold text-term">{threat.id}</span>
                        <Badge tone="neutral" title="Detection status">{threat.status.replace(/_/g, ' ')}</Badge>
                        <span className="flex-1" />
                        <span className="mono text-[10.5px] text-ink-4">LAST {formatRelative(threat.lastSeen)}</span>
                      </div>
                      <p className="mt-1.5 text-[13px] font-semibold text-ink">{threat.title}</p>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-ink-3">{threat.description}</p>
                      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-4">
                        {[
                          ['SOURCE', threat.source],
                          ['TARGET', threat.target],
                          ['TYPE', threatTypeLabel(threat.type)],
                          ['CONFIDENCE', `${Math.round(threat.confidence * 100)}%`],
                        ].map(([label, value]) => (
                          <div key={label} className="min-w-0">
                            <div className="label-xs">{label}</div>
                            <div className="mono truncate text-[11px] text-ink-2">{value}</div>
                          </div>
                        ))}
                      </div>
                      {threat.recommendedActions.length ? (
                        <p className="mt-2 rounded-[2px] border border-line bg-base px-2 py-1.5 text-[11.5px] leading-relaxed text-ink-3">
                          <span className="font-semibold text-term">CyberSentinel recommends: </span>
                          {threat.recommendedActions[0]}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Link to={`/threats/${threat.id}`}>
                          <Button size="xs" variant="primary">Investigate</Button>
                        </Link>
                        {threat.incidentId ? (
                          <Link to={`/incidents/${threat.incidentId}`}>
                            <Button size="xs" variant="secondary">Open incident</Button>
                          </Link>
                        ) : null}
                        <Link to={`/threats/${threat.id}`}>
                          <Button size="xs" variant="ghost">Technical details</Button>
                        </Link>
                      </div>
                      <span className="sr-only">Severity {sev.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        {/* 3 · RECENT INCIDENTS + next steps */}
        <div className="flex min-w-0 flex-col gap-2.5">
          <Panel
            title="My investigations"
            icon={<FolderKanban className="size-3.5" aria-hidden />}
            className="min-w-0"
            actions={
              <Link to="/incidents">
                <Button variant="ghost" size="xs" iconRight={<ArrowUpRight className="size-3" aria-hidden />}>All</Button>
              </Link>
            }
          >
            {incidents.isLoading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : activeIncidents.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-[12.5px] text-ink-3">No open investigations.</p>
                <p className="mono mt-1 text-[11px] text-ink-4">Everything has been triaged.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {activeIncidents.slice(0, 4).map((incident) => (
                  <li key={incident.id} className="rounded-[2px] border border-line bg-raised p-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <SeverityLine severity={incident.severity} />
                      <IncidentStatusBadge status={incident.status} />
                      <span className="flex-1" />
                      <span className="mono text-[10.5px] text-term">{incident.id}</span>
                    </div>
                    <Link to={`/incidents/${incident.id}`} className="group mt-1 block">
                      <p className="text-[12.5px] font-medium text-ink-2 group-hover:text-ink">{incident.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-ink-4">{incident.summary}</p>
                    </Link>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Link to={`/incidents/${incident.id}`} className="mono rounded-[2px] border border-line-2 bg-panel px-2 py-0.5 text-[11px] font-semibold text-ink-2 uppercase transition-colors hover:border-term/40 hover:text-term">
                        Investigate
                      </Link>
                      <span className="mono text-[10.5px] text-ink-4">{formatRelative(incident.updatedAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="What should I do next?"
            icon={<Radio className="size-3.5" aria-hidden />}
            className="min-w-0"
            actions={<AskAIButton to="/ai-assistant" label="Ask AI" size="xs" />}
          >
            {activeIncidents.length + activeThreats.length > 0 ? (
              <ol className="space-y-2">
                {[
                  ...(activeThreats[0] ? [{ text: `Investigate alert: ${activeThreats[0].title}`, to: `/threats/${activeThreats[0].id}` }] : []),
                  ...(activeIncidents[0] ? [{ text: `Review investigation ${activeIncidents[0].id} — ${activeIncidents[0].title}`, to: `/incidents/${activeIncidents[0].id}` }] : []),
                ]
                  .slice(0, 3)
                  .map((step, index) => (
                    <li key={step.to} className="flex items-start gap-2">
                      <span className={cn('mono tnum flex size-5 shrink-0 items-center justify-center rounded-[2px] border text-[10.5px] font-bold', index === 0 ? 'border-term/40 bg-term/10 text-term' : 'border-line-2 text-ink-4')}>
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12px] leading-snug text-ink-2">{step.text}</p>
                        <Link to={step.to} className="mono mt-0.5 inline-block text-[11px] font-semibold text-cyber uppercase hover:underline">
                          Open →
                        </Link>
                      </div>
                    </li>
                  ))}
                {activeIncidents.length + activeThreats.length === 0 ? null : (
                  <li className="flex items-start gap-2 pt-1">
                    <span className="mono tnum flex size-5 shrink-0 items-center justify-center rounded-[2px] border border-line-2 text-[10.5px] font-bold text-ink-4">
                      {Math.min(3, (activeIncidents[0] ? 1 : 0) + (activeThreats[0] ? 1 : 0) + 1)}
                    </span>
                    <p className="text-[12px] leading-snug text-ink-3">Check system health below to confirm every engine is online.</p>
                  </li>
                )}
              </ol>
            ) : (
              <div className="space-y-2 py-2 text-center">
                <p className="text-[12.5px] text-ink-3">No immediate actions required.</p>
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  <Link to="/phishing"><Button size="xs"><Search className="size-3" aria-hidden />Check a link</Button></Link>
                  <Link to="/threats"><Button size="xs" variant="secondary"><FileSearch className="size-3" aria-hidden />View alerts</Button></Link>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* 4 · LIVE SECURITY ACTIVITY */}
      <SimpleQA question="What has CyberSentinel done recently?">
        <p>
          Each step below is recorded automatically. Select an entry to open the full event record
          (event ID, source, target and detection rule).
        </p>
      </SimpleQA>

      <div className="grid min-w-0 grid-cols-1 gap-2.5 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <Panel
            title="Live security activity"
            icon={<Radio className="size-3.5" aria-hidden />}
            className="min-w-0"
            actions={
              <Link to="/threats" className="mono text-[11px] text-cyber uppercase hover:underline">View all</Link>
            }
          >
            {activityTimeline.length ? (
              <Timeline
                dense
                items={activityTimeline.map((event) => ({
                  id: event.id,
                  time: new Date(event.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                  timestamp: event.timestamp,
                  title: event.description ?? event.type,
                  detail: `${event.id} · ${event.source}${event.target ? ` → ${event.target}` : ''}`,
                  tone: event.severity === 'critical' ? 'critical' : event.severity === 'high' ? 'high' : event.severity === 'medium' ? 'medium' : 'cyber',
                }))}
              />
            ) : (
              <p className="mono py-3 text-center text-[11px] text-ink-4">No recent incident activity to show.</p>
            )}
            <p className="mono mt-2 border-t border-line pt-2 text-[10.5px] text-ink-4">
              Select a row in Recent Security Events below to inspect the full forensic record.
            </p>
          </Panel>
        </div>

        <div className="min-w-0">
          <Panel title="Network status" icon={<NetworkIcon className="size-3.5" aria-hidden />} className="min-w-0">
            {network.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : network.isError ? (
              <ErrorState compact title="Network data unavailable" message={(network.error as Error).message} onRetry={() => network.refetch()} />
            ) : network.data ? (
              <div className="space-y-2">
                <p
                  className={cn(
                    'text-[12.5px] leading-relaxed',
                    suspiciousNetwork > 0 ? 'text-high' : 'text-ink-2',
                  )}
                >
                  {suspiciousNetwork > 0
                    ? `${suspiciousNetwork} suspicious connection${suspiciousNetwork === 1 ? '' : 's'} detected. Review them when you can.`
                    : 'No suspicious connections in the current window.'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['HOSTS', String(network.data.connectedDevices)],
                    ['CONNECTIONS', String(network.data.activeConnections)],
                    ['SUSPICIOUS', String(network.data.suspiciousConnections)],
                    ['BLOCKED', String(network.data.blockedConnections)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[2px] border border-line bg-raised px-2 py-1.5">
                      <div className="label-xs">{label}</div>
                      <div className="mono tnum mt-0.5 text-[14px] font-semibold text-ink">{value}</div>
                    </div>
                  ))}
                </div>
                <Meter
                  label="NETWORK HEALTH"
                  value={Math.min(100, 100 - Math.min(60, network.data.suspiciousConnections * 4))}
                  tone={suspiciousNetwork > 0 ? 'warn' : 'term'}
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Link to="/network"><Button size="xs" variant="secondary">Network details</Button></Link>
                </div>
              </div>
            ) : null}
          </Panel>

          <Panel title="Authentication status" icon={<KeyRound className="size-3.5" aria-hidden />} className="min-w-0">
            {authSummary.isLoading ? (
              <Skeleton className="h-28 w-full" />
            ) : auth ? (
              <div className="space-y-2">
                <p className={cn('text-[12.5px] leading-relaxed', authNeedsAttention ? 'text-high' : 'text-ink-2')}>
                  {authNeedsAttention
                    ? `Unusual sign-in activity: ${auth.suspicious} suspicious attempt${auth.suspicious === 1 ? '' : 's'} and ${auth.lockedAccounts} locked account${auth.lockedAccounts === 1 ? '' : 's'}.`
                    : 'Sign-in activity looks normal. No lockouts or suspicious attempts right now.'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['SUCCESSFUL', String(auth.successful), 'text-term'],
                    ['FAILED', String(auth.failed), auth.failed > 0 ? 'text-high' : 'text-ink'],
                    ['SUSPICIOUS', String(auth.suspicious), auth.suspicious > 0 ? 'text-critical' : 'text-ink'],
                    ['LOCKED', String(auth.lockedAccounts), auth.lockedAccounts > 0 ? 'text-critical' : 'text-ink'],
                  ].map(([label, value, tone]) => (
                    <div key={label} className="rounded-[2px] border border-line bg-raised px-2 py-1.5">
                      <div className="label-xs">{label}</div>
                      <div className={cn('mono tnum mt-0.5 text-[14px] font-semibold', tone)}>{value}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Link to="/authentication"><Button size="xs" variant="secondary">Sign-in details</Button></Link>
                </div>
              </div>
            ) : null}
          </Panel>
        </div>
      </div>

      {/* 5 · SYSTEM HEALTH + recent event grid */}
      <div className="grid min-w-0 grid-cols-1 gap-2.5 xl:grid-cols-3">
        <div className="min-w-0">
          <SystemHealth />
        </div>
        <div className="min-w-0 xl:col-span-2">
          <RecentEvents />
        </div>
      </div>

      {/* 6 · EXPLORE — full capability access from Simple Mode */}
      <Panel title="Explore all tools" icon={<Waypoints className="size-3.5" aria-hidden />}>
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {[
            { to: '/phishing', label: 'Check a Link', hint: 'Phishing analyzer', icon: Globe },
            { to: '/web-security', label: 'Website Security', hint: 'Security headers scan', icon: Bug },
            { to: '/malware', label: 'Check a File', hint: 'Malware sandbox', icon: Radar },
            { to: '/ai-assistant', label: 'AI Assistant', hint: 'Investigate with AI', icon: Bot },
            { to: '/threat-intelligence', label: 'Security Intelligence', hint: 'Known-bad indicators', icon: Waypoints },
            { to: '/analytics', label: 'Analytics', hint: 'Security analytics', icon: BarChart3 },
            { to: '/reports', label: 'Reports', hint: 'Generate & review', icon: FileText },
            { to: '/network', label: 'Network', hint: 'Topology & flows', icon: NetworkIcon },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex min-w-0 flex-col gap-1 rounded-[2px] border border-line bg-raised px-2.5 py-2 transition-colors hover:border-term/40 hover:bg-line"
              >
                <span className="flex items-center gap-1.5">
                  <Icon className="size-3.5 shrink-0 text-cyber" aria-hidden />
                  <span className="truncate text-[12px] font-medium text-ink">{item.label}</span>
                </span>
                <span className="mono truncate text-[10.5px] text-ink-4">{item.hint}</span>
              </Link>
            );
          })}
        </div>
        <SectionRule className="mt-3 mb-1">
          <span>Simulation notice</span>
        </SectionRule>
        <p className="text-[11.5px] leading-relaxed text-ink-4">
          CyberSentinel currently runs against a simulated security environment. Events, threats and
          incidents are generated deterministically for training and demonstration — not from a live
          production network.
        </p>
      </Panel>

      <TechnicalDetails title="Advanced investigation" hint="Switch to the full SOC layout" defaultOpen={false}>
        <p className="mb-2 text-[12.5px] leading-relaxed text-ink-2">
          Need dense tables, full event streams and the terminal aesthetic? Open Analyst Mode —
          your investigation context, filters and settings are preserved.
        </p>
        <Link to="/dashboard?mode=analyst">
          <Button size="sm" variant="secondary" icon={<FileSearch className="size-3" aria-hidden />}>
            Open Analyst View for this page
          </Button>
        </Link>
      </TechnicalDetails>
    </div>
  );
}
