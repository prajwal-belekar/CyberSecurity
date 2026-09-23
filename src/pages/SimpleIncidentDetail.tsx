import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Brain, CheckCircle2, FileSearch, FileText, ShieldAlert, Sparkles, Terminal } from 'lucide-react';
import { useIncident, useIncidentEvidence } from '@/hooks/useIncidents';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Panel } from '@/components/ui/Card';
import { Badge, SeverityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Meter } from '@/components/ui/Meter';
import { KeyValueGrid } from '@/components/ui/KeyValue';
import { IncidentSummaryPanel } from '@/components/incidents/IncidentSummaryPanel';
import { EvidenceList } from '@/components/incidents/EvidenceList';
import { AiAnalysisPanel } from '@/components/incidents/AiAnalysisPanel';
import { IncidentActions } from '@/components/incidents/IncidentActions';
import { AskAIButton, SimpleQA, TechnicalDetails } from '@/components/simple/SimpleParts';
import { priorityMeta, slaState, statusMetaFor } from '@/utils/incidentMeta';
import { formatTimestamp, formatRelative } from '@/utils/dates';
import { cn } from '@/utils/cn';
import { Tabs } from '@/components/ui/Tabs';
import { useSettings } from '@/store/SettingsContext';
import type { Incident } from '@/types/incident';

type SimpleTabValue = 'overview' | 'evidence' | 'ai';

const PLAIN_TYPE: Record<string, string> = {
  brute_force: 'brute-force attack',
  data_exfiltration: 'data exfiltration attempt',
  malware: 'malware activity',
  phishing: 'phishing attempt',
  reconnaissance: 'reconnaissance activity',
  lateral_movement: 'lateral movement',
  privilege_escalation: 'privilege escalation',
  suspicious_network: 'suspicious network activity',
  web_security: 'web security exposure',
  auth_anomaly: 'authentication anomaly',
};

const SEVERITY_EXPLANATION: Record<string, string> = {
  critical: 'Critical — this is on the top of the queue. Severity meaning: immediate action is required.',
  high: 'High — strong evidence of compromise or serious exposure. Investigate promptly.',
  medium: 'Medium — unusual behaviour worth confirming. Likely not urgent, but do not ignore it.',
  low: 'Low — mostly informational. Often benign, still logged for review.',
  info: 'Informational — no action required, recorded so the incident history stays complete.',
};

