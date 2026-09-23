import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, BarChart3, Clock, PieChart, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton, SkeletonChart } from '@/components/ui/Skeleton';
import { SectionRule } from '@/components/ui/KeyValue';
import { Meter } from '@/components/ui/Meter';
import { MultiLineChart, DualBarChart, SeverityDonut } from '@/components/ui/Chart';
import { AnalyticsHeadlines } from '@/components/analytics/AnalyticsHeadlines';
import { RuleEfficacy } from '@/components/analytics/RuleEfficacy';
import { analyticsApi, type AnalyticsBundle } from '@/services/analyticsApi';
import { queryKeys } from '@/services/queryKeys';
import { cn } from '@/utils/cn';
import { useSettings } from '@/store/SettingsContext';
import SimpleAnalytics from './SimpleAnalytics';

type Range = '24H' | '7D' | '30D' | '90D';
const RANGES: Range[] = ['24H', '7D', '30D', '90D'];

const THREAT_KEYS = [
  { key: 'phishing', name: 'PHISHING', color: '#9481c6' },
  { key: 'authentication', name: 'AUTH', color: '#dd8a52' },
  { key: 'network', name: 'NETWORK', color: '#4a9ec4' },
  { key: 'malware', name: 'MALWARE', color: '#de6375' },
  { key: 'web', name: 'WEB', color: '#3fb37f' },
];

