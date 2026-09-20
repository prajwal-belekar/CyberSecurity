import { cn } from '@/utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('relative overflow-hidden rounded-[2px] bg-raised', className)}
    >
      <div className="absolute inset-0 -translate-x-full animate-sweep bg-gradient-to-r from-transparent via-white/[0.045] to-transparent" />
    </div>
  );
}

/**
 * Skeleton loaders. The spec forbids one giant app spinner — every
 * API-dependent surface ships a structural placeholder shaped like its content.
 */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-1.5', className)} role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-2.5', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div role="status" aria-label="Loading table" className="space-y-0">
      <div className="flex gap-3 border-b border-line-2 bg-base px-2.5 py-2">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-2 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3 border-b border-line px-2.5 py-2.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn('h-2.5 flex-1', c === 0 && 'max-w-16')} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStat({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }} role="status" aria-label="Loading statistics">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="panel p-3">
          <Skeleton className="mb-2 h-2 w-20" />
          <Skeleton className="h-7 w-14" />
          <Skeleton className="mt-2 h-2 w-24" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 220, bars = 28 }: { height?: number; bars?: number }) {
  return (
    <div role="status" aria-label="Loading chart" className="flex items-end gap-1.5" style={{ height }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} className="flex-1" style={{ height: `${28 + ((i * 37) % 62)}%` }}>
          <Skeleton className="h-full w-full" />
        </div>
      ))}
    </div>
  );
}
