import { Loader2, ScanLine } from 'lucide-react';
import { cn } from '@/utils/cn';
import { StepLine } from '@/components/ui/Terminal';
import { ScanBar } from '@/components/ui/Meter';
import type { WebScanResult } from '@/types/websecurity';

export interface ScanProgressProps {
  steps: WebScanResult['scanSteps'];
  target?: string;
  running: boolean;
}

/** Animated scan pipeline: Initializing → configuration → headers → cookies → findings. */
export function ScanProgress({ steps, target, running }: ScanProgressProps) {
  const completed = steps.filter((s) => s.state === 'ok' || s.state === 'warning').length;
  const percent = Math.round((completed / Math.max(1, steps.length)) * 100);

  return (
    <div className="min-w-0 rounded-[2px] border border-line bg-void p-2.5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {running ? <Loader2 className="size-3.5 animate-spin text-cyber" aria-hidden /> : <ScanLine className="size-3.5 text-term" aria-hidden />}
        <span className="mono text-[11px] font-semibold tracking-[0.02em] text-ink-3 uppercase">
          {running ? 'SCAN IN PROGRESS' : 'SCAN COMPLETE'}
        </span>
        {target ? <span className="mono min-w-0 flex-1 truncate text-[10.5px] text-cyber">{target}</span> : <span className="flex-1" />}
        <span className="mono tnum text-[11px] text-ink-4">{percent}%</span>
      </div>

      <div className="space-y-0.5">
        {steps.map((step) => (
          <StepLine
            key={step.index}
            index={step.index}
            label={`${step.label}${step.state === 'pending' ? '..............' : '.........'}`}
            state={step.state}
            detail={step.state === 'ok' ? 'OK' : step.state === 'warning' ? 'FINDINGS' : step.state === 'running' ? 'working' : step.detail}
          />
        ))}
      </div>

      <div className="mt-2.5">
        {running ? (
          <ScanBar tone="cyber" />
        ) : (
          <div className="h-[3px] w-full overflow-hidden rounded-[1px] bg-raised">
            <div className={cn('h-full transition-[width] duration-500', percent === 100 ? 'bg-term' : 'bg-cyber')} style={{ width: `${percent}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
