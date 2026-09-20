import { Link } from 'react-router-dom';
import { Crosshair, ExternalLink, FileSearch, Layers, Plus, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { SeverityBadge } from '@/components/ui/Badge';
import { SectionRule } from '@/components/ui/KeyValue';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatClockShort } from '@/utils/dates';
import type { InvestigationContext } from '@/types/ai';
import type { Incident } from '@/types/incident';
import type { SecurityEvent } from '@/types/threat';

const WINDOWS = ['1H', '6H', '24H', '7D', '30D'];

export interface EvidencePanelProps {
  context: InvestigationContext;
  incidents: Incident[];
  incidentsLoading: boolean;
  events: SecurityEvent[];
  onContextChange: (patch: Partial<InvestigationContext>) => void;
  onAttachEvent: (eventId: string) => void;
  onDetachEvent: (eventId: string) => void;
  onScopeAll: () => void;
}

/**
 * The evidence rail: what the assistant is allowed to reason over. Attaching or
 * detaching a record changes the investigation context immediately.
 */
export function EvidencePanel({
  context, incidents, incidentsLoading, events,
  onContextChange, onAttachEvent, onDetachEvent, onScopeAll,
}: EvidencePanelProps) {
  const attached = events.filter((event) => context.attachedEventIds.includes(event.id));
  const candidates = events.filter((event) => !context.attachedEventIds.includes(event.id)).slice(0, 8);
  const incident = incidents.find((candidate) => candidate.id === context.incidentId);

  return (
    <div className="min-w-0">
      <SectionRule className="mb-1.5"><span className="flex items-center gap-1.5"><Layers className="size-3" aria-hidden />Investigation scope</span></SectionRule>

      <label className="label-xs mb-1 block" htmlFor="ai-incident-scope">Incident context</label>
      <Select
        id="ai-incident-scope"
        compact
        value={context.incidentId ?? ''}
        disabled={incidentsLoading}
        onChange={(event) => {
          const value = event.target.value;
          const next = incidents.find((candidate) => candidate.id === value);
          onContextChange({
            incidentId: value || undefined,
            incidentTitle: next?.title,
            severity: next?.severity,
            source: next?.source,
            target: next?.target,
            threatId: undefined,
          });
        }}
        options={[
          { value: '', label: 'UNSCOPED (whole environment)' },
          ...incidents.map((candidate) => ({ value: candidate.id, label: `${candidate.id} · ${candidate.title}` })),
        ]}
      />

      {incident ? (
        <div className="mt-2 rounded-[2px] border border-line-2 bg-base p-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mono text-[11px] font-bold text-term">{incident.id}</span>
            <SeverityBadge severity={incident.severity} showGlyph={false} />
            <span className="mono ml-auto text-[10.5px] text-ink-4 uppercase">{incident.priority}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-ink-2">{incident.title}</p>
          <dl className="mono mt-1.5 space-y-0.5 text-[11px]">
            <div className="flex items-baseline gap-1.5"><dt className="text-ink-4">Source</dt><dd className="min-w-0 flex-1 truncate text-cyber">{incident.source}</dd></div>
            <div className="flex items-baseline gap-1.5"><dt className="text-ink-4">Target</dt><dd className="min-w-0 flex-1 truncate text-high">{incident.target}</dd></div>
            <div className="flex items-baseline gap-1.5"><dt className="text-ink-4">Owner</dt><dd className="min-w-0 flex-1 truncate text-ink-3">{incident.assignedTo ?? 'UNASSIGNED'}</dd></div>
          </dl>
          <Link to={`/incidents/${incident.id}`} className="mono mt-1.5 inline-flex items-center gap-1 text-[11px] text-ai transition-colors hover:text-ink">
            Open case file<ExternalLink className="size-2.5" aria-hidden />
          </Link>
        </div>
      ) : null}

      <div className="mt-2.5">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="label-xs">Time window</span>
          <span className="mono text-[10.5px] text-ink-4">{context.timeWindow}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {WINDOWS.map((window_) => (
            <button
              key={window_}
              type="button"
              aria-pressed={context.timeWindow === window_}
              onClick={() => onContextChange({ timeWindow: window_ })}
              className={cn(
                'mono rounded-[2px] border px-1.5 py-[2px] text-[11px] font-semibold tracking-[0.01em] transition-colors',
                context.timeWindow === window_ ? 'border-ai/45 bg-ai/10 text-ai' : 'border-line-2 text-ink-4 hover:border-line-3 hover:text-ink-2',
              )}
            >
              {window_}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2.5">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="label-xs flex items-center gap-1.5"><FileSearch className="size-2.5" aria-hidden />Attached evidence</span>
          <span className="mono tnum text-[11px] text-ai">{context.attachedEventIds.length}</span>
        </div>

        {attached.length ? (
          <ul className="space-y-px">
            {attached.map((event) => (
              <li key={event.id} className="flex items-start gap-1.5 rounded-[2px] border border-line bg-base px-2 py-1.5">
                <span className="mono mt-px shrink-0 text-[11px] font-bold text-term">{event.id}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10.5px] text-ink-2">{event.description ?? event.type}</p>
                  <p className="mono truncate text-[10.5px] text-ink-4">
                    {formatClockShort(event.timestamp)} · {event.source}{event.target ? ` → ${event.target}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDetachEvent(event.id)}
                  aria-label={`Detach ${event.id} from the investigation`}
                  className="mono mt-px flex size-4 shrink-0 items-center justify-center rounded-[2px] text-ink-4 transition-colors hover:bg-critical/10 hover:text-critical"
                >
                  <X className="size-2.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-[2px] border border-dashed border-line px-2 py-3 text-center text-[11px] tracking-[0.01em] text-ink-4">
            No records attached
          </p>
        )}

        {candidates.length ? (
          <div className="mt-1.5">
            <span className="label-xs mb-1 block">Available to attach</span>
            <ul className="space-y-px">
              {candidates.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => onAttachEvent(event.id)}
                    className="group flex w-full items-center gap-1.5 rounded-[2px] border border-transparent px-2 py-1 text-left transition-colors hover:border-line-2 hover:bg-base"
                  >
                    <span className="mono shrink-0 text-[11px] text-ink-4 group-hover:text-term">{event.id}</span>
                    <span className="mono min-w-0 flex-1 truncate text-[11px] text-ink-3">{event.description ?? event.type}</span>
                    <Plus className="size-2.5 shrink-0 text-ink-4 group-hover:text-term" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-2 flex flex-wrap gap-1.5">
          <Button variant="secondary" size="xs" icon={<Crosshair className="size-3" aria-hidden />} onClick={onScopeAll} disabled={!events.length}>
            Attach all correlated
          </Button>
          {context.attachedEventIds.length ? (
            <Button variant="ghost" size="xs" icon={<X className="size-3" aria-hidden />} onClick={() => onContextChange({ attachedEventIds: [] })}>
              Detach all
            </Button>
          ) : null}
        </div>
      </div>

      {incidentsLoading ? <Skeleton className="mt-2.5 h-16 w-full" /> : null}
      {!incidentsLoading && !incidents.length ? (
        <div className="mt-2.5">
          <EmptyState compact icon={<Layers className="size-4" aria-hidden />} title="No incidents on record" description="The assistant will reason over environment-wide telemetry instead." />
        </div>
      ) : null}
    </div>
  );
}
