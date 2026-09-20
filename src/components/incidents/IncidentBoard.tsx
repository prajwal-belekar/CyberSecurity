import { LayoutGrid } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { IncidentCard } from './IncidentCard';
import { INCIDENT_STATUS_ORDER, statusMetaFor } from '@/utils/incidentMeta';
import type { Incident } from '@/types/incident';

/** Kanban board grouped by incident status, highest severity first per column. */
export function IncidentBoard({ incidents, loading }: { incidents: Incident[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid min-w-0 gap-2.5 md:grid-cols-2 xl:grid-cols-5">
        {INCIDENT_STATUS_ORDER.map((status) => (
          <div key={status} className="min-w-0 rounded-[2px] border border-line bg-panel p-2">
            <Skeleton className="h-4 w-24" />
            <div className="mt-2 space-y-2">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const columns = INCIDENT_STATUS_ORDER.map((status) => ({
    status,
    items: incidents
      .filter((incident) => incident.status === status)
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
  }));

  if (!incidents.length) {
    return <EmptyState icon={<LayoutGrid className="size-4" aria-hidden />} title="No incidents match these filters" description="Widen the filters, or switch to the table view to inspect the full queue." />;
  }

  return (
    <div className="grid min-w-0 gap-2.5 md:grid-cols-2 xl:grid-cols-5">
      {columns.map(({ status, items }) => {
        const meta = statusMetaFor(status);
        return (
          <section key={status} aria-label={`${meta.label} incidents`} className="min-w-0">
            <header className="mb-1.5 flex items-center gap-1.5 border-b border-line pb-1.5">
              <span className="size-1.5 shrink-0 rounded-full" style={{ background: meta.accent }} aria-hidden />
              <h2 className={cn('text-[11px] font-semibold uppercase', meta.text)}>{meta.label}</h2>
              <span className="mono tnum ml-auto text-[11px] text-ink-4">{items.length}</span>
            </header>
            {items.length ? (
              <ul className="space-y-1.5">
                {items.map((incident) => (
                  <li key={incident.id}><IncidentCard incident={incident} /></li>
                ))}
              </ul>
            ) : (
              <p className="mono rounded-[2px] border border-dashed border-line px-2 py-6 text-center text-[11px] tracking-[0.01em] text-ink-4 uppercase">
                EMPTY
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
