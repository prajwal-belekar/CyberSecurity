import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SkeletonTable } from './Skeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Accessible label used when the header is an icon. */
  ariaLabel?: string;
  render: (row: T, index: number) => ReactNode;
  /** Optional raw value used for sorting. */
  sortValue?: (row: T) => string | number;
  className?: string;
  headerClassName?: string;
  /** Hide below this breakpoint. */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'right' | 'center';
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  emptyIcon?: ReactNode;
  onRowClick?: (row: T) => void;
  selectedKey?: string | null;
  /** Row-level severity stripe for instant triage scanning. */
  rowAccent?: (row: T) => string | undefined;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSortChange?: (key: string) => void;
  dense?: boolean;
  maxHeight?: string;
  caption?: string;
  footer?: ReactNode;
  /** Enables keyboard row activation (Enter/Space) when rows are clickable. */
  keyboardRows?: boolean;
}

const HIDE: Record<string, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
};

/**
 * Terminal-style data grid: hairline borders, sticky uppercase mono header,
 * optional severity stripe, sorting, loading / error / empty states and full
 * keyboard support for row activation.
 */
export function DataTable<T>({
  columns, rows, rowKey, loading, error, onRetry,
  emptyTitle = 'No records', emptyDescription, emptyIcon,
  onRowClick, selectedKey, rowAccent, sortBy, sortDir = 'asc', onSortChange,
  dense, maxHeight = 'none', caption, footer, keyboardRows = true,
}: DataTableProps<T>) {
  const sorted = useMemo(() => {
    if (!sortBy || !onSortChange) return rows;
    const column = columns.find((c) => c.key === sortBy);
    if (!column?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [rows, sortBy, sortDir, columns, onSortChange]);

  if (loading) return <SkeletonTable rows={Math.min(rows.length || 6, 8)} cols={columns.length} />;

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} retrying={false} compact />;
  }

  if (!sorted.length) {
    return <EmptyState compact icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="flex min-w-0 flex-col">
      <div className="min-w-0 overflow-x-auto" style={{ maxHeight }}>
        <table className={cn('grid-table', dense && 'text-[11.5px]')}>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr>
              {columns.map((column) => {
                const sortable = Boolean(column.sortValue && onSortChange);
                const active = sortBy === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-label={column.ariaLabel}
                    aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                    style={{ width: column.width }}
                    className={cn(
                      column.hideBelow ? HIDE[column.hideBelow] : '',
                      column.align === 'right' && 'text-right',
                      column.align === 'center' && 'text-center',
                      column.headerClassName,
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => onSortChange!(column.key)}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-[2px] transition-colors hover:text-ink',
                          active && 'text-term',
                          column.align === 'right' && 'flex-row-reverse',
                        )}
                      >
                        {column.header}
                        {active
                          ? (sortDir === 'asc' ? <ChevronUp className="size-2.5" aria-hidden /> : <ChevronDown className="size-2.5" aria-hidden />)
                          : <ChevronsUpDown className="size-2.5 opacity-45" aria-hidden />}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, index) => {
              const key = rowKey(row);
              const accent = rowAccent?.(row);
              const clickable = Boolean(onRowClick);
              return (
                <tr
                  key={key}
                  data-selected={selectedKey === key || undefined}
                  tabIndex={clickable && keyboardRows ? 0 : undefined}
                  role={clickable ? 'button' : undefined}
                  aria-label={clickable ? `Open details for ${key}` : undefined}
                  onClick={clickable ? () => onRowClick!(row) : undefined}
                  onKeyDown={clickable && keyboardRows ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick!(row); }
                  } : undefined}
                  className={cn(
                    accent && 'shadow-[inset_2px_0_0_var(--stripe)]',
                    clickable && 'cursor-pointer focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-term',
                  )}
                  style={accent ? ({ ['--stripe' as string]: accent } as CSSProperties) : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        column.hideBelow ? HIDE[column.hideBelow] : '',
                        column.align === 'right' && 'text-right',
                        column.align === 'center' && 'text-center',
                        column.className,
                      )}
                    >
                      {column.render(row, index)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {footer ? <div className="border-t border-line bg-base">{footer}</div> : null}
    </div>
  );
}
