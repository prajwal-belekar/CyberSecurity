import { AlarmClock, CheckCircle2, CircleAlert, FileSearch, ShieldCheck, Timer } from 'lucide-react';
import { StatTile } from '@/components/ui/StatTile';
import { Meter } from '@/components/ui/Meter';
import { useIncidentSummary } from '@/hooks/useIncidents';
import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';
import type { IncidentStatus } from '@/types/incident';

type Tone = 'critical' | 'high' | 'medium' | 'term' | 'cyber';

const COLUMNS: Array<{ key: IncidentStatus; label: string; icon: ReactNode; tone: Tone }> = [
  { key: 'open', label: 'Open', icon: <CircleAlert className="size-4" aria-hidden />, tone: 'critical' },
  { key: 'investigating', label: 'Investigating', icon: <FileSearch className="size-4" aria-hidden />, tone: 'high' },
  { key: 'contained', label: 'Contained', icon: <ShieldCheck className="size-4" aria-hidden />, tone: 'medium' },
  { key: 'resolved', label: 'Resolved', icon: <CheckCircle2 className="size-4" aria-hidden />, tone: 'term' },
  { key: 'false_positive', label: 'False Positive', icon: <AlarmClock className="size-4" aria-hidden />, tone: 'cyber' },
];

/** Status counters plus MTTR and SLA breach metrics for the incident queue. */
export function IncidentStats({ active, onSelect }: { active?: IncidentStatus | 'all'; onSelect?: (status: IncidentStatus | 'all') => void }) {
  const { data, isLoading } = useIncidentSummary();

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
      {COLUMNS.map((column) => {
        const selected = active === column.key;
        return (
          <StatTile
            key={column.key}
            loading={isLoading}
            label={column.label}
            value={data?.[column.key] ?? 0}
            icon={column.icon}
            tone={column.tone}
            onClick={onSelect ? () => onSelect(selected ? 'all' : column.key) : undefined}
            className={cn(onSelect && 'cursor-pointer', selected && 'ring-1 ring-term/60')}
            aria-pressed={onSelect ? selected : undefined}
          />
        );
      })}
      <StatTile
        loading={isLoading}
        label="Mean Time To Resolve"
        value={data ? `${data.mttrHours.toFixed(1)}h` : '—'}
        icon={<Timer className="size-4" aria-hidden />}
        tone={data && data.mttrHours > 12 ? 'high' : 'term'}
        description={data ? `${data.slaBreaches} SLA breach${data.slaBreaches === 1 ? '' : 'es'} this period` : undefined}
        footer={<Meter value={data ? Math.min(100, (data.mttrHours / 24) * 100) : 0} tone={data && data.mttrHours > 12 ? 'warn' : 'term'} label="OF 24H TARGET" />}
      />
    </div>
  );
}
