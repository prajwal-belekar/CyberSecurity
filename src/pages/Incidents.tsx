import { useMemo, useState } from 'react';
import { useIncidents } from '@/hooks/useIncidents';
import { LayoutGrid, List, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { IncidentStats } from '@/components/incidents/IncidentStats';
import { IncidentBoard } from '@/components/incidents/IncidentBoard';
import { IncidentTable } from '@/components/incidents/IncidentTable';
import { IncidentFilters, EMPTY_INCIDENT_FILTERS, type IncidentFilterState } from '@/components/incidents/IncidentFilters';
import { priorityMeta } from '@/utils/incidentMeta';
import { severityRank } from '@/utils/severity';
import { formatRelative } from '@/utils/dates';
import type { IncidentStatus } from '@/types/incident';

/** Incident Response — status board or full queue, both filterable. */
export default function Incidents() {
  const meta = routeMetaFor('/incidents');
  const [view, setView] = useState<'board' | 'table'>('board');
  const [filters, setFilters] = useState<IncidentFilterState>(EMPTY_INCIDENT_FILTERS);
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useIncidents('all');

  const incidents = useMemo(() => {
    const search = filters.search?.trim().toLowerCase();
    return (data ?? [])
      .filter((incident) => (filters.status === 'all' ? true : incident.status === filters.status))
      .filter((incident) => (filters.priority === 'all' ? true : incident.priority === filters.priority))
      .filter((incident) => (filters.assignee === 'all' ? true : incident.assignedTo === filters.assignee))
      .filter((incident) => {
        if (!search) return true;
        return [incident.id, incident.title, incident.summary, incident.source, incident.target, incident.assignedTo ?? '', ...incident.tags]
          .join(' ')
          .toLowerCase()
          .includes(search);
      })
      .sort((a, b) =>
        priorityMeta(a.priority).rank - priorityMeta(b.priority).rank ||
        severityRank(b.severity) - severityRank(a.severity) ||
        +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [data, filters]);

  const activeP1 = (data ?? []).filter((incident) => incident.priority === 'p1' && incident.status !== 'resolved' && incident.status !== 'false_positive');

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={meta.segments} />
      <PageHeader
        title="Incident Response"
        description="Open cases by priority, ownership and SLA position."
        status={
          <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]">
            <ShieldAlert className="size-2.5 text-critical" aria-hidden />
            <span className="mono text-[11px] font-semibold tracking-[0.02em] text-ink-2 uppercase">
              {activeP1.length} P1 ACTIVE
            </span>
          </span>
        }
        actions={
          <Tabs
            ariaLabel="Incident view"
            value={view}
            onChange={(value) => setView(value as 'board' | 'table')}
            items={[
              { value: 'board', label: 'BOARD', icon: <LayoutGrid className="size-3" aria-hidden /> },
              { value: 'table', label: 'TABLE', icon: <List className="size-3" aria-hidden /> },
            ]}
          />
        }
      />

      <IncidentStats active={filters.status} onSelect={(status) => setFilters((current) => ({ ...current, status: status as IncidentStatus | 'all' }))} />

      <Panel
        title={view === 'board' ? 'Response Board' : 'Incident Queue'}
        icon={view === 'board' ? <LayoutGrid className="size-3.5" aria-hidden /> : <List className="size-3.5" aria-hidden />}
        className="min-w-0"
        noPadding
        actions={
          <span className="mono text-[11px] tracking-[0.01em] text-ink-4 uppercase">
            {isFetching ? 'SYNC…' : `UPDATED ${formatRelative(dataUpdatedAt)}`}
          </span>
        }
      >
        <div className="border-b border-line bg-base px-2.5 py-2">
          <IncidentFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(EMPTY_INCIDENT_FILTERS)}
            resultCount={incidents.length}
          />
        </div>

        {isError ? (
          <div className="p-2.5">
            <IncidentTable incidents={[]} loading={false} error={(error as Error).message} onRetry={() => refetch()} />
          </div>
        ) : view === 'board' ? (
          <div className="p-2.5"><IncidentBoard incidents={incidents} loading={isLoading} /></div>
        ) : (
          <IncidentTable incidents={incidents} loading={isLoading} error={isError ? (error as Error).message : null} onRetry={() => refetch()} />
        )}
      </Panel>
    </div>
  );
}
