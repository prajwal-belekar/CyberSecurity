import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="mono flex min-w-0 items-center gap-1 text-[11px] tracking-[0.02em] uppercase">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 ? <ChevronRight className="size-2.5 shrink-0 text-ink-4" aria-hidden /> : null}
              {item.to && !last ? (
                <Link to={item.to} className="shrink-0 text-ink-4 transition-colors hover:text-term">
                  {item.label}
                </Link>
              ) : (
                <span className={cn('truncate', last ? 'text-ink-2' : 'text-ink-4')} aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
