import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Activity, AlarmClock, ArrowLeft, Brain, FileSearch, ServerCog, StickyNote, FileText } from 'lucide-react';
import { useIncident, useIncidentEvidence } from '@/hooks/useIncidents';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Panel } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Badge, SeverityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Meter } from '@/components/ui/Meter';
import { IncidentSummaryPanel } from '@/components/incidents/IncidentSummaryPanel';
import { IncidentTimelinePanel } from '@/components/incidents/IncidentTimelinePanel';
import { EvidenceList } from '@/components/incidents/EvidenceList';
import { AffectedAssets } from '@/components/incidents/AffectedAssets';
import { AnalystNotes } from '@/components/incidents/AnalystNotes';
import { AiAnalysisPanel } from '@/components/incidents/AiAnalysisPanel';
import { IncidentActions } from '@/components/incidents/IncidentActions';
import { priorityMeta, slaState, statusMetaFor } from '@/utils/incidentMeta';
import { formatTimestamp, formatRelative } from '@/utils/dates';
import { cn } from '@/utils/cn';
import { useSettings } from '@/store/SettingsContext';
import SimpleIncidentDetail from './SimpleIncidentDetail';
import type { ReactNode } from 'react';

type TabValue = 'overview' | 'timeline' | 'evidence' | 'assets' | 'notes' | 'ai';

/** Incident Detail — case file with summary, timeline, evidence, assets, notes and AI triage. */
export default function IncidentDetail() {
  const { incidentId: id = '' } = useParams<{ incidentId: string }>();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<TabValue>('overview');
  const { settings } = useSettings();

  // Explicit URL query param mode override takes precedence over global setting
  const modeOverride = searchParams.get('mode');
  const effectiveMode = modeOverride === 'analyst' ? 'analyst' : modeOverride === 'simple' ? 'simple' : settings.uiMode;

  if (effectiveMode === 'simple') {
    return <SimpleIncidentDetail />;
  }

  const incident = useIncident(id);
  const evidence = useIncidentEvidence(id);
  const record = incident.data;

  if (incident.isLoading) {
    return (
      <div className="space-y-2.5 p-2.5 sm:p-3">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1fr)_330px]">
          <Skeleton className="h-[520px] w-full" />
          <Skeleton className="h-[520px] w-full" />
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
            message={incident.isError ? (incident.error as Error).message : 'No incident exists with this identifier. It may have been merged or purged from the retention window.'}
            hint="Check the identifier, or return to the incident queue and pick an active case."
            onRetry={() => incident.refetch()}
            action={<Link to="/incidents"><Button variant="secondary" size="sm" icon={<ArrowLeft className="size-3.5" aria-hidden />}>Back to incidents</Button></Link>}
          />
        </Panel>
      </div>
    );
  }

  const priority = priorityMeta(record.priority);
  const sla = slaState(record.createdAt, record.priority, record.status);
  const status = statusMetaFor(record.status);

  const tabs: Array<{ value: TabValue; label: string; icon?: ReactNode; count?: number }> = [
    { value: 'overview', label: 'OVERVIEW', icon: <FileText className="size-3" aria-hidden /> },
    { value: 'timeline', label: 'TIMELINE', icon: <Activity className="size-3" aria-hidden />, count: record.timeline.length },
    { value: 'evidence', label: 'EVIDENCE', icon: <FileSearch className="size-3" aria-hidden />, count: evidence.data?.length ?? record.evidenceEventIds.length },
    { value: 'assets', label: 'ASSETS', icon: <ServerCog className="size-3" aria-hidden />, count: record.affectedAssets.length },
    { value: 'notes', label: 'NOTES', icon: <StickyNote className="size-3" aria-hidden />, count: record.notes.length },
    { value: 'ai', label: 'AI ANALYSIS', icon: <Brain className="size-3" aria-hidden /> },
  ];

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={[{ label: 'Incidents', to: '/incidents' }, { label: record.id }]} />

      <PageHeader
        title={record.title}
        description={record.summary}
        status={
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="mono text-[11px] font-bold text-term">{record.id}</span>
            <SeverityBadge severity={record.severity} />
            <span className={cn('mono rounded-[2px] border px-1.5 py-[1px] text-[10.5px] font-bold tracking-[0.01em] uppercase', status.className)}>{status.label}</span>
            <span className={cn('mono rounded-[2px] border px-1.5 py-[1px] text-[10.5px] font-bold tracking-[0.01em] uppercase', priority.className)}>{priority.label}</span>
          </span>
        }
        actions={
          <Link to="/incidents">
            <Button variant="secondary" size="sm" icon={<ArrowLeft className="size-3.5" aria-hidden />}>Incident queue</Button>
          </Link>
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
              onChange={(value) => setTab(value as TabValue)}
              items={tabs.map((entry) => ({ value: entry.value, label: entry.label, icon: entry.icon, count: entry.count }))}
              scrollable
            />
          </div>

          <div className="p-2.5">
            {tab === 'overview' ? <IncidentSummaryPanel incident={record} /> : null}
            {tab === 'timeline' ? <IncidentTimelinePanel timeline={record.timeline} /> : null}
            {tab === 'evidence' ? (
              evidence.isLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}</div>
              ) : evidence.isError ? (
                <ErrorState compact title="Evidence unavailable" message={(evidence.error as Error).message} onRetry={() => evidence.refetch()} />
              ) : (
                <EvidenceList events={evidence.data ?? []} incidentId={record.id} />
              )
            ) : null}
            {tab === 'assets' ? <AffectedAssets assets={record.affectedAssets} /> : null}
            {tab === 'notes' ? <AnalystNotes incidentId={record.id} notes={record.notes} /> : null}
            {tab === 'ai' ? <AiAnalysisPanel analysis={record.aiAnalysis} incidentId={record.id} /> : null}
          </div>
        </Panel>

        <div className="flex min-w-0 flex-col gap-2.5">
          <Panel title="Response Actions" icon={<AlarmClock className="size-3.5" aria-hidden />} className="min-w-0" accent={record.priority === 'p1' ? 'critical' : undefined}>
            <IncidentActions incident={record} />
          </Panel>

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

        </div>
      </div>
    </div>
  );
}
