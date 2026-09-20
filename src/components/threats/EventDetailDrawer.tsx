import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bot, FileSearch, Gavel, Layers, Link2, ListTree, ShieldCheck, Siren,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUI } from '@/store/UIContext';
import { useToast } from '@/store/ToastContext';
import { Drawer } from '@/components/ui/Drawer';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { KeyValueGrid, SectionRule } from '@/components/ui/KeyValue';
import { Timeline } from '@/components/ui/Timeline';
import { CopyButton } from '@/components/ui/CopyButton';
import { SkeletonText } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { eventsApi } from '@/services/eventsApi';
import { incidentsApi } from '@/services/incidentsApi';
import { queryKeys } from '@/services/queryKeys';
import { formatRelative, formatTimestamp } from '@/utils/dates';
import { severityMeta } from '@/utils/severity';
import type { SecurityEvent } from '@/types/threat';

/**
 * Right-side investigation drawer opened from any event row, stream entry or
 * dashboard card. Shows identity, evidence, chronology and the three analyst
 * actions: Investigate · Create Incident · Mark Reviewed.
 */
export function EventDetailDrawer({ event }: { event?: SecurityEvent | null }) {
  const { activeEvent, closeEvent, openEvent } = useUI();
  const target = event ?? activeEvent;
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [creatingIncident, setCreatingIncident] = useState(false);

  const relatedQuery = useQuery({
    queryKey: queryKeys.eventRelated(target?.id ?? 'none'),
    queryFn: () => eventsApi.related(target!),
    enabled: Boolean(target),
  });

  const statusMutation = useMutation({
    mutationFn: (status: SecurityEvent['status']) => eventsApi.setStatus(target!.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['threat-summary'] });
      toast.success('Event status updated', `${target?.id} marked as reviewed.`);
    },
    onError: (err: Error) => toast.error('Could not update event', err.message),
  });

  const escalateMutation = useMutation({
    mutationFn: () => incidentsApi.escalateToIncident(target!.id),
    onMutate: () => setCreatingIncident(true),
    onSuccess: (result) => {
      setCreatingIncident(false);
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (result?.incidentId) {
        toast.success('Incident created', `${result.incidentId} raised from ${target?.id}.`);
        closeEvent();
        navigate(`/incidents/${result.incidentId}`);
      }
    },
    onError: (err: Error) => {
      setCreatingIncident(false);
      toast.error('Could not create incident', err.message);
    },
  });

  const timeline = useMemo(() => {
    if (!target) return [];
    const related = relatedQuery.data ?? [];
    return [
      ...related
        .slice()
        .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp))
        .map((e) => ({
          id: e.id,
          time: formatTimestamp(e.timestamp).slice(11),
          title: e.type,
          detail: `${e.id} · ${e.source}${e.target ? ` → ${e.target}` : ''}`,
          tone: (e.severity === 'critical' || e.severity === 'high'
            ? e.severity === 'critical' ? 'critical' : 'high'
            : e.severity === 'medium' ? 'medium' : 'neutral') as 'critical' | 'high' | 'medium' | 'neutral',
          actor: e.detectionRule,
        })),
      {
        id: target.id,
        time: formatTimestamp(target.timestamp).slice(11),
        title: target.type,
        detail: `Selected event · ${target.description ?? 'No additional detail recorded.'}`,
        tone: (severityMeta(target.severity).rank >= 5 ? 'critical' : severityMeta(target.severity).rank >= 4 ? 'high' : severityMeta(target.severity).rank >= 3 ? 'medium' : 'term') as 'critical' | 'high' | 'medium' | 'term',
        actor: target.channel,
      },
    ].sort((a, b) => a.time.localeCompare(b.time));
  }, [target, relatedQuery.data]);

  return (
    <Drawer
      open={Boolean(target)}
      onClose={closeEvent}
      title="Event Details"
      subtitle={target ? `${target.id} · ${target.type}` : undefined}
      badge={target ? <SeverityBadge severity={target.severity} /> : undefined}
      footer={
        target ? (
          <>
            <Button
              variant="primary"
              size="sm"
              icon={<FileSearch className="size-3.5" aria-hidden />}
              onClick={() => {
                closeEvent();
                navigate(target.incidentId ? `/incidents/${target.incidentId}` : target.threatId ? `/threats/${target.threatId}` : '/threats');
              }}
            >
              Investigate
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Siren className="size-3.5" aria-hidden />}
              onClick={() => escalateMutation.mutate()}
              loading={creatingIncident || escalateMutation.isPending}
              disabled={Boolean(target.incidentId)}
            >
              {target.incidentId ? `Linked · ${target.incidentId}` : 'Create Incident'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<ShieldCheck className="size-3.5" aria-hidden />}
              onClick={() => statusMutation.mutate('resolved')}
              loading={statusMutation.isPending}
              disabled={target.status === 'resolved'}
            >
              Mark Reviewed
            </Button>
            <span className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              icon={<Bot className="size-3.5" aria-hidden />}
              onClick={() => {
                closeEvent();
                navigate(`/ai-assistant?event=${target.id}${target.incidentId ? `&incident=${target.incidentId}` : ''}`);
              }}
            >
              Ask AI
            </Button>
          </>
        ) : null
      }
    >
      {!target ? (
        <EmptyState icon={<Link2 className="size-4" aria-hidden />} title="No event selected" description="Select a row in any event table or stream to inspect it here." prompt />
      ) : (
        <div className="space-y-3 p-3">
          <KeyValueGrid
            columns={2}
            rows={[
              { label: 'Event ID', value: target.id, copy: target.id },
              { label: 'Event Type', value: target.type },
              { label: 'Severity', value: <SeverityBadge severity={target.severity} /> },
              { label: 'Status', value: <StatusBadge status={target.status} /> },
              { label: 'Source', value: target.source, copy: target.source },
              { label: 'Target', value: target.target ?? '—', copy: target.target },
              { label: 'Channel', value: target.channel },
              { label: 'Detection Rule', value: target.detectionRule ?? '—', span: true },
              { label: 'Timestamp', value: formatTimestamp(target.timestamp), span: true },
              { label: 'Observed', value: formatRelative(target.timestamp), span: true },
            ]}
          />

          {target.description ? (
            <div className="panel-inset p-2.5">
              <SectionRule>Description</SectionRule>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-2">{target.description}</p>
            </div>
          ) : null}

          {target.metadata && Object.keys(target.metadata).length ? (
            <div>
              <SectionRule className="mb-1.5">Metadata</SectionRule>
              <KeyValueGrid
                columns={2}
                rows={Object.entries(target.metadata).map(([key, value]) => ({
                  label: key.replace(/_/g, ' '),
                  value: String(value),
                  mono: true,
                  copy: typeof value === 'string' ? value : undefined,
                }))}
              />
            </div>
          ) : null}

          <div>
            <SectionRule className="mb-1.5" right={<span className="mono">{relatedQuery.data?.length ?? 0} related</span>}>
              EVIDENCE
            </SectionRule>
            {relatedQuery.isLoading ? (
              <SkeletonText lines={3} />
            ) : relatedQuery.isError ? (
              <ErrorState compact title="Unable to load related events" message={(relatedQuery.error as Error).message} onRetry={() => relatedQuery.refetch()} />
            ) : !relatedQuery.data?.length ? (
              <EmptyState compact icon={<Layers className="size-4" aria-hidden />} title="No correlated events" description="No other events share this source, target or detection context yet." />
            ) : (
              <ul className="space-y-px">
                {relatedQuery.data.map((related) => {
                  const meta = severityMeta(related.severity);
                  return (
                    <li key={related.id}>
                      <button
                        type="button"
                        onClick={() => openEvent(related)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-[2px] border border-transparent px-2 py-1.5 text-left transition-colors',
                          'hover:border-line-2 hover:bg-panel-2',
                        )}
                      >
                        <span className={cn('mono shrink-0 text-[11px] font-bold', meta.text)}>{meta.short}</span>
                        <span className="mono shrink-0 text-[11px] text-ink-4">{related.id}</span>
                        <span className="min-w-0 flex-1 truncate text-[11px] text-ink-2">{related.type}</span>
                        <span className="mono hidden shrink-0 text-[11px] text-ink-4 sm:inline">{formatRelative(related.timestamp)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <SectionRule className="mb-1.5">
              <span className="flex items-center gap-1.5"><ListTree className="size-3" aria-hidden /> TIMELINE</span>
            </SectionRule>
            <Timeline items={timeline} dense />
          </div>

          {target.incidentId || target.threatId ? (
            <div>
              <SectionRule className="mb-1.5">Correlation</SectionRule>
              <div className="flex flex-wrap gap-1.5">
                {target.threatId ? (
                  <button
                    type="button"
                    onClick={() => { closeEvent(); navigate(`/threats/${target.threatId}`); }}
                    className="mono inline-flex items-center gap-1 rounded-[2px] border border-high/35 bg-high/10 px-2 py-1 text-[11px] tracking-[0.01em] text-high uppercase transition-colors hover:bg-high/20"
                  >
                    <Gavel className="size-3" aria-hidden /> {target.threatId}
                  </button>
                ) : null}
                {target.incidentId ? (
                  <button
                    type="button"
                    onClick={() => { closeEvent(); navigate(`/incidents/${target.incidentId}`); }}
                    className="mono inline-flex items-center gap-1 rounded-[2px] border border-critical/35 bg-critical/10 px-2 py-1 text-[11px] tracking-[0.01em] text-critical uppercase transition-colors hover:bg-critical/20"
                  >
                    <Siren className="size-3" aria-hidden /> {target.incidentId}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-2">
            <span className="text-[11px] tracking-[0.01em] text-ink-4">Quick copy</span>
            <CopyButton value={target.id} withValue label="Copy event ID" />
            <CopyButton value={target.source} withValue label="Copy source address" />
          </div>
        </div>
      )}
    </Drawer>
  );
}
