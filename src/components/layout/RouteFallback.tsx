import { useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/Skeleton';
import { systemApi } from '@/services/systemApi';

/**
 * Structural placeholder shown while a lazy page chunk loads (spec §34).
 *
 * The visible line is terminal-flavoured loading copy resolved from the
 * service layer, so it names the subsystem actually being fetched
 * ("INITIALIZING THREAT ENGINE") rather than a generic spinner label.
 * The skeleton beneath mirrors the real page rhythm — header, stat row,
 * chart, table — so the layout does not jump when the chunk arrives.
 */
export function RouteFallback() {
  const { pathname } = useLocation();
  const label = systemApi.routeLoadingLabel(pathname);

  return (
    <div className="space-y-3 p-3 sm:p-4" role="status">
      <p className="mono flex items-center gap-2 text-[11px] text-term">
        <span className="tracking-[0.04em] uppercase">{label}</span>
        <span aria-hidden>…</span>
        <span className="h-px flex-1 bg-line" aria-hidden />
      </p>

      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel p-3">
            <Skeleton className="mb-2.5 h-2 w-20" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="mt-2.5 h-2 w-24" />
          </div>
        ))}
      </div>

      <div className="panel p-3">
        <Skeleton className="mb-3 h-3 w-40" />
        <Skeleton className="h-56 w-full" />
      </div>

      <div className="panel p-3">
        <Skeleton className="mb-3 h-3 w-48" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="mb-2 h-6 w-full" />
        ))}
      </div>
    </div>
  );
}
