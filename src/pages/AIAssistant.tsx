import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Brain, Eraser, Layers, Sparkles, Terminal } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionRule } from '@/components/ui/KeyValue';
import { AiMessages } from '@/components/ai/AiMessages';
import { AiComposer } from '@/components/ai/AiComposer';
import { EvidencePanel } from '@/components/ai/EvidencePanel';
import { aiApi, SUGGESTED_PROMPTS } from '@/services/aiApi';
import { useIncidents, useIncident, useIncidentEvidence } from '@/hooks/useIncidents';
import { useSecurityEvents, useIncidentEvents } from '@/hooks/useSecurityEvents';
import { useToast } from '@/store/ToastContext';
import { useLive } from '@/store/LiveContext';
import { cn } from '@/utils/cn';
import { formatRelative } from '@/utils/dates';
import type { AiSession, ChatMessage, InvestigationContext } from '@/types/ai';
import type { SecurityEvent } from '@/types/threat';

/** localStorage key for the persisted investigation context (URL params win on restore). */
const CONTEXT_STORAGE_KEY = 'cybersentinel.ai.context.v1';

const OPENING_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content:
    'AI security analysis engine attached. I reason over the records you place in scope — incidents, correlated events and indicators — and cite every claim back to its source.\n\nAttach an incident from the evidence rail, or ask about the wider environment. Try: "What happened?", "Why was this detected?", or "What should I investigate next?"',
  timestamp: new Date().toISOString(),
  confidence: 1,
  status: 'complete',
};

