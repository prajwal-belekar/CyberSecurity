import { PieChart as PieIcon } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { SeverityDonut, CHART_COLORS } from '@/components/ui/Chart';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useThreatSummary } from '@/hooks/useSecurityEvents';
import { cn } from '@/utils/cn';

/** Severity breakdown donut with an inline legend table. */
export function SeverityDistribution() {
  const { data, isLoading, isError, error, refetch } = useThreatSummary();

  const rows = [
    { key: 'critical', label: 'CRITICAL', value: data?.critical ?? 0, color: CHART_COLORS.critical },
    { key: 'high', label: 'HIGH', value: data?.high ?? 0, color: CHART_COLORS.high },
    { key: 'medium', label: 'MEDIUM', value: data?.medium ?? 0, color: CHART_COLORS.medium },
    { key: 'low', label: 'LOW', value: data?.low ?? 0, color: CHART_COLORS.low },
    { key: 'info', label: 'INFO', value: data?.info ?? 0, color: CHART_COLORS.info },
  ];
  const total = rows.reduce((sum, r) => sum + r.value, 0) || 1;

  return (
    <Panel title="Severity Distribution" icon={<PieIcon className="size-3.5" aria-hidden />} noPadding className="min-w-0">
      {isError ? (
        <ErrorState title="Unable to load distribution" message={(error as Error).message} onRetry={() => refetch()} compact />
      ) : isLoading ? (
        <div className="flex items-center gap-3 p-3">
          <Skeleton className="size-32 rounded-full" />
          <div className="flex-1 space-y-2">
            {rows.map((r) => <Skeleton key={r.key} className="h-3 w-full" />)}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 p-2.5 sm:flex-row">
          <div className="relative shrink-0">
            <SeverityDonut
              data={rows.map((r) => ({ name: r.label, value: r.value, color: r.color }))}
              height={168}
              ariaLabel="Security events grouped by severity"
              innerRadius={46}
              outerRadius={70}
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="mono tnum text-[19px] leading-none font-bold text-ink">{total}</span>
              <span className="label-xs mt-1">Events</span>
            </div>
          </div>
          <ul className="w-full min-w-0 flex-1">
            {rows.map((r) => {
              const pct = Math.round((r.value / total) * 100);
              return (
                <li key={r.key} className="flex items-center gap-2 border-b border-line py-1 last:border-b-0">
                  <span className="size-2 shrink-0 rounded-[1px]" style={{ background: r.color }} aria-hidden />
                  <span className="mono w-16 shrink-0 text-[11px] font-semibold tracking-[0.01em] text-ink-3">{r.label}</span>
                  <span className="h-1 min-w-0 flex-1 overflow-hidden rounded-[1px] bg-raised">
                    <span className="block h-full" style={{ width: `${pct}%`, background: r.color }} aria-hidden />
                  </span>
                  <span className={cn('mono tnum w-9 shrink-0 text-right text-[10.5px] font-semibold text-ink-2')}>{r.value}</span>
                  <span className="mono tnum w-9 shrink-0 text-right text-[11px] text-ink-4">{pct}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Panel>
  );
}
