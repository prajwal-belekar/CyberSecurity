import { cn } from '@/utils/cn';
import { blockMeter } from '@/utils/formatting';

export type MeterTone = 'term' | 'cyber' | 'warn' | 'err' | 'ai' | 'volt' | 'neutral';

const TONE_BG: Record<MeterTone, string> = {
  term: 'bg-term', cyber: 'bg-cyber', warn: 'bg-medium', err: 'bg-critical',
  ai: 'bg-ai', volt: 'bg-volt', neutral: 'bg-ink-3',
};
const TONE_TEXT: Record<MeterTone, string> = {
  term: 'text-term', cyber: 'text-cyber', warn: 'text-medium', err: 'text-critical',
  ai: 'text-ai', volt: 'text-volt', neutral: 'text-ink-3',
};

export interface MeterProps {
  value: number;
  max?: number;
  tone?: MeterTone;
  label?: string;
  suffix?: string;
  /** Render as a block-character HUD meter (████░░░░ 72%). */
  blocks?: boolean;
  width?: number;
  className?: string;
  showValue?: boolean;
}

/** Compact utilisation / threat-level meter. */
export function Meter({
  value, max = 100, tone = 'term', label, suffix = '%', blocks, width = 10, className, showValue = true,
}: MeterProps) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  if (blocks) {
    return (
      <span className={cn('meter inline-flex items-center gap-1.5', TONE_TEXT[tone], className)}>
        {label ? <span className="label-xs text-ink-4">{label}</span> : null}
        <span aria-hidden>{blockMeter(percent, width)}</span>
        {showValue ? <span className="tnum">{Math.round(percent)}{suffix}</span> : null}
        <span className="sr-only">{label ? `${label}: ` : ''}{Math.round(percent)}{suffix}</span>
      </span>
    );
  }

  return (
    <div className={cn('min-w-0', className)}>
      {label ? (
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="label-xs truncate">{label}</span>
          {showValue ? <span className={cn('mono tnum text-[10.5px]', TONE_TEXT[tone])}>{Math.round(percent)}{suffix}</span> : null}
        </div>
      ) : null}
      <div
        className="h-1.5 w-full overflow-hidden rounded-[1px] bg-raised"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'utilisation'}
      >
        <div
          className={cn('h-full transition-[width] duration-500 ease-out', TONE_BG[tone])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/** Indeterminate scan bar used by the scanner / analyzer pipelines. */
export function ScanBar({ className, tone = 'cyber' }: { className?: string; tone?: MeterTone }) {
  return (
    <div className={cn('relative h-[3px] w-full overflow-hidden rounded-[1px] bg-raised', className)}>
      <div className={cn('absolute inset-y-0 w-1/3 animate-sweep', TONE_BG[tone], 'opacity-70')} />
    </div>
  );
}
