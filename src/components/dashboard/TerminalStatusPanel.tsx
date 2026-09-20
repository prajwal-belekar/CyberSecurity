import { TerminalSquare } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { TerminalBlock } from '@/components/ui/Terminal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { useLive } from '@/store/LiveContext';
import { formatNumber } from '@/utils/formatting';

/**
 * Read-only status console on the dashboard. Mirrors `system status` output —
 * visual terminal styling only, no command execution.
 */
export function TerminalStatusPanel() {
  const { data, isLoading } = useSystemHealth();
  const { metrics, connected } = useLive();

  const rows = data?.subsystems ?? [];

  return (
    <Panel title="System Console" icon={<TerminalSquare className="size-3.5" aria-hidden />} noPadding className="min-w-0">
      <div className="p-2.5">
        {isLoading ? (
          <Skeleton className="h-[168px] w-full" />
        ) : (
          <TerminalBlock title="SYSTEM STATUS" maxHeight={188} showCaret bodyClassName="text-[11px]">
            <div className="text-ink-3">&gt; system status</div>
            <div className="my-1 h-px bg-line" aria-hidden />
            {rows.map((row) => (
              <div key={row.id} className="flex items-baseline gap-2">
                <span className="shrink-0 text-ink-2">{row.name}</span>
                <span className="h-px min-w-4 flex-1 bg-line" aria-hidden />
                <span className={
                  row.state === 'online' ? 'text-term'
                    : row.state === 'ready' ? 'text-cyber'
                      : row.state === 'degraded' ? 'text-medium' : 'text-critical'
                }>
                  {row.state.toUpperCase()}
                </span>
              </div>
            ))}
            <div className="my-1 h-px bg-line" aria-hidden />
            <div className="text-ink-4">
              CPU <span className="text-ink-2">{metrics.cpu}%</span> · MEM <span className="text-ink-2">{metrics.mem}%</span> · NET{' '}
              <span className="text-ink-2">{metrics.netMbps} MB/s</span> · EVENTS <span className="text-ink-2">{formatNumber(metrics.totalEvents)}</span>
            </div>
            <div className={connected ? 'text-term' : 'text-medium'}>
              {connected ? '[✓] Event stream connected' : '[!] Event stream paused'}
            </div>
          </TerminalBlock>
        )}
      </div>
    </Panel>
  );
}
