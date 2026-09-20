import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, FolderKanban, User } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { IncidentStatusBadge, PriorityBadge, SeverityBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useIncidents } from '@/hooks/useIncidents';
import { formatRelative } from '@/utils/dates';
import { cn } from '@/utils/cn';

/** Compact incident cards for the dashboard — full management lives in /incidents. */
export function ActiveIncidents({ limit = 4 }: { limit?: number }) {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useIncidents('all');

  const active = (data ?? [])
    .filter((i) => i.status === 'open' || i.status === 'investigating' || i.status === 'contained')
    .slice(0, limit);

  return (
    <Panel
      title="Active Incidents"
      icon={<FolderKanban className="size-3.5" aria-hidden />}
      className="min-w-0"
      noPadding
      actions={
        <button
          type="button"
          onClick={() => navigate('/incidents')}
          className="inline-flex items-center gap-1 text-[11px] tracking-[0.01em] text-ink-3 transition-colors hover:text-term"
        >
          Incident console <ArrowUpRight className="size-3" aria-hidden />
        </button>
      }
    >
      {isLoading ? (
        <div className="space-y-2 p-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="panel-inset p-2.5">
              <Skeleton className="mb-2 h-2.5 w-24" />
              <Skeleton className="mb-2 h-3 w-40" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState title="Unable to load incidents" message={(error as Error).message} onRetry={() => refetch()} compact />
      ) : !active.length ? (
        <EmptyState
          compact
          icon={<FolderKanban className="size-4" aria-hidden />}
          title="No active incidents"
          description="There are currently no incidents requiring investigation."
        />
      ) : (
        <ul className="divide-y divide-line">
          {active.map((incident) => (
            <li key={incident.id}>
              <button
                type="button"
                onClick={() => navigate(`/incidents/${incident.id}`)}
                className={cn(
                  'group flex w-full items-start gap-2.5 px-2.5 py-2 text-left transition-colors hover:bg-panel-2',
                  'focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-term',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 w-[2px] shrink-0 self-stretch rounded-[1px]',
                    incident.severity === 'critical' ? 'bg-critical'
                      : incident.severity === 'high' ? 'bg-high'
                        : incident.severity === 'medium' ? 'bg-medium' : 'bg-ink-4',
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="mono text-[11px] font-bold tracking-[0.01em] text-term">{incident.id}</span>
                    <SeverityBadge severity={incident.severity} />
                    <IncidentStatusBadge status={incident.status} />
                    <PriorityBadge priority={incident.priority} />
                  </span>
                  <span className="mt-1 block truncate text-[12px] font-medium text-ink group-hover:text-term">
                    {incident.title}
                  </span>
                  <span className="mono mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-ink-4">
                    <span>SRC {incident.source}</span>
                    <span className="inline-flex items-center gap-1">
                      <User className="size-2.5" aria-hidden />{incident.assignedTo ?? 'UNASSIGNED'}
                    </span>
                    <span>{formatRelative(incident.createdAt)}</span>
                    <span className="hidden sm:inline">{incident.timeline.length} timeline entries</span>
                  </span>
                </span>
                <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-ink-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
