import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { EventChannel, SecurityEvent } from '@/types/threat';
import { Tabs } from '@/components/ui/Tabs';
import { useLive } from '@/store/LiveContext';
import { formatClock } from '@/utils/dates';
import { severityMeta } from '@/utils/severity';
import { EmptyState } from '@/components/ui/EmptyState';
import { Radio } from 'lucide-react';

const CHANNEL_TONE: Record<string, string> = {
  SYSTEM: 'text-ink-3',
  INFO: 'text-info',
  AUTH: 'text-cyber',
  NET: 'text-cyber',
  WARN: 'text-medium',
  ALERT: 'text-high',
  THREAT: 'text-critical',
  INCIDENT: 'text-critical',
  INTEL: 'text-ai',
  SCAN: 'text-term',
  AI: 'text-ai',
};

/** Channel filter for the stream (spec §11). `channels: null` means "everything". */
export type StreamFilter =
  | 'ALL' | 'INFO' | 'AUTH' | 'NET' | 'WARN' | 'THREAT' | 'INCIDENT' | 'INTEL';

const STREAM_FILTERS: ReadonlyArray<{
  value: StreamFilter;
  label: string;
  channels: readonly EventChannel[] | null;
}> = [
  { value: 'ALL', label: 'All', channels: null },
  { value: 'INFO', label: 'Info', channels: ['INFO', 'SYSTEM'] },
  { value: 'AUTH', label: 'Auth', channels: ['AUTH'] },
  { value: 'NET', label: 'Network', channels: ['NET', 'SCAN'] },
  { value: 'WARN', label: 'Warning', channels: ['WARN', 'ALERT'] },
  { value: 'THREAT', label: 'Threat', channels: ['THREAT'] },
  { value: 'INCIDENT', label: 'Incident', channels: ['INCIDENT'] },
  { value: 'INTEL', label: 'Intel', channels: ['INTEL'] },
];

export interface EventStreamProps {
  /** Maximum rendered rows — the stream stays cheap even after hours of uptime. */
  limit?: number;
  className?: string;
  /** Clicking a row opens the shared investigation drawer. */
  onSelect?: (event: SecurityEvent) => void;
  showHeader?: boolean;
  /** Height cap; content scrolls internally. */
  maxHeight?: number | string;
  compact?: boolean;
}

/**
 * Live terminal event feed. New rows animate in once, severity colours the
 * channel tag, and the stream never auto-scrolls away from something the
 * analyst is reading (pinned to bottom only while already at the bottom).
 */
export function EventStream({
  limit = 40, className, onSelect, showHeader = true, maxHeight = 260, compact,
}: EventStreamProps) {
  const { stream, connected, pause, resume, paused } = useLive();
  const [pinned, setPinned] = useState(true);
  const [filter, setFilter] = useState<StreamFilter>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = STREAM_FILTERS.find((f) => f.value === filter) ?? STREAM_FILTERS[0];
  const matches = (event: SecurityEvent) =>
    active.channels === null || active.channels.includes(event.channel);

  // Counts are taken over the whole buffer, not the rendered window, so the
  // chips stay truthful even when `limit` truncates the list.
  const counts = STREAM_FILTERS.map((f) => ({
    value: f.value,
    label: f.label,
    count: f.channels === null
      ? stream.length
      : stream.filter((e) => f.channels?.includes(e.channel)).length,
  }));

  const rows = stream.filter(matches).slice(0, limit);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !pinned) return;
    el.scrollTop = 0;
  }, [rows.length, pinned]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setPinned(el.scrollTop < 24);
  };

  return (
    <div className={cn('flex min-h-0 min-w-0 flex-col bg-void', className)}>
      {showHeader ? (
        <div className="flex shrink-0 items-center gap-2 border-b border-line bg-base px-2.5 py-1">
          <Radio className={cn('size-3', connected ? 'text-term' : 'text-ink-4')} aria-hidden />
          <span className="text-[11px] font-medium text-ink-2">Live event stream</span>
          <span className={cn('size-1.5 rounded-full', connected ? 'bg-term text-term' : 'bg-ink-4 text-ink-4')} aria-hidden />
          <span className="flex-1" />
          {!pinned ? (
            <button
              type="button"
              onClick={() => { setPinned(true); if (scrollRef.current) scrollRef.current.scrollTop = 0; }}
              className="mono rounded-[2px] border border-line-2 px-1.5 py-px text-[10.5px] tracking-[0.01em] text-ink-3 uppercase transition-colors hover:border-term/40 hover:text-term"
            >
              Follow
            </button>
          ) : null}
          <button
            type="button"
            onClick={paused ? resume : pause}
            aria-label={paused ? 'Resume event stream' : 'Pause event stream'}
            className="inline-flex size-5 items-center justify-center rounded-[2px] text-ink-4 transition-colors hover:bg-raised hover:text-term"
          >
            {paused ? <Play className="size-3" aria-hidden /> : <Pause className="size-3" aria-hidden />}
          </button>
        </div>
      ) : null}

      {showHeader ? (
        <div className="shrink-0 border-b border-line bg-base px-2 py-1">
          <Tabs
            items={counts}
            value={filter}
            onChange={setFilter}
            size="sm"
            scrollable
            ariaLabel="Filter event stream by channel"
          />
        </div>
      ) : null}

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1.5 py-1"
        style={{ maxHeight }}
        role="log"
        aria-live="polite"
        aria-label="Live security event stream"
        aria-relevant="additions"
      >
        {!rows.length ? (
          <EmptyState
            compact
            icon={<Radio className="size-4" aria-hidden />}
            title={filter === 'ALL' ? 'Awaiting events' : `No ${active.label.toLowerCase()} events`}
            description={
              filter === 'ALL'
                ? 'The event stream is connected. New detections will appear here as they are correlated.'
                : 'Nothing on this channel in the current buffer. Switch back to All, or wait for the next correlated detection.'
            }
            prompt={filter === 'ALL'}
          />
        ) : (
          <ul className="space-y-px">
            <AnimatePresence initial={false}>
              {rows.map((event) => {
                const meta = severityMeta(event.severity);
                const tone = CHANNEL_TONE[event.channel] ?? 'text-ink-3';
                const alert = event.severity === 'critical' || event.severity === 'high';
                return (
                  <motion.li
                    key={event.id}
                    layout={false}
                    initial={{ opacity: 0, x: -6, backgroundColor: `${meta.hex}1f` }}
                    animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(0,0,0,0)' }}
                    transition={{ duration: alert ? 0.65 : 0.4, ease: 'easeOut' }}
                    className={cn(
                      'term-line flex items-baseline gap-x-2 gap-y-0.5 rounded-[1px] px-1',
                      compact ? 'py-0' : 'py-[2px]',
                      onSelect && 'cursor-pointer hover:bg-panel-2',
                      alert && !compact && 'border-l border-l-current',
                    )}
                    style={alert ? { borderLeftColor: meta.hex } : undefined}
                    onClick={onSelect ? () => onSelect(event) : undefined}
                    onKeyDown={onSelect ? (e) => { if (e.key === 'Enter') onSelect(event); } : undefined}
                    tabIndex={onSelect ? 0 : undefined}
                    role={onSelect ? 'button' : undefined}
                  >
                    <span className="mono tnum shrink-0 text-[10.5px] text-ink-4">{formatClock(event.timestamp)}</span>
                    <span className={cn('mono shrink-0 text-[10.5px] font-bold', tone)}>[{event.channel}]</span>
                    <span className={cn('min-w-0 flex-1 truncate text-[11px]', alert ? 'text-ink' : 'text-ink-2')}>
                      {event.type}
                      {event.source ? <span className="text-ink-4"> :: {event.source}</span> : null}
                    </span>
                    <span
                      className={cn('mono hidden shrink-0 text-[10.5px] font-bold tracking-[0.01em] sm:inline', meta.text)}
                      title={`Severity: ${meta.label}`}
                    >
                      {meta.short}
                    </span>
                    <span className="sr-only">{meta.label} severity</span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
