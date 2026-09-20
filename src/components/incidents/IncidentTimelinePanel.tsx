import { History } from 'lucide-react';
import { Timeline, type TimelineItem } from '@/components/ui/Timeline';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatClockShort } from '@/utils/dates';
import type { IncidentTimelineEntry } from '@/types/incident';

const KIND_META: Record<IncidentTimelineEntry['kind'], { tone: TimelineItem['tone']; glyph: string }> = {
  detection: { tone: 'critical', glyph: 'DETECTION' },
  escalation: { tone: 'high', glyph: 'ESCALATION' },
  action: { tone: 'cyber', glyph: 'ACTION' },
  note: { tone: 'neutral', glyph: 'NOTE' },
  system: { tone: 'neutral', glyph: 'SYSTEM' },
  resolution: { tone: 'term', glyph: 'RESOLUTION' },
};

/** Forensic timeline of the incident, newest last, grouped by entry kind. */
export function IncidentTimelinePanel({ timeline }: { timeline: IncidentTimelineEntry[] }) {
  if (!timeline.length) {
    return <EmptyState compact icon={<History className="size-4" aria-hidden />} title="No timeline entries" description="Actions and detections will appear here as the case progresses." />;
  }

  const items: TimelineItem[] = [...timeline]
    .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp))
    .map((entry) => {
      const meta = KIND_META[entry.kind];
      return {
        id: entry.id,
        time: entry.time || formatClockShort(entry.timestamp),
        timestamp: entry.timestamp,
        tone: meta.tone,
        title: (
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[11.5px] font-medium text-ink">{entry.title}</span>
            <span className="mono text-[10.5px] font-bold tracking-[0.02em] text-ink-4 uppercase">{meta.glyph}</span>
          </span>
        ),
        detail: (
          <span className="mono block text-[10.5px] leading-relaxed break-words text-ink-3">
            {entry.detail}
            {entry.actor ? <span className="ml-1.5 text-ink-4">— {entry.actor}</span> : null}
          </span>
        ),
        actor: entry.actor,
      };
    });

  return <Timeline items={items} dense />;
}