/** Security Analytics — time-filtered trends, mixes and detection quality. */
export default function Analytics() {
  const { settings } = useSettings();
  if (settings.uiMode === 'simple') return <SimpleAnalytics />;

  const meta = routeMetaFor('/analytics');
  const [range, setRange] = useState<Range>('30D');

  const bundle = useQuery({
    queryKey: queryKeys.analytics(range),
    queryFn: () => analyticsApi.bundle(range),
    placeholderData: (previous) => previous,
  });

  const data: AnalyticsBundle | undefined = bundle.data;

  const resolutionColumns: Column<AnalyticsBundle['resolution'][number]>[] = [
    { key: 'label', header: 'Priority', sortValue: (row) => row.label, width: '80px', render: (row) => (
      <span className={cn('mono text-[10.5px] font-bold', row.label === 'P1' ? 'text-critical' : row.label === 'P2' ? 'text-high' : row.label === 'P3' ? 'text-medium' : 'text-low')}>{row.label}</span>
    ) },
    { key: 'created', header: 'Created', sortValue: (row) => row.created, width: '80px', align: 'right', render: (row) => <span className="mono tnum text-[11px] text-ink-2">{row.created}</span> },
    { key: 'resolved', header: 'Resolved', sortValue: (row) => row.resolved, width: '88px', align: 'right', render: (row) => <span className="mono tnum text-[11px] text-term">{row.resolved}</span> },
    { key: 'backlog', header: 'Open', sortValue: (row) => row.created - row.resolved, width: '64px', align: 'right', render: (row) => {
      const open = row.created - row.resolved;
      return <span className={cn('mono tnum text-[11px]', open ? 'text-high' : 'text-ink-4')}>{open}</span>;
    } },
    { key: 'avgHours', header: 'Avg Resolution', sortValue: (row) => row.avgHours, width: '168px', render: (row) => (
      <div className="flex items-center gap-2">
        <span className="w-16"><Meter value={Math.min(100, (row.avgHours / 60) * 100)} tone={row.avgHours > 24 ? 'err' : row.avgHours > 12 ? 'warn' : 'term'} showValue={false} /></span>
        <span className="mono tnum shrink-0 text-[10.5px] text-ink-2">{row.avgHours.toFixed(1)}h</span>
      </div>
    ) },
  ];

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={meta.segments} />
      <PageHeader
        title="Security Analytics"
        description="Detection volume, response performance and rule quality."
        status={
          <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]">
            <BarChart3 className="size-2.5 text-cyber" aria-hidden />
            <span className="mono text-[11px] font-semibold tracking-[0.02em] text-ink-2 uppercase">WINDOW {range}</span>
          </span>
        }
        actions={
          <Tabs
            ariaLabel="Analytics time window"
            value={range}
            onChange={(value) => setRange(value as Range)}
            items={RANGES.map((value) => ({ value, label: value }))}
          />
        }
      />

      {bundle.isError ? (
        <Panel className="min-w-0">
          <ErrorState title="Analytics unavailable" message={(bundle.error as Error).message} onRetry={() => bundle.refetch()} />
        </Panel>
      ) : (
        <>
          <AnalyticsHeadlines headlines={data?.headlines ?? []} loading={bundle.isLoading} />

          <div className="grid min-w-0 gap-2.5 xl:grid-cols-3">
            <Panel
              title="Threat Trend by Category"
              icon={<Activity className="size-3.5" aria-hidden />}
              className="min-w-0 xl:col-span-2"
              actions={<Badge tone="neutral">{range}</Badge>}
            >
              {bundle.isLoading ? (
                <SkeletonChart height={260} />
              ) : !data?.threatTrend.length ? (
                <EmptyState icon={<Activity className="size-4" aria-hidden />} title="No trend data" description="No detections were recorded in this window." />
              ) : (
                <MultiLineChart data={data.threatTrend} keys={THREAT_KEYS} height={260} ariaLabel={`Threat trend by category over the last ${range}`} />
              )}
            </Panel>

            <Panel title="Severity Mix" icon={<PieChart className="size-3.5" aria-hidden />} className="min-w-0">
              {bundle.isLoading ? (
                <SkeletonChart height={260} />
              ) : !data?.severity.length ? (
                <EmptyState compact title="No severity data" />
              ) : (
                <>
                  <SeverityDonut
                    data={data.severity.map((entry) => ({ name: entry.severity, value: entry.count, color: entry.color }))}
                    height={196}
                    ariaLabel={`Detections by severity over the last ${range}`}
                  />
                  <ul className="mt-1.5 space-y-1 border-t border-line pt-1.5">
                    {data.severity.map((entry) => {
                      const total = data.severity.reduce((sum, item) => sum + item.count, 0);
                      const share = total ? (entry.count / total) * 100 : 0;
                      return (
                        <li key={entry.key} className="flex items-center gap-2">
                          <span className="size-1.5 shrink-0 rounded-full" style={{ background: entry.color }} aria-hidden />
                          <span className="mono min-w-0 flex-1 truncate text-[10.5px] text-ink-3 uppercase">{entry.severity}</span>
                          <span className="mono tnum shrink-0 text-[10.5px] text-ink-2">{entry.count.toLocaleString()}</span>
                          <span className="mono tnum w-10 shrink-0 text-right text-[11px] text-ink-4">{share.toFixed(1)}%</span>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </Panel>
          </div>

          <div className="grid min-w-0 gap-2.5 xl:grid-cols-3">
            <Panel title="Event Volume" icon={<BarChart3 className="size-3.5" aria-hidden />} className="min-w-0 xl:col-span-2">
              {bundle.isLoading ? (
                <SkeletonChart height={220} />
              ) : !data?.eventVolume.length ? (
                <EmptyState compact title="No volume data" />
              ) : (
                <DualBarChart
                  data={data.eventVolume}
                  height={220}
                  stacked
                  ariaLabel={`Ingested versus correlated events over the last ${range}`}
                  keys={[
                    { key: 'ingested', name: 'INGESTED', color: '#4a9ec4' },
                    { key: 'correlated', name: 'CORRELATED', color: '#3fb37f' },
                    { key: 'dropped', name: 'DROPPED', color: '#dd8a52' },
                  ]}
                />
              )}
            </Panel>

            <Panel title="Incident Throughput" icon={<Clock className="size-3.5" aria-hidden />} className="min-w-0">
              {bundle.isLoading ? (
                <SkeletonChart height={220} />
              ) : !data?.incidentTrend.length ? (
                <EmptyState compact title="No incident data" />
              ) : (
                <DualBarChart
                  data={data.incidentTrend}
                  height={220}
                  ariaLabel={`Incidents created versus resolved over the last ${range}`}
                  keys={[
                    { key: 'created', name: 'CREATED', color: '#de6375' },
                    { key: 'resolved', name: 'RESOLVED', color: '#3fb37f' },
                    { key: 'breached', name: 'SLA BREACH', color: '#d0a94f' },
                  ]}
                />
              )}
            </Panel>
          </div>

          <div className="grid min-w-0 gap-2.5 xl:grid-cols-3">
            <Panel title="Resolution Performance" icon={<ShieldCheck className="size-3.5" aria-hidden />} className="min-w-0 xl:col-span-2" noPadding>
              {bundle.isLoading ? (
                <div className="space-y-2 p-2.5">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-8 w-full" />)}</div>
              ) : !data?.resolution.length ? (
                <EmptyState compact title="No resolution data" />
              ) : (
                <DataTable columns={resolutionColumns} rows={data.resolution} rowKey={(row) => row.label} caption="Resolution performance by priority" />
              )}
            </Panel>

            <Panel title="Category Distribution" className="min-w-0">
              {bundle.isLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-6 w-full" />)}</div>
              ) : !data?.categories.length ? (
                <EmptyState compact title="No category data" />
              ) : (() => {
                const total = data.categories.reduce((sum, entry) => sum + entry.count, 0);
                return (
                  <>
                    <SectionRule className="mb-1.5"><span>Detections by category</span></SectionRule>
                    <ul className="space-y-1.5">
                      {data.categories.map((entry) => {
                        const share = total ? (entry.count / total) * 100 : 0;
                        return (
                          <li key={entry.key}>
                            <div className="mb-0.5 flex items-baseline justify-between gap-2">
                              <span className="mono truncate text-[10.5px] text-ink-2 uppercase">{entry.category}</span>
                              <span className="mono tnum shrink-0 text-[11px] text-ink-4">{entry.count.toLocaleString()} · {share.toFixed(1)}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-[1px] bg-raised">
                              <div className="h-full" style={{ width: `${share}%`, background: entry.color }} aria-hidden />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mono mt-2 border-t border-line pt-1.5 text-[11px] text-ink-4">
                      TOTAL {total.toLocaleString()} DETECTIONS · {range}
                    </p>
                  </>
                );
              })()}
            </Panel>
          </div>

          <RuleEfficacy rules={data?.ruleEfficacy ?? []} />
        </>
      )}
    </div>
  );
}
