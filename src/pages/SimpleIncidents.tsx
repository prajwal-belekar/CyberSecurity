import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FileSearch, ShieldAlert, Terminal } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { IncidentStats } from '@/components/incidents/IncidentStats';
import { AskAIButton, SeverityLine, SimpleQA, TechnicalDetails } from '@/components/simple/SimpleParts';
import { useIncidents } from '@/hooks/useIncidents';
import { formatRelative } from '@/utils/dates';
import type { IncidentStatus } from '@/types/incident';
import type { Incident } from '@/types/incident';

const GROUPS: Array<{ status: IncidentStatus; label: string; hint: string }> = [
  { status: 'open', label: 'Open', hint: 'Something is wrong and no one is on it yet.' },
  { status: 'investigating', label: 'Being investigated', hint: 'An analyst is actively looking at this.' },
  { status: 'contained', label: 'Contained', hint: 'The damage has been limited. Follow-up work remains.' },
];

const CLOSED: Array<IncidentStatus> = ['resolved', 'false_positive'];

/** Simple Mode Investigation Queue — active cases, explained. */
export default function SimpleIncidents() {
  const meta = routeMetaFor('/incidents');
  const [filter, setFilter] = useState<IncidentStatus | 'all'>('all');
  const { data: incidents, isLoading, isError, error, refetch } = useIncidents(filter);

  const grouped = useMemo(() => {
    const rows = incidents ?? [];
    const byStatus: Record<string, Incident[]> = { open: [], investigating: [], contained: [], resolved: [], false_positive: [] };
    for (const row of rows) byStatus[row.status]?.push(row);
    return byStatus;
  }, [incidents]);

  const closedTotal = (grouped.resolved?.length ?? 0) + (grouped.false_positive?.length ?? 0);

  const groupsToShow = filter === 'all' ? GROUPS : CLOSED.includes(filter) ? [] : GROUPS.filter((g) => g.status === filter);

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={meta.segments} />
      <PageHeader
        title="Investigations"
        description="Every cyber incident CyberSentinel spun up, in the order it needs attention."
        status={
          <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-term" aria-hidden />
            <span className="text-[11px] text-ink-3">Live queue</span>
          </span>
        }
        actions={<AskAIButton to="/ai-assistant" label="Ask AI" size="sm" />}
      />

      <SimpleQA question="What is this showing me?">
        <p>
          An <strong>investigation</strong> is opened when a detection is serious enough to deserve a full
          case file. It collects the timeline, the evidence, and what was done. Use the counters below to
          filter, then open the cases that are still open or being investigated.
        </p>
      </SimpleQA>

      <IncidentStats active={filter} onSelect={setFilter} />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : isError ? (
        <ErrorState title="Unable to load investigations" message={(error as Error)?.message ?? 'The incident service could not be reached.'} onRetry={() => refetch()} />
      ) : groupsToShow.every((g) => grouped[g.status].length === 0) ? (
        <Panel
          title={filter === 'all' ? 'No active investigations' : `No ${GROUPS.find((g) => g.status === filter)?.label.toLowerCase()} cases`}
          icon={<CheckCircle2 className="size-3.5" aria-hidden />}
          className="min-w-0"
        >
          <p className="text-[12px] leading-relaxed text-ink-3">
            {closedTotal > 0
              ? `${closedTotal} case${closedTotal === 1 ? '' : 's'} were closed this period. The team handled them — nothing else is demanding attention.`
              : 'Nothing here right now. When CyberSentinel opens a case it will appear in this queue.'}
          </p>
          {closedTotal > 0 && filter === 'all' ? (
            <p className="mono mt-2 text-[11px] tracking-[0.01em] text-ink-4 uppercase">{closedTotal} CLOSED (RESOLVED / FALSE POSITIVE)</p>
          ) : null}
        </Panel>
      ) : (
        groupsToShow.map((group) => (
          <Panel
            key={group.status}
            title={group.label}
            icon={group.status === 'open' ? <ShieldAlert className="size-3.5" aria-hidden /> : <FileSearch className="size-3.5" aria-hidden />}
            className="min-w-0"
            accent={group.status === 'open' ? 'critical' : group.status === 'investigating' ? 'high' : 'term'}
          >
            <p className="mb-2 text-[11.5px] text-ink-4">{group.hint}</p>
            <ul className="space-y-1.5">
              {grouped[group.status].map((incident) => <IncidentSimpleRow key={incident.id} incident={incident} />)}
            </ul>
          </Panel>
        ))
      )}

      <TechnicalDetails title="Advanced investigation" hint="Triage console with SLA clocks" defaultOpen={false}>
        <p className="mb-2 text-[12px] leading-relaxed text-ink-2">
          The analyst incident console adds MTTR/SLA meters, bulk status transitions, assignment and team
          notes. Every case here is visible in both modes — nothing is lost when you switch.
        </p>
        <Link to="/incidents?mode=analyst">
          <Button size="sm" variant="secondary" icon={<Terminal className="size-3" aria-hidden />}>Open Analyst Queue</Button>
        </Link>
      </TechnicalDetails>
    </div>
  );
}

function IncidentSimpleRow({ incident }: { incident: Incident }) {
  return (
    <li className="rounded-[2px] border border-line bg-raised p-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <SeverityLine severity={incident.severity} />
        <PriorityBadge priority={incident.priority} />
        <span className="mono text-[11px] font-bold text-term">{incident.id}</span>
        <span className="flex-1" />
        <span className="mono text-[10.5px] text-ink-4">UPDATED {formatRelative(incident.updatedAt)}</span>
      </div>
      <p className="mt-1.5 text-[13px] font-semibold text-ink">{incident.title}</p>
      <p className="mt-0.5 text-[12px] leading-relaxed text-ink-3">{incident.summary}</p>
      <p className="mono mt-1 text-[10.5px] text-ink-4">
        {incident.source} → {incident.target} · {incident.type.replace(/_/g, ' ')}
        {incident.assignedTo ? ` · assigned to ${incident.assignedTo}` : ''}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Link to={`/incidents/${incident.id}`}>
          <Button size="xs" variant="primary">Open case</Button>
        </Link>
        <Link to={`/incidents/${incident.id}`}>
          <Button size="xs" variant="ghost">Summary & evidence</Button>
        </Link>
        <AskAIButton to={`/ai-assistant?incident=${incident.id}`} label="Ask AI" size="xs" />
      </div>
    </li>
  );
}