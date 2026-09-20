import type { ReactNode } from 'react';
import { Activity, Cpu, Pause, Play, Radio, Terminal, Wifi } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useLive } from '@/store/LiveContext';
import { useUI } from '@/store/UIContext';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatNumber } from '@/utils/formatting';
import { API_MODE } from '@/services/api';

function StatusItem({ icon, label, value, tone = 'text-ink-3' }: { icon?: ReactNode; label: string; value?: string; tone?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1 whitespace-nowrap">
      {icon ? <span className="text-ink-4" aria-hidden>{icon}</span> : null}
      <span className="mono text-[11px] tracking-[0.01em] text-ink-4 uppercase">{label}</span>
      {value ? <span className={cn('mono tnum text-[11px] font-semibold', tone)}>{value}</span> : null}
    </span>
  );
}

/** Unobtrusive footer telemetry strip shown on every workspace. */
export function StatusBar() {
  const { metrics, connected, paused, pause, resume, stream, lastEventAt } = useLive();
  const { toggleTerminalDock, terminalDockOpen } = useUI();

  const latencyTone = metrics.latencyMs > 45 ? 'text-medium' : 'text-term';
  const loadTone = metrics.cpu > 80 ? 'text-critical' : metrics.cpu > 60 ? 'text-medium' : 'text-term';

  return (
    <footer className="flex h-6 shrink-0 items-center gap-3 overflow-x-auto border-t border-line bg-void px-2 no-scrollbar sm:gap-4 sm:px-3">
      <span className="flex shrink-0 items-center gap-1.5">
        <span className={cn('size-1.5 rounded-full', connected ? 'bg-term text-term' : 'bg-medium text-medium')} aria-hidden />
        <span className={cn('mono text-[11px] font-bold tracking-[0.02em] uppercase', connected ? 'text-term' : 'text-medium')}>
          {connected ? 'ONLINE' : 'PAUSED'}
        </span>
      </span>

      <span className="h-3 w-px shrink-0 bg-line" aria-hidden />

      <StatusItem icon={<Radio className="size-3" aria-hidden />} label="EVENT STREAM" value={connected ? 'CONNECTED' : 'HALTED'} tone={connected ? 'text-cyber' : 'text-medium'} />
      <StatusItem icon={<Activity className="size-3" aria-hidden />} label="LATENCY" value={`${metrics.latencyMs}ms`} tone={latencyTone} />
      <StatusItem icon={<Cpu className="size-3" aria-hidden />} label="CPU" value={`${metrics.cpu}%`} tone={loadTone} />
      <StatusItem icon={<Wifi className="size-3" aria-hidden />} label="NET" value={`${metrics.netMbps} MB/s`} tone="text-cyber" />
      <StatusItem label="EVENTS" value={formatNumber(metrics.totalEvents)} tone="text-ink-2" />

      <span className="hidden items-center gap-1 sm:flex">
        <span className="mono text-[11px] tracking-[0.01em] text-ink-4 uppercase">FEED</span>
        <span className="mono tnum text-[11px] text-ink-3">{stream.length}</span>
      </span>

      <span className="flex-1" />

      {lastEventAt ? (
        <span className="mono hidden shrink-0 text-[11px] text-ink-4 md:inline">
          LAST {new Date(lastEventAt).toLocaleTimeString('en-GB')}
        </span>
      ) : null}

      <span className="mono hidden shrink-0 rounded-[2px] border border-line-2 px-1 text-[10.5px] tracking-[0.01em] text-ink-4 uppercase xl:inline">
        {API_MODE === 'mock' ? 'MOCK API' : 'LIVE API'}
      </span>

      <div className="flex shrink-0 items-center gap-0.5">
        <Tooltip content={paused ? 'Resume live simulation' : 'Pause live simulation'} side="top">
          <button
            type="button"
            onClick={paused ? resume : pause}
            aria-label={paused ? 'Resume live event simulation' : 'Pause live event simulation'}
            className="inline-flex size-5 items-center justify-center rounded-[2px] text-ink-4 transition-colors hover:bg-raised hover:text-term"
          >
            {paused ? <Play className="size-3" aria-hidden /> : <Pause className="size-3" aria-hidden />}
          </button>
        </Tooltip>
        <Tooltip content={terminalDockOpen ? 'Hide terminal dock' : 'Show terminal dock'} side="top">
          <button
            type="button"
            onClick={toggleTerminalDock}
            aria-label={terminalDockOpen ? 'Hide terminal dock' : 'Show terminal dock'}
            aria-pressed={terminalDockOpen}
            className={cn(
              'inline-flex size-5 items-center justify-center rounded-[2px] transition-colors',
              terminalDockOpen ? 'text-term hover:bg-term/10' : 'text-ink-4 hover:bg-raised hover:text-ink',
            )}
          >
            <Terminal className="size-3" aria-hidden />
          </button>
        </Tooltip>
      </div>
    </footer>
  );
}