/** Simple Mode Incident Detail — answers: what, how serious, why it matters, evidence, next steps, then technical detail. */
export default function SimpleIncidentDetail() {
  const { incidentId: id = '' } = useParams<{ incidentId: string }>();
  const [tab, setTab] = useState<SimpleTabValue>('overview');
  const { updateUIMode } = useSettings();

  const incident = useIncident(id);
  const evidence = useIncidentEvidence(id);
  const record = incident.data;

  if (incident.isLoading) {
    return (
      <div className="space-y-2.5 p-2.5 sm:p-3">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1fr)_330px]">
          <Skeleton className="h-[560px] w-full" />
          <Skeleton className="h-[560px] w-full" />
        </div>
      </div>
    );
  }

  if (incident.isError || !record) {
    return (
      <div className="space-y-2.5 p-2.5 sm:p-3">
        <Breadcrumbs items={[{ label: 'Incidents', to: '/incidents' }, { label: id || 'unknown' }]} />
        <Panel className="min-w-0">
          <ErrorState
            title={`Incident ${id || ''} could not be loaded`}
            message={incident.isError ? (incident.error as Error).message : 'No incident exists with this identifier.'}
            hint="Check the identifier, or return to the incident queue and pick an active case."
            onRetry={() => incident.refetch()}
            action={<Link to="/incidents"><Button variant="secondary" size="sm" icon={<ArrowLeft className="size-3.5" aria-hidden />}>Back to incidents</Button></Link>}
          />
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={[{ label: 'Incidents', to: '/incidents' }, { label: record.id }]} />

      <PageHeader
        title={record.title}
        description={plainSummary(record)}
        status={
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="mono text-[11px] font-bold text-term">{record.id}</span>
            <SeverityBadge severity={record.severity} />
            <IncidentStatusMeta status={record.status} />
          </span>
        }
        actions={
          <>
            <AskAIButton to={`/ai-assistant?incident=${record.id}`} label="Ask AI" size="sm" />
            <Link to="/incidents">
              <Button variant="secondary" size="sm" icon={<ArrowLeft className="size-3.5" aria-hidden />}>Incident queue</Button>
            </Link>
          </>
        }
      />

      <div className="grid min-w-0 gap-2.5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <Panel
          className="min-w-0"
          noPadding
          actions={
            <span className="mono text-[11px] tracking-[0.01em] text-ink-4 uppercase">
              UPDATED {formatRelative(record.updatedAt)}
            </span>
          }
        >
          <div className="border-b border-line bg-base px-2.5 py-1.5">
            <Tabs
              ariaLabel="Incident sections"
              value={tab}
              onChange={(value) => setTab(value as SimpleTabValue)}
              items={[
                { value: 'overview', label: 'SUMMARY', icon: <FileText className="size-3" aria-hidden /> },
                { value: 'evidence', label: 'EVIDENCE', icon: <FileSearch className="size-3" aria-hidden /> },
                { value: 'ai', label: 'AI ANALYSIS', icon: <Sparkles className="size-3" aria-hidden /> },
              ]}
              scrollable
            />
          </div>

          <div className="p-2.5">
            {tab === 'overview' ? (
              <div className="space-y-2.5">
                <SimpleQA question="What happened?" tone={record.severity === 'critical' ? 'critical' : record.severity === 'high' ? 'warn' : 'default'}>
                  <p>{record.summary}</p>
                </SimpleQA>

                <SimpleQA question="How serious is it?" tone={record.severity === 'critical' ? 'critical' : record.severity === 'high' ? 'warn' : 'default'}>
                  <p>{SEVERITY_EXPLANATION[record.severity] ?? SEVERITY_EXPLANATION.info}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <SeverityBadge severity={record.severity} />
                    <IncidentStatusMeta status={record.status} />
                    <Badge tone="neutral">{record.priority.toUpperCase()} PRIORITY</Badge>
                    {record.aiAnalysis ? (
                      <Badge tone="ai">{Math.round(record.aiAnalysis.confidence * 100)}% AI CONFIDENCE</Badge>
                    ) : null}
                  </div>
                </SimpleQA>

                <SimpleQA question="Why does it matter to my environment?" tone="default">
                  <p>{record.impact}</p>
                  <p className="text-ink-4">
                    Affected systems: <span className="mono text-ink-2">
                      {record.affectedAssets.length} assets{record.affectedAssets.some((a) => a.compromised) ? ` (${record.affectedAssets.filter((a) => a.compromised).length} confirmed compromised)` : ''}
                    </span>
                    {' · '}from <span className="mono text-ink-2">{record.source}</span> to <span className="mono text-ink-2">{record.target}</span>.
                  </p>
                </SimpleQA>

                <SimpleQA question="What has CyberSentinel already done?" tone={record.timeline.some((t) => t.kind === 'resolution') ? 'positive' : 'default'}>
                  <ActionsTaken record={record} />
                </SimpleQA>

                <SimpleQA question="What should I do next?" tone={record.status === 'open' ? 'warn' : 'default'}>
                  <NextSteps record={record} />
                </SimpleQA>

                <TechnicalDetails
                  title="Technical details"
                  hint={`Evidence ${evidence.data?.length ?? record.evidenceEventIds.length} · Assets ${record.affectedAssets.length} · Timeline ${record.timeline.length}`}
                >
                  {record.aiAnalysis ? (
                    <div className="mb-2 rounded-[2px] border border-ai/30 bg-ai/[0.06] px-2.5 py-2">
                      <div className="mb-1 flex items-center gap-1.5">
                        <Brain className="size-3.5 shrink-0 text-ai" aria-hidden />
                        <span className="mono text-[11px] font-semibold tracking-[0.02em] text-ai">AI ATTACK CHAIN</span>
                      </div>
                      <ol className="space-y-1">
                        {record.aiAnalysis.probableAttackChain.map((step, index) => (
                          <li key={step} className="flex items-start gap-2 text-[11px] leading-relaxed text-ink-2">
                            <span className="mono tnum shrink-0 text-[10.5px] text-ai">{String(index + 1).padStart(2, '0')}</span>
                            <span className="min-w-0 flex-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}
                  <KeyValueGrid
                    columns={2}
                    rows={[
                      { label: 'Incident ID', value: record.id, copy: record.id, mono: true },
                      { label: 'Assigned to', value: record.assignedTo ?? 'UNASSIGNED', tone: record.assignedTo ? undefined : 'text-medium' },
                      { label: 'Source', value: record.source, copy: record.source, mono: true },
                      { label: 'Target', value: record.target, copy: record.target, mono: true },
                      { label: 'Opened', value: formatTimestamp(record.createdAt), mono: true },
                      { label: 'Last update', value: formatTimestamp(record.updatedAt), mono: true },
                      ...(record.resolvedAt ? [{ label: 'Resolved', value: formatTimestamp(record.resolvedAt), mono: true }] : []),
                      { label: 'Type', value: plainType(record.type), mono: true },
                    ]}
                  />

                  {record.evidenceEventIds.length && evidence.data?.length ? (
                    <div className="mt-2">
                      <p className="label-xs mb-1">Linked evidence</p>
                      <ul className="flex flex-wrap gap-1">
                        {record.evidenceEventIds.slice(0, 12).map((eventId) => (
                          <li key={eventId} className="mono rounded-[2px] border border-line-2 bg-raised px-1.5 py-[1px] text-[11px] text-term">
                            {eventId}
                          </li>
                        ))}
                        {record.evidenceEventIds.length > 12 ? (
                          <li className="mono rounded-[2px] border border-line-2 bg-raised px-1.5 py-[1px] text-[11px] text-ink-4">
                            +{record.evidenceEventIds.length - 12} MORE
                          </li>
                        ) : null}
                      </ul>
                    </div>
                  ) : null}

                  {record.tags.length ? (
                    <p className="mt-2 text-[11px] text-ink-3">
                      <span className="label-xs mr-1 align-middle">TAGS</span>
                      {record.tags.join(' · ')}
                    </p>
                  ) : null}
                </TechnicalDetails>

                {/* Dense analyst-style summary kept one level down for power users */}
                <TechnicalDetails title="Full case summary" hint="Same data as Analyst Mode" defaultOpen={false}>
                  <IncidentSummaryPanel incident={record} />
                </TechnicalDetails>
              </div>
            ) : null}

            {tab === 'evidence' ? (
              evidence.isLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}</div>
              ) : evidence.isError ? (
                <ErrorState compact title="Evidence unavailable" message={(evidence.error as Error).message} onRetry={() => evidence.refetch()} />
              ) : (
                <EvidenceList events={evidence.data ?? []} incidentId={record.id} />
              )
            ) : null}

            {tab === 'ai' ? <AiAnalysisPanel analysis={record.aiAnalysis} incidentId={record.id} /> : null}
          </div>
        </Panel>

        <div className="flex min-w-0 flex-col gap-2.5">
          <Panel title="Recommended Next Steps" icon={<ShieldAlert className="size-3.5" aria-hidden />} className="min-w-0" accent={record.priority === 'p1' ? 'critical' : undefined}>
            <IncidentActions incident={record} />
          </Panel>

          <ResponseClock record={record} />

          <Panel title="Escalation Path" className="min-w-0">
            <ol className="space-y-1">
              {[
                { step: 'Detection & triage', done: true },
                { step: 'Analyst assignment', done: Boolean(record.assignedTo) },
                { step: 'Containment', done: record.status === 'contained' || record.status === 'resolved' },
                { step: 'Eradication & recovery', done: record.status === 'resolved' },
                { step: 'Post-incident review', done: record.status === 'resolved' || record.status === 'false_positive' },
              ].map((stage, index) => (
                <li key={stage.step} className="flex items-center gap-2">
                  <span className={cn('mono tnum flex size-4 shrink-0 items-center justify-center rounded-[2px] border text-[10.5px] font-bold', stage.done ? 'border-term/45 bg-term/10 text-term' : 'border-line-3 bg-raised text-ink-4')} aria-hidden>
                    {index + 1}
                  </span>
                  <span className={cn('min-w-0 flex-1 truncate text-[11px]', stage.done ? 'text-ink-2' : 'text-ink-4')}>{stage.step}</span>
                  {stage.done ? <Badge tone="term">DONE</Badge> : <Badge tone="neutral">PENDING</Badge>}
                </li>
              ))}
            </ol>
          </Panel>

          <TechnicalDetails title="Open in Analyst Mode" hint="Full case file" className="min-w-0" defaultOpen={false}>
            <div className="space-y-2">
              <p className="text-[12px] leading-relaxed text-ink-2">
                Analyst Mode shows the complete case file with the terminal aesthetic, per-tab evidence,
                timeline and note-taking tools — sharing the exact same data.
              </p>
              <div className="flex gap-1.5">
                <Link to={`/incidents/${record.id}?mode=analyst`}>
                  <Button size="xs" variant="secondary" icon={<Terminal className="size-3" aria-hidden />}>
                    Open Analyst View
                  </Button>
                </Link>
                <Button size="xs" variant="ghost" onClick={() => updateUIMode('analyst')}>
                  Switch default mode
                </Button>
              </div>
            </div>
          </TechnicalDetails>
        </div>
      </div>
    </div>
  );
}

function plainType(type: string): string {
  return PLAIN_TYPE[type] ?? type.replace(/_/g, ' ');
}

function plainSummary(record: Incident): string {
  return `A ${plainType(record.type)} was detected targeting ${record.target} from ${record.source}. ${record.summary}`;
}

function IncidentStatusMeta({ status }: { status: Incident['status'] }) {
  const meta = statusMetaFor(status);
  return (
    <span className={cn('mono rounded-[2px] border px-1.5 py-[1px] text-[10.5px] font-bold tracking-[0.01em] uppercase', meta.className)}>
      {meta.label}
    </span>
  );
}

function ActionsTaken({ record }: { record: Incident }) {
  const taken = record.timeline
    .filter((t) => t.kind === 'action' || t.kind === 'system' || t.kind === 'resolution')
    .slice(0, 5);
  if (!taken.length) {
    return (
      <p className="text-[12px] leading-relaxed text-ink-2">
        CyberSentinel detected this case and opened the investigation. No automated response has been
        triggered yet — handoff is waiting on a decision.
      </p>
    );
  }
  return (
    <ul className="space-y-1">
      {taken.map((entry) => (
        <li key={entry.id} className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-2">
          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-term" aria-hidden />
          <span className="min-w-0 flex-1">
            {entry.title}
            {entry.detail ? <span className="text-ink-4"> — {entry.detail}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

function NextSteps({ record }: { record: Incident }) {
  const ai = record.aiAnalysis?.suggestedNextSteps;
  if (ai?.length) {
    return (
      <ul className="space-y-1">
        {ai.map((step) => (
          <li key={step} className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-2">
            <span className="mono text-cyber" aria-hidden>›</span>
            <span className="min-w-0 flex-1">{step}</span>
          </li>
        ))}
      </ul>
    );
  }
  const generic = [
    record.status === 'open' ? 'Triage this case: confirm the detection and review the linked evidence.' : `Case is ${record.status.replace(/_/g, ' ')} — verify the recorded actions.`,
    `Check the ${record.affectedAssets.length} affected asset${record.affectedAssets.length === 1 ? '' : 's'}${record.affectedAssets.some((a) => a.compromised) ? ' (some confirmed compromised)' : ''}.`,
    'Review evidence to rule the detection in or out, then update the case status.',
  ];
  return (
    <ul className="space-y-1">
      {generic.map((step) => (
        <li key={step} className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-2">
          <span className="mono text-cyber" aria-hidden>›</span>
          <span className="min-w-0 flex-1">{step}</span>
        </li>
      ))}
    </ul>
  );
}

function ResponseClock({ record }: { record: Incident }) {
  const priority = priorityMeta(record.priority);
  const sla = slaState(record.createdAt, record.priority, record.status);
  return (
    <Panel title="Response Clock" className="min-w-0">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="label-xs">{priority.label} response target</span>
        <span className="mono tnum text-[10.5px] text-ink-3">{priority.responseTargetMinutes} min</span>
      </div>
      <Meter
        value={Math.min(100, (sla.elapsedMinutes / priority.responseTargetMinutes) * 100)}
        tone={sla.tone === 'critical' ? 'err' : sla.tone === 'medium' ? 'warn' : 'term'}
      />
      <p className={cn('mono mt-1.5 text-[11px] tracking-[0.01em] uppercase', sla.tone === 'critical' ? 'text-critical' : sla.tone === 'medium' ? 'text-medium' : 'text-term')}>
        {sla.label}
      </p>
      <dl className="mt-2 space-y-1 border-t border-line pt-2">
        {[
          ['OPENED', formatTimestamp(record.createdAt)],
          ['LAST UPDATE', formatTimestamp(record.updatedAt)],
          ...(record.resolvedAt ? ([['RESOLVED', formatTimestamp(record.resolvedAt)]] as Array<[string, string]>) : []),
          ['OWNER', record.assignedTo ?? 'UNASSIGNED'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-2">
            <dt className="label-xs shrink-0">{label}</dt>
            <dd className="mono truncate text-[11px] text-ink-3">{value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}