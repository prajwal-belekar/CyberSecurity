import { useState } from 'react';
import { Activity } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { SeverityAreaChart } from '@/components/ui/Chart';
import { SkeletonChart } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useThreatActivity } from '@/hooks/useThreats';
import { useSettings } from '@/store/SettingsContext';
import type { TimeRange } from '@/types/common';

const RANGES: Array<{ value: TimeRange; label: string }> = [
  { value: '1H', label: '1H' },
  { value: '6H', label: '6H' },
  { value: '24H', label: '24H' },
  { value: '7D', label: '7D' },
  { value: '30D', label: '30D' },
];

/** Severity-stacked threat activity over time with range switching. */
export function ThreatActivityChart() {
  const { settings } = useSettings();
  const initial = (RANGES.find((r) => r.value === settings.defaultTimeRange)?.value ?? '24H') as TimeRange;
  const [range, setRange] = useState<TimeRange>(initial);
  const { data, isLoading, isError, error, refetch, isFetching } = useThreatActivity(range);

  const peak = data?.reduce((max, p) => Math.max(max, Number(p.total ?? 0)), 0) ?? 0;
  const total = data?.reduce((sum, p) => sum + Number(p.total ?? 0), 0) ?? 0;

  return (
    <Panel
      title="Threat Activity"
      icon={<Activity className="size-3.5" aria-hidden />}
      actions={
        <>
          <span className="mono hidden text-[11px] tracking-[0.01em] text-ink-4 uppercase sm:inline">
            {isFetching ? 'SYNCING…' : `${total} EVENTS · PEAK ${peak}`}
          </span>
          <Tabs
            ariaLabel="Threat activity time range"
            items={RANGES.map((r) => ({ value: r.value, label: r.label }))}
            value={range}
            onChange={(value) => setRange(value as TimeRange)}
          />
        </>
      }
      noPadding
      className="min-w-0"
    >
      <div className="p-2.5 pt-1">
        {isLoading ? (
          <SkeletonChart height={248} />
        ) : isError ? (
          <ErrorState
            title="Unable to load threat activity"
            message={(error as Error)?.message ?? 'The analytics service could not be reached.'}
            onRetry={() => refetch()}
            compact
          />
        ) : !data?.length ? (
          <EmptyState
            icon={<Activity className="size-4" aria-hidden />}
            title="No activity in this window"
            description="Widen the time range or wait for the detection engine to correlate new events."
          />
        ) : (
          <SeverityAreaChart data={data} height={248} ariaLabel={`Threat activity by severity over the last ${range}`} />
        )}
      </div>
    </Panel>
  );
}
