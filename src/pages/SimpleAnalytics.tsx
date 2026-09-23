import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, BarChart3, PieChart } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonChart } from '@/components/ui/Skeleton';
import { MultiLineChart, SeverityDonut } from '@/components/ui/Chart';
import { AnalyticsHeadlines } from '@/components/analytics/AnalyticsHeadlines';
import { SimpleQA, TechnicalDetails } from '@/components/simple/SimpleParts';
import { analyticsApi, type AnalyticsBundle } from '@/services/analyticsApi';
import { queryKeys } from '@/services/queryKeys';

type Range = '24H' | '7D' | '30D' | '90D';
const RANGES: Range[] = ['24H', '7D', '30D', '90D'];

const THREAT_KEYS = [
  { key: 'phishing', name: 'PHISHING', color: '#9481c6' },
  { key: 'authentication', name: 'AUTH', color: '#dd8a52' },
  { key: 'network', name: 'NETWORK', color: '#4a9ec4' },
  { key: 'malware', name: 'MALWARE', color: '#de6375' },
  { key: 'web', name: 'WEB', color: '#3fb37f' },
];

/** Simple Mode Analytics — trends and outcomes, read in plain language. */
export default function SimpleAnalytics() {
  const meta = routeMetaFor('/analytics');
  const [range, setRange] = useState<Range>('30D');

  const bundle = useQuery({
    queryKey: queryKeys.analytics(range),
    queryFn: () => analyticsApi.bundle(range),
    placeholderData: (previous) => previous,
  });

  const data: AnalyticsBundle | undefined = bundle.data;
  const total = data?.severity.reduce((sum, entry) => sum + entry.count, 0) ?? 0;

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={meta.segments} />
      <PageHeader
        title="How We're Doing"
        description="A plain-language look at security trends over time."
        status={<Badge tone="neutral">WINDOW {range}</Badge>}
        actions={
          <Tabs
            ariaLabel="Analytics time window"
            value={range}
            onChange={(value) => setRange(value as Range)}
            items={RANGES.map((value) => ({ value, label: value }))}
          />
        }
      />

      <SimpleQA question="What am I looking at?">
        <p>
          This is a summary of everything CyberSentinel has seen in the selected window: how many
          detections happened, what type they were, how serious, and whether the picture is improving
          or getting worse. Use it to answer "are we under more or less attack than before?"
        </p>
      </SimpleQA>

      {bundle.isError ? (
        <Panel className="min-w-0">
          <ErrorState title="Analytics unavailable" message={(bundle.error as Error).message} onRetry={() => bundle.refetch()} />
        </Panel>
      ) : (
        <>
          <AnalyticsHeadlines headlines={data?.headlines ?? []} loading={bundle.isLoading} />

          <div className="grid min-w-0 gap-2.5 xl:grid-cols-3">
            <Panel title="Detections by category over time" icon={<Activity className="size-3.5" aria-hidden />} className="min-w-0 xl:col-span-2">
              {bundle.isLoading ? (
                <SkeletonChart height={240} />
              ) : !data?.threatTrend.length ? (
                <EmptyState compact title="No trend data" description="No detections were recorded in this window." />
              ) : (
                <MultiLineChart data={data.threatTrend} keys={THREAT_KEYS} height={240} ariaLabel={`Threat trend by category over the last ${range}`} />
              )}
            </Panel>

            <Panel title="How serious are the detections?" icon={<PieChart className="size-3.5" aria-hidden />} className="min-w-0">
              {bundle.isLoading ? (
                <SkeletonChart height={240} />
              ) : !data?.severity.length ? (
                <EmptyState compact title="No severity data" />
              ) : (
                <>
                  <SeverityDonut
                    data={data.severity.map((entry) => ({ name: entry.severity, value: entry.count, color: entry.color }))}
                    height={176}
                    ariaLabel={`Detections by severity over the last ${range}`}
                  />
                  <ul className="mt-1.5 space-y-1 border-t border-line pt-1.5">
                    {data.severity.map((entry) => {
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

          <div className="grid min-w-0 gap-2.5 xl:grid-cols-2">
            <Panel title="Where do detections come from?" icon={<BarChart3 className="size-3.5" aria-hidden />} className="min-w-0">
              {bundle.isLoading ? (
                <SkeletonChart height={180} />
              ) : !data?.categories.length ? (
                <EmptyState compact title="No category data" />
              ) : (() => {
                const categoryTotal = data.categories.reduce((sum, entry) => sum + entry.count, 0);
                return (
                  <ul className="space-y-1.5">
                    {data.categories.map((entry) => {
                      const share = categoryTotal ? (entry.count / categoryTotal) * 100 : 0;
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
                );
              })()}
            </Panel>

            <div className="flex min-w-0 flex-col gap-2.5">
              <SimpleQA question="Is this good or bad news?">
                <p className="text-ink-2">
                  A rising trend line is not automatically an attack — it usually means better detection and
                  more visibility. Watch for a sudden spike in one category, or a growing share of
                  critical-severity detections, as these point to something active.
                </p>
              </SimpleQA>
              <TechnicalDetails title="Advanced analytics & reporting" hint="Rule efficacy · throughput" defaultOpen={false}>
                <p className="mb-2 text-[12px] leading-relaxed text-ink-2">
                  The analyst view adds incident throughput, resolution performance by priority, rule
                  efficacy scoring, and connects directly to the report generator.
                </p>
                <a href="/analytics?mode=analyst" className="mono text-[11px] tracking-[0.01em] text-term uppercase">
                  Open Analyst View →
                </a>
              </TechnicalDetails>
            </div>
          </div>
        </>
      )}
    </div>
  );
}