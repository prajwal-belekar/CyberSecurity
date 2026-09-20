import { useQuery } from '@tanstack/react-query';
import { GitBranch, ShieldAlert } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { Timeline } from '@/components/ui/Timeline';
import { SeverityBadge, Badge } from '@/components/ui/Badge';
import { SkeletonText } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CopyButton } from '@/components/ui/CopyButton';
import { authenticationApi } from '@/services/authenticationApi';
import { queryKeys } from '@/services/queryKeys';
import { formatClockShort, formatRelative } from '@/utils/dates';
import { cn } from '@/utils/cn';
import type { AuthSequence } from '@/types/authentication';

const OUTCOME_META: Record<AuthSequence['outcome'], { label: string; tone: 'critical' | 'high' | 'medium' | 'term' }> = {
  compromised: { label: 'COMPROMISED', tone: 'critical' },
  blocked: { label: 'BLOCKED', tone: 'critical' },
  abandoned: { label: 'ABANDONED', tone: 'high' },
  recovered: { label: 'RECOVERED', tone: 'term' },
};

/**
 * Suspicious authentication sequences rendered as forensic timelines — the
 * escalating-failure view an analyst needs when triaging credential attacks.
 */
export function LoginTimeline({ limit = 2 }: { limit?: number }) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.authSequences(),
    queryFn: () => authenticationApi.sequences(),
  });

  const sequences = (data ?? []).slice(0, limit);

  return (
    <Panel
      title="Suspicious Authentication Sequences"
      icon={<GitBranch className="size-3.5" aria-hidden />}
      className="min-w-0"
      noPadding
    >
      {isLoading ? (
        <div className="p-3"><SkeletonText lines={6} /></div>
      ) : isError ? (
        <ErrorState compact title="Unable to load sequences" message={(error as Error).message} onRetry={() => refetch()} />
      ) : !sequences.length ? (
        <EmptyState compact icon={<ShieldAlert className="size-4" aria-hidden />} title="No suspicious sequences" description="No multi-attempt authentication patterns are currently flagged." />
      ) : (
        <div className="divide-y divide-line">
          {sequences.map((sequence) => {
            const outcome = OUTCOME_META[sequence.outcome];
            return (
              <article key={sequence.id} className="min-w-0 p-2.5">
                <header className="flex flex-wrap items-center gap-2">
                  <span className="mono text-[11px] font-bold tracking-[0.01em] text-term">{sequence.id}</span>
                  <SeverityBadge severity={sequence.risk} />
                  <Badge tone={outcome.tone === 'critical' ? 'err' : outcome.tone === 'high' ? 'warn' : 'term'}>{outcome.label}</Badge>
                  <span className="mono text-[10.5px] text-ink-2">{sequence.user}</span>
                  <span className="mono flex items-center gap-1 text-[10.5px] text-cyber">
                    {sequence.ip}<CopyButton value={sequence.ip} label={`Copy ${sequence.ip}`} />
                  </span>
                  <span className="flex-1" />
                  <span className="mono tnum text-[11px] text-ink-4">{sequence.attempts} ATTEMPTS</span>
                  <span className="mono text-[11px] text-ink-4">{formatRelative(sequence.startedAt)}</span>
                </header>

                <p className="mono mt-1.5 rounded-[2px] border border-line bg-base px-2 py-1 text-[10.5px] leading-relaxed text-ink-3">
                  PATTERN :: {sequence.pattern}
                </p>

                <div className="mt-2">
                  <Timeline
                    dense
                    items={sequence.events.slice(0, 6).map((event) => ({
                      id: event.id,
                      time: formatClockShort(event.timestamp),
                      title: `${event.status.replace('_', ' ').toUpperCase()} · ${event.user}`,
                      detail: `${event.method.toUpperCase()} from ${event.ip} · ${event.device}${event.failureReason ? ` · ${event.failureReason}` : ''}`,
                      tone: event.risk === 'critical' ? 'critical' : event.risk === 'high' ? 'high' : event.risk === 'medium' ? 'medium' : 'neutral',
                    }))}
                  />
                </div>

                <div className="mono mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-4">
                  <span>WINDOW {formatClockShort(sequence.startedAt)} → {formatClockShort(sequence.endedAt)}</span>
                  <span className={cn('font-semibold uppercase', outcome.tone === 'term' ? 'text-term' : outcome.tone === 'high' ? 'text-high' : 'text-critical')}>
                    OUTCOME {outcome.label}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
