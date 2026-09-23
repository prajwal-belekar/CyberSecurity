import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Layers, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Panel } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ThreatDetails } from '@/components/threats/ThreatDetails';
import { ThreatTimeline } from '@/components/threats/ThreatTimeline';
import { threatsApi } from '@/services/threatsApi';
import { eventsApi } from '@/services/eventsApi';
import { queryKeys } from '@/services/queryKeys';
import { useUI } from '@/store/UIContext';
import { formatRelative } from '@/utils/dates';
import type { SecurityEvent } from '@/types/threat';
import { useSettings } from '@/store/SettingsContext';
import SimpleThreatDetail from './SimpleThreatDetail';

/** Threat investigation console — forensic view of one detection. */
export default function ThreatDetail() {
  const { settings } = useSettings();
  if (settings.uiMode === 'simple') return <SimpleThreatDetail />;

  const { threatId } = useParams<{ threatId: string }>();
  const navigate = useNavigate();
  const { openEvent } = useUI();

  const { data: threat, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.threatDetail(threatId ?? 'none'),
    queryFn: () => threatsApi.byId(threatId!),
    enabled: Boolean(threatId),
  });

  const relatedQuery = useQuery({
    queryKey: [...queryKeys.eventRelated(threatId ?? 'none'), 'threat'],
    queryFn: () => eventsApi.list({ search: threat?.source, pageSize: 30 }),
    enabled: Boolean(threat),
  });

  if (isLoading) {
    return (
      <div className="space-y-2.5 p-2.5 sm:p-3">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-2.5 lg:grid-cols-3">
          <Skeleton className="h-48 lg:col-span-2" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-3">
        <ErrorState title="Unable to load threat" message={(error as Error).message} onRetry={() => refetch()} />
      </div>
    );
  }

  if (!threat) {
    return (
      <div className="p-3">
        <Panel>
          <EmptyState
            icon={<ShieldAlert className="size-4" aria-hidden />}
            title={`Threat ${threatId ?? ''} not found`}
            description="This detection is no longer in the active store. It may have been resolved or purged."
            action={<Button variant="primary" size="sm" onClick={() => navigate('/threats')}>Back to threat monitor</Button>}
          />
        </Panel>
      </div>
    );
  }

  const relatedEvents = (relatedQuery.data?.items ?? []).filter(
    (e) => e.threatId === threat.id || threat.relatedEventIds.includes(e.id) || e.source === threat.source,
  ).slice(0, 14);

  const eventColumns: Column<SecurityEvent>[] = [
    { key: 'time', header: 'Time', sortValue: (row) => +new Date(row.timestamp), width: '92px', render: (row) => <span className="mono tnum text-[10.5px] text-ink-4">{formatRelative(row.timestamp)}</span> },
    { key: 'id', header: 'Event ID', sortValue: (row) => row.id, width: '96px', render: (row) => <span className="mono text-[10.5px] text-term">{row.id}</span> },
    { key: 'sev', header: 'Severity', sortValue: (row) => row.severity, width: '100px', render: (row) => <SeverityBadge severity={row.severity} /> },
    { key: 'type', header: 'Event', sortValue: (row) => row.type, render: (row) => <span className="truncate text-[11.5px] text-ink-2">{row.type}</span> },
    { key: 'src', header: 'Source', sortValue: (row) => row.source, hideBelow: 'md', render: (row) => <span className="mono text-[10.5px] text-cyber">{row.source}</span> },
    { key: 'status', header: 'Status', sortValue: (row) => row.status, width: '126px', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs
        items={[
          { label: 'CYBERSENTINEL', to: '/dashboard' },
          { label: 'Monitoring' },
          { label: 'Threat Monitor', to: '/threats' },
          { label: threat.id },
        ]}
      />

      <PageHeader
        compact
        title={`Threat / ${threat.id}`}
        description="Forensic investigation console for a single detection."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<ArrowLeft className="size-3.5" aria-hidden />} onClick={() => navigate('/threats')}>
              All threats
            </Button>
            <Link to="/incidents" className="contents">
              <Button variant="ghost" size="sm">Incident console</Button>
            </Link>
          </>
        }
      />

      <ThreatDetails threat={threat} />

      <div className="grid min-w-0 gap-2.5 lg:grid-cols-3">
        <Panel title="Correlated Events" icon={<Layers className="size-3.5" aria-hidden />} noPadding className="min-w-0 lg:col-span-2">
          <DataTable
            columns={eventColumns}
            rows={relatedEvents}
            rowKey={(row) => row.id}
            loading={relatedQuery.isLoading}
            error={relatedQuery.isError ? (relatedQuery.error as Error).message : null}
            onRetry={() => relatedQuery.refetch()}
            onRowClick={openEvent}
            emptyTitle="No correlated events"
            emptyDescription="No individual events are linked to this detection."
            emptyIcon={<Layers className="size-4" aria-hidden />}
            caption={`Events correlated with ${threat.id}`}
          />
        </Panel>
        <Panel title="Chronology" className="min-w-0">
          <ThreatTimeline threat={threat} />
        </Panel>
      </div>
    </div>
  );
}
