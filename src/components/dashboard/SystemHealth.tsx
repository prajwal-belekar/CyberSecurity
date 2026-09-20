import { HeartPulse } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { cn } from '@/utils/cn';
import { formatRelative } from '@/utils/dates';
import { Tooltip } from '@/components/ui/Tooltip';

const STATE_TONE: Record<string, string> = {
  online: 'text-term', ready: 'text-cyber', degraded: 'text-medium', offline: 'text-critical',
};
const STATE_DOT: Record<string, string> = {
  online: 'bg-term', ready: 'bg-cyber', degraded: 'bg-medium', offline: 'bg-critical',
};

/** Subsystem health grid — every monitored engine with state and latency. */
export function SystemHealth() {
  const { data, isLoading, isError, error, refetch } = useSystemHealth();

  return (
    <Panel
      title="System Health"
      icon={<HeartPulse className="size-3.5" aria-hidden />}
      className="min-w-0"
      noPadding
      actions={
        data ? (
          <span className={cn('mono text-[11px] font-semibold tracking-[0.01em] uppercase', STATE_TONE[data.overall] ?? 'text-term')}>
            {data.overall}
          </span>
        ) : null
      }
    >
      {isLoading ? (
        <div className="space-y-1.5 p-2.5">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
        </div>
      ) : isError ? (
        <ErrorState title="Unable to load system health" message={(error as Error).message} onRetry={() => refetch()} compact />
      ) : (
        <>
          <ul className="divide-y divide-line">
            {data!.subsystems.map((subsystem) => (
              <li key={subsystem.id} className="flex items-center gap-2 px-2.5 py-1.5">
                <Tooltip content={subsystem.detail} label={subsystem.name}>
                  <span className={cn('size-1.5 shrink-0 rounded-full', STATE_DOT[subsystem.state] ?? 'bg-ink-4')} aria-hidden />
                </Tooltip>
                <span className="mono min-w-0 flex-1 truncate text-[10.5px] font-semibold tracking-[0.01em] text-ink-2 uppercase">
                  {subsystem.name}
                </span>
                <span className="mono hidden max-w-[45%] truncate text-[11px] text-ink-4 lg:inline">{subsystem.detail}</span>
                <span className={cn('mono tnum shrink-0 text-[11px]', subsystem.latencyMs > 100 ? 'text-medium' : 'text-ink-4')}>
                  {subsystem.latencyMs}ms
                </span>
                <span className={cn('mono w-16 shrink-0 text-right text-[11px] font-bold tracking-[0.01em] uppercase', STATE_TONE[subsystem.state] ?? 'text-ink-3')}>
                  {subsystem.state}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line bg-base px-2.5 py-1.5">
            <span className="mono text-[11px] text-ink-4">ENGINE <span className="text-ink-2">{data!.engineVersion}</span></span>
            <span className="mono text-[11px] text-ink-4">RULESET <span className="text-ink-2">{data!.rulesetVersion}</span></span>
            <span className="mono text-[11px] text-ink-4">SYNC <span className="text-ink-2">{formatRelative(data!.lastRuleSync)}</span></span>
            <span className="mono text-[11px] text-ink-4">DB <span className={cn(data!.database.status === 'connected' ? 'text-term' : 'text-medium')}>{data!.database.status.toUpperCase()}</span></span>
          </div>
        </>
      )}
    </Panel>
  );
}
