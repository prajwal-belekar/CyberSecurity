import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import type { AnalyticsBundle } from '@/services/analyticsApi';

/** Lower-is-better metrics: a negative delta is an improvement. */
const LOWER_IS_BETTER = new Set(['Mean time to detect', 'Mean time to resolve', 'False-positive rate']);

/** KPI strip: headline metric, delta against the previous period, and the hint. */
export function AnalyticsHeadlines({ headlines, loading }: { headlines: AnalyticsBundle['headlines']; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-[76px] w-full" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
      {headlines.map((headline) => {
        const improving = LOWER_IS_BETTER.has(headline.label) ? headline.delta < 0 : headline.delta > 0;
        const flat = Math.abs(headline.delta) < 0.05;
        return (
          <div key={headline.label} className="panel relative overflow-hidden p-2.5">
            <span className={cn('absolute inset-x-0 top-0 h-[2px]', flat ? 'bg-line-3' : improving ? 'bg-term' : 'bg-high')} aria-hidden />
            <p className="label-xs truncate">{headline.label}</p>
            <p className="mono tnum mt-1 text-[22px] leading-none font-bold text-ink">{headline.value}</p>
            <p className={cn('mono mt-1.5 flex items-center gap-1 text-[11px] tracking-[0.01em] uppercase', flat ? 'text-ink-4' : improving ? 'text-term' : 'text-high')}>
              {flat ? null : improving ? <TrendingDown className="size-2.5" aria-hidden /> : <TrendingUp className="size-2.5" aria-hidden />}
              {headline.delta > 0 ? '+' : ''}{headline.delta.toFixed(1)}%
              <span className="text-ink-4 normal-case">{headline.hint}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
