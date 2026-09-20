import { Database, Globe2, Radar, Users } from 'lucide-react';
import { StatTile } from '@/components/ui/StatTile';
import { SeverityDonut, CapabilityRadar } from '@/components/ui/Chart';
import { Panel } from '@/components/ui/Card';
import { Skeleton, SkeletonChart } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionRule } from '@/components/ui/KeyValue';
import { Meter } from '@/components/ui/Meter';
import { useQuery } from '@tanstack/react-query';
import { intelligenceApi } from '@/services/intelligenceApi';
import { queryKeys } from '@/services/queryKeys';
import { formatRelative } from '@/utils/dates';
import { severityMeta } from '@/utils/severity';

/** Feed health counters plus type/risk/source/actor breakdowns. */
export function IntelSummary() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.intelligenceSummary(),
    queryFn: () => intelligenceApi.summary(),
    staleTime: 20_000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Panel className="min-w-0">
        <ErrorState title="Intelligence summary unavailable" message={(error as Error)?.message ?? 'No summary returned.'} onRetry={() => refetch()} />
      </Panel>
    );
  }

  const maxSource = Math.max(1, ...data.bySource.map((entry) => entry.count));

  return (
    <>
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        <StatTile
          label="Indicators Tracked"
          value={data.totalIndicators}
          icon={<Database className="size-4" aria-hidden />}
          tone="cyber"
          description="Active entries across every connected feed"
        />
        <StatTile
          label="Added Today"
          value={data.newToday}
          icon={<Radar className="size-4" aria-hidden />}
          tone="term"
          trend={{ delta: 12, period: 'vs yesterday' }}
          description="Newly ingested and correlated indicators"
        />
        <StatTile
          label="Feed Sources"
          value={data.bySource.length}
          icon={<Globe2 className="size-4" aria-hidden />}
          tone="neutral"
          description={`Last sync ${formatRelative(data.bySource[0]?.lastSync ?? new Date().toISOString())}`}
        />
        <StatTile
          label="Tracked Actors"
          value={data.topActors.length}
          icon={<Users className="size-4" aria-hidden />}
          tone="high"
          description={data.topActors[0] ? `Most active: ${data.topActors[0].name}` : undefined}
        />
      </div>

      <div className="grid min-w-0 gap-2.5 xl:grid-cols-3">
        <Panel title="Risk Distribution" className="min-w-0">
          {data.byRisk.length ? (
            <SeverityDonut
              data={data.byRisk.map((entry) => ({
                name: severityMeta(entry.risk).label,
                value: entry.count,
                color: severityMeta(entry.risk).hex,
              }))}
              height={196}
              ariaLabel="Indicators by risk level"
            />
          ) : (
            <EmptyState compact title="No risk breakdown" />
          )}
        </Panel>

        <Panel title="Indicator Types" className="min-w-0">
          {data.byType.length ? (
            <CapabilityRadar
              data={data.byType.map((entry) => ({ subject: entry.type.replace(/_/g, ' ').toUpperCase(), value: entry.count }))}
              height={196}
              ariaLabel="Indicators by type"
            />
          ) : (
            <EmptyState compact title="No type breakdown" />
          )}
        </Panel>

        <Panel title="Feeds & Actors" className="min-w-0">
          <SectionRule className="mb-1.5"><span>Feed sources</span></SectionRule>
          <ul className="space-y-1">
            {data.bySource.map((entry) => (
              <li key={entry.source}>
                <div className="mb-0.5 flex items-baseline justify-between gap-2">
                  <span className="mono truncate text-[10.5px] text-ink-2">{entry.source}</span>
                  <span className="mono tnum shrink-0 text-[11px] text-ink-4">{entry.count}</span>
                </div>
                <Meter value={(entry.count / maxSource) * 100} tone="cyber" showValue={false} />
                <p className="mono mt-0.5 text-[10.5px] text-ink-4">SYNCED {formatRelative(entry.lastSync)}</p>
              </li>
            ))}
          </ul>

          <SectionRule className="mt-2.5 mb-1.5"><span>Top actors</span></SectionRule>
          {data.topActors.length ? (
            <ul className="space-y-px">
              {data.topActors.map((actor) => (
                <li key={actor.name} className="flex items-center gap-2 border-b border-line py-1 last:border-b-0">
                  <span className="mono min-w-0 flex-1 truncate text-[10.5px] text-ink-2">{actor.name}</span>
                  <span className="mono shrink-0 text-[10.5px] text-ink-4">{actor.country}</span>
                  <span className={cnCountTone(actor.incidents)}>{actor.incidents}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mono text-[11px] text-ink-4">No attributed activity.</p>
          )}

          {data.byRisk.length ? (
            <p className="mono mt-2 text-[10.5px] text-ink-4">
              DOMINANT RISK :: {severityMeta(data.byRisk.reduce((a, b) => (a.count > b.count ? a : b)).risk).label}
            </p>
          ) : null}
        </Panel>
      </div>
    </>
  );
}

function cnCountTone(count: number): string {
  return `mono tnum shrink-0 text-[10.5px] font-semibold ${count >= 4 ? 'text-critical' : count >= 2 ? 'text-high' : 'text-ink-3'}`;
}

export { SkeletonChart };