/** AI Security Assistant — contextual investigation console with an evidence rail. */
export default function AIAssistant() {
  const meta = routeMetaFor('/ai-assistant');
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const live = useLive();

  const incidentIdParam = searchParams.get('incident') ?? undefined;
  const threatIdParam = searchParams.get('threat') ?? undefined;
  const eventIdParam = searchParams.get('event') ?? undefined;

  const incidents = useIncidents('all');
  const scopedIncident = useIncident(incidentIdParam);
  const timeWindowEvents = useSecurityEvents({ timeRange: '24H', pageSize: 60 });
  const incidentEvents = useIncidentEvents(incidentIdParam);
  const incidentEvidence = useIncidentEvidence(incidentIdParam);

  const [session, setSession] = useState<AiSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([OPENING_MESSAGE]);
  const [thinking, setThinking] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const startedRef = useRef(false);

  const [context, setContext] = useState<InvestigationContext>(() => {
    const base: InvestigationContext = { attachedEventIds: [], timeWindow: '24H' };
    let saved: Partial<InvestigationContext> | null = null;
    const raw = localStorage.getItem(CONTEXT_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<InvestigationContext>;
        if (parsed && typeof parsed === 'object') saved = parsed;
      } catch {
        /* corrupt persisted context — ignore and start clean */
      }
    }
    const fromStorage: InvestigationContext = {
      ...base,
      incidentId: typeof saved?.incidentId === 'string' && saved.incidentId ? saved.incidentId : undefined,
      incidentTitle: typeof saved?.incidentTitle === 'string' ? saved.incidentTitle : undefined,
      severity: saved?.severity,
      threatId: typeof saved?.threatId === 'string' && saved.threatId ? saved.threatId : undefined,
      source: typeof saved?.source === 'string' ? saved.source : undefined,
      target: typeof saved?.target === 'string' ? saved.target : undefined,
      attachedEventIds: Array.isArray(saved?.attachedEventIds)
        ? saved.attachedEventIds.filter((id): id is string => typeof id === 'string')
        : [],
      timeWindow: typeof saved?.timeWindow === 'string' ? saved.timeWindow : '24H',
    };
    // Explicit URL selections are the authoritative entry point; a stored
    // context is only a fallback and must never silently override them.
    return {
      ...fromStorage,
      ...(incidentIdParam ? { incidentId: incidentIdParam } : {}),
      ...(threatIdParam ? { threatId: threatIdParam } : {}),
      ...(eventIdParam ? { attachedEventIds: [eventIdParam] } : {}),
    };
  });

  const patchContext = useCallback((patch: Partial<InvestigationContext>) => {
    setContext((current) => {
      const next = { ...current, ...patch };
      localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  /** Evidence belonging to the scoped incident: incidentId-linked records (byIncident)
   *  merged with the incident's declared evidence trail (useIncidentEvidence). Both are
   *  incident-specific query results, so unrelated environment activity never enters scope. */
  const incidentScopeEvents = useMemo<SecurityEvent[]>(() => {
    if (!context.incidentId) return [];
    const merged = [...(incidentEvents.data ?? []), ...(incidentEvidence.data ?? [])];
    const seen = new Set<string>();
    const unique: SecurityEvent[] = [];
    merged.forEach((event) => {
      if (!seen.has(event.id)) {
        seen.add(event.id);
        unique.push(event);
      }
    });
    return unique;
  }, [context.incidentId, incidentEvents.data, incidentEvidence.data]);

  const autoAttachIncidentEvidence = useCallback(() => {
    if (!context.incidentId) return;
    const incident = scopedIncident.data ?? incidents.data?.find((i) => i.id === context.incidentId);
    const declared = incident?.evidenceEventIds ?? [];
    if (!declared.length) return;
    const availableIds = new Set(incidentScopeEvents.map((event) => event.id));
    const valid = declared.filter((id) => availableIds.has(id));
    if (!valid.length) return;
    const attached = new Set(context.attachedEventIds);
    const toAttach = valid.filter((id) => !attached.has(id));
    if (!toAttach.length) return;
    patchContext({ incidentId: context.incidentId, attachedEventIds: [...context.attachedEventIds, ...toAttach] });
    toast.success('Incident evidence attached', `Evidence automatically loaded from ${context.incidentId}.`);
  }, [context.incidentId, context.attachedEventIds, scopedIncident.data, incidents.data, incidentScopeEvents, patchContext, toast]);

  const availableEvents = useMemo(() => {
    if (context.incidentId) {
      return incidentScopeEvents;
    }
    return timeWindowEvents.data?.items ?? [];
  }, [context.incidentId, incidentScopeEvents, timeWindowEvents.data]);

  // Attach the incident's declared evidence once its records have actually
  // loaded. Re-runs whenever the incident/incident-event queries resolve, so
  // the final scope never depends on the ordering of the asynchronous fetches.
  useEffect(() => {
    autoAttachIncidentEvidence();
  }, [autoAttachIncidentEvidence]);

  // Keep the transcript's incident-derived fields in sync with the incident
  // record, and recover gracefully when the scoped id points at nothing.
  useEffect(() => {
    if (!context.incidentId) return;
    const incident = scopedIncident.data;
    if (incident) {
      if (
        context.incidentTitle === incident.title &&
        context.severity === incident.severity &&
        context.source === incident.source &&
        context.target === incident.target
      ) return;
      patchContext({
        incidentTitle: incident.title,
        severity: incident.severity,
        source: incident.source,
        target: incident.target,
      });
      return;
    }
    if (scopedIncident.isSuccess && incidents.isSuccess && !incidents.data?.some((i) => i.id === context.incidentId)) {
      patchContext({
        incidentId: undefined,
        incidentTitle: undefined,
        severity: undefined,
        source: undefined,
        target: undefined,
        attachedEventIds: [],
      });
    }
  }, [context.incidentId, scopedIncident.data, scopedIncident.isSuccess, incidents.isSuccess, incidents.data,
    context.incidentTitle, context.severity, context.source, context.target, patchContext]);

  // Switching incidents must drop the previous incident's attached evidence so
  // no stale records leak into the new investigation.
  const prevIncidentRef = useRef<string | undefined>(context.incidentId);
  useEffect(() => {
    if (prevIncidentRef.current === context.incidentId) return;
    prevIncidentRef.current = context.incidentId;
    if (context.attachedEventIds.length) {
      patchContext({ attachedEventIds: [] });
    }
  }, [context.incidentId, context.attachedEventIds, patchContext]);

  // External navigation (terminal `investigate <id>`, command palette, deep
  // links) while this page is already mounted must flow into the context:
  // the URL param is authoritative.
  useEffect(() => {
    if (incidentIdParam && incidentIdParam !== context.incidentId) {
      patchContext({ incidentId: incidentIdParam });
    }
  }, [incidentIdParam, context.incidentId, patchContext]);

  // Write the context's incident back to the URL so the terminal, Evidence
  // Rail and the AI Assistant share one source of truth.
  useEffect(() => {
    if (context.incidentId === incidentIdParam) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (context.incidentId) next.set('incident', context.incidentId);
      else next.delete('incident');
      return next;
    }, { replace: true });
  }, [context.incidentId, incidentIdParam, setSearchParams]);

  const resetSession = () => {
    setMessages([OPENING_MESSAGE]);
    setSession(null);
    startedRef.current = false;
    setQuestionCount(0);
    toast.info('Session cleared', 'Evidence scope and transcript were reset.');
  };

  const attachAll = () => {
    const correlated = availableEvents
      .filter((event) => !context.incidentId || event.incidentId === context.incidentId || (context.source && event.source === context.source))
      .map((event) => event.id);
    if (!correlated.length) {
      toast.info('Nothing to attach', 'No correlated records were found in this time window.');
      return;
    }
    const merged = Array.from(new Set([...context.attachedEventIds, ...correlated]));
    patchContext({ attachedEventIds: merged });
    toast.success('Evidence attached', `${correlated.length} records added to the investigation scope.`);
  };

  const ask = useCallback(async (question: string) => {
    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
      status: 'complete',
    };
    setMessages((current) => [...current, userMessage]);
    setThinking(true);
    setQuestionCount((count) => count + 1);

    try {
      const answer = await aiApi.investigate(question, context);
      setMessages((current) => [...current, answer]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `msg-error-${Date.now()}`,
          role: 'assistant',
          content: 'The analysis engine did not return a result.',
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
          status: 'error',
        },
      ]);
      toast.error('AI analysis failed', (error as Error).message);
    } finally {
      setThinking(false);
    }
  }, [context, toast]);

  const scope = [
    context.incidentId ? { label: 'INCIDENT', value: context.incidentId, tone: 'err' as const } : null,
    context.threatId ? { label: 'THREAT', value: context.threatId, tone: 'warn' as const } : null,
    context.source ? { label: 'SOURCE', value: context.source, tone: 'neutral' as const } : null,
    context.target ? { label: 'TARGET', value: context.target, tone: 'neutral' as const } : null,
    { label: 'WINDOW', value: context.timeWindow, tone: 'neutral' as const },
    { label: 'EVIDENCE', value: `${context.attachedEventIds.length} RECORDS`, tone: 'neutral' as const },
  ].filter(Boolean) as Array<{ label: string; value: string; tone: 'err' | 'warn' | 'neutral' }>;

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={meta.segments} />
      <PageHeader
        title="AI Security Assistant"
        description="Scoped Q&A over attached evidence."
        status={
          <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-ai/30 bg-ai/[0.06] px-1.5 py-[1px]">
            <Sparkles className="size-2.5 text-ai" aria-hidden />
            <span className="mono text-[11px] font-semibold tracking-[0.02em] text-ai uppercase">
              {thinking ? 'ANALYZING' : 'ENGINE READY'}
            </span>
          </span>
        }
        actions={
          <Button variant="ghost" size="sm" icon={<Eraser className="size-3.5" aria-hidden />} onClick={resetSession} disabled={thinking}>
            Clear session
          </Button>
        }
      />

      {/* scope strip */}
      <Panel className="min-w-0" noPadding>
        <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-2">
          <span className="mono inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.02em] text-ink-4 uppercase">
            <Terminal className="size-3" aria-hidden />CONTEXT
          </span>
          {scope.map((entry) => (
            <Badge key={entry.label} tone={entry.tone} title={`${entry.label}: ${entry.value}`}>
              <span className="mono">{entry.label}</span>
              <span className="mono ml-1 max-w-[180px] truncate text-ink-2">{entry.value}</span>
            </Badge>
          ))}
          <span className="flex-1" />
          <span className="mono text-[11px] text-ink-4">
            {session ? `SESSION ${session.id}` : 'SESSION NOT STARTED'} · {questionCount} QUERIES
          </span>
        </div>
      </Panel>

      <div className="grid min-w-0 gap-2.5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="flex min-w-0 flex-col gap-2.5">
          <Panel
            title="Investigation Transcript"
            icon={<Brain className="size-3.5" aria-hidden />}
            className="min-w-0"
            actions={
              <span className={cn('mono text-[11px] tracking-[0.01em] uppercase', thinking ? 'text-ai' : 'text-ink-4')}>
                {thinking ? 'WORKING…' : `${messages.length} MESSAGES`}
              </span>
            }
          >
            <AiMessages messages={messages} thinking={thinking} />
          </Panel>

          <Panel title="Ask" icon={<Sparkles className="size-3.5" aria-hidden />} className="min-w-0">
            <AiComposer
              onSubmit={(question) => void ask(question)}
              disabled={thinking}
              prompts={SUGGESTED_PROMPTS}
              placeholder={context.incidentId ? `Ask about ${context.incidentId}…` : 'Ask about the environment, or attach an incident first…'}
            />
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-2.5">
          <Panel title="Evidence Rail" icon={<Layers className="size-3.5" aria-hidden />} className="min-w-0">
            <EvidencePanel
              context={context}
              incidents={incidents.data ?? []}
              incidentsLoading={incidents.isLoading}
              events={availableEvents}
              onContextChange={patchContext}
              onAttachEvent={(eventId) => patchContext({ attachedEventIds: Array.from(new Set([...context.attachedEventIds, eventId])) })}
              onDetachEvent={(eventId) => patchContext({ attachedEventIds: context.attachedEventIds.filter((id) => id !== eventId) })}
              onScopeAll={attachAll}
            />
          </Panel>

          <Panel title="Live Feed Context" className="min-w-0">
            <SectionRule className="mb-1.5"><span>Recent signals in window</span></SectionRule>
            {live.stream.length ? (
              <ul className="space-y-px">
                {live.stream.slice(0, 6).map((event) => (
                  <li key={event.id} className="flex items-baseline gap-1.5">
                    <span className="mono shrink-0 text-[10.5px] text-ink-4">{formatRelative(event.timestamp)}</span>
                    <span className="mono min-w-0 flex-1 truncate text-[11px] text-ink-3">{event.description ?? event.type}</span>
                    <button
                      type="button"
                      onClick={() => patchContext({ attachedEventIds: Array.from(new Set([...context.attachedEventIds, event.id])) })}
                      className="mono shrink-0 text-[10.5px] text-ink-4 transition-colors hover:text-ai"
                      aria-label={`Attach ${event.id} to the investigation`}
                    >
                      +ATTACH
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mono text-[11px] text-ink-4">No live events in this session yet.</p>
            )}
            <p className="mono mt-2 rounded-[2px] border border-line bg-base px-2 py-1.5 text-[10.5px] leading-relaxed text-ink-4">
              The assistant only reasons over records inside the current scope. Detached records are excluded from
              answers and citations.
            </p>
          </Panel>
        </div>
      </div>

      {/* deep-link entry points */}
      <Panel title="Start From A Case" className="min-w-0" noPadding>
        {incidents.isLoading ? (
          <div className="p-2.5"><span className="mono text-[11px] text-ink-4">LOADING CASES…</span></div>
        ) : (incidents.data ?? []).length ? (
          <ul className="divide-y divide-line">
            {(incidents.data ?? [])
              .filter((incident) => incident.status !== 'resolved' && incident.status !== 'false_positive')
              .slice(0, 4)
              .map((incident) => (
                <li key={incident.id} className="flex flex-wrap items-center gap-2 px-2.5 py-2">
                  <span className="mono shrink-0 text-[11px] font-bold text-term">{incident.id}</span>
                  <span className="min-w-0 flex-1 truncate text-[11px] text-ink-2">{incident.title}</span>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => {
                      patchContext({ incidentId: incident.id, threatId: undefined });
                      setSearchParams({ incident: incident.id });
                      toast.info('Scope updated', `Now investigating ${incident.id}.`);
                    }}
                    disabled={context.incidentId === incident.id}
                  >
                    {context.incidentId === incident.id ? 'IN SCOPE' : 'INVESTIGATE'}
                  </Button>
                </li>
              ))}
          </ul>
        ) : (
          <div className="p-2.5">
            <p className="mono text-[11px] text-ink-4">No active incidents to investigate.</p>
          </div>
        )}
      </Panel>
    </div>
  );
}
