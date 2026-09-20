import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SkeletonTable } from './Skeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
const HIDE = {
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
export function DataTable({ columns, rows, rowKey, loading, error, onRetry, emptyTitle = 'No records', emptyDescription, emptyIcon, onRowClick, selectedKey, rowAccent, sortBy, sortDir = 'asc', onSortChange, dense, maxHeight = 'none', caption, footer, keyboardRows = true, }) {
    const sorted = useMemo(() => {
        if (!sortBy || !onSortChange)
            return rows;
        const column = columns.find((c) => c.key === sortBy);
        if (!column?.sortValue)
            return rows;
        return [...rows].sort((a, b) => {
            const av = column.sortValue(a);
            const bv = column.sortValue(b);
            if (typeof av === 'number' && typeof bv === 'number')
                return sortDir === 'asc' ? av - bv : bv - av;
            return sortDir === 'asc'
                ? String(av).localeCompare(String(bv))
                : String(bv).localeCompare(String(av));
        });
    }, [rows, sortBy, sortDir, columns, onSortChange]);
    if (loading)
        return _jsx(SkeletonTable, { rows: Math.min(rows.length || 6, 8), cols: columns.length });
    if (error) {
        return _jsx(ErrorState, { message: error, onRetry: onRetry, retrying: false, compact: true });
    }
    if (!sorted.length) {
        return _jsx(EmptyState, { compact: true, icon: emptyIcon, title: emptyTitle, description: emptyDescription });
    }
    return (_jsxs("div", { className: "flex min-w-0 flex-col", children: [_jsx("div", { className: "min-w-0 overflow-x-auto", style: { maxHeight }, children: _jsxs("table", { className: cn('grid-table', dense && 'text-[11.5px]'), children: [caption ? _jsx("caption", { className: "sr-only", children: caption }) : null, _jsx("thead", { children: _jsx("tr", { children: columns.map((column) => {
                                    const sortable = Boolean(column.sortValue && onSortChange);
                                    const active = sortBy === column.key;
                                    return (_jsx("th", { scope: "col", "aria-label": column.ariaLabel, "aria-sort": active ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined, style: { width: column.width }, className: cn(column.hideBelow ? HIDE[column.hideBelow] : '', column.align === 'right' && 'text-right', column.align === 'center' && 'text-center', column.headerClassName), children: sortable ? (_jsxs("button", { type: "button", onClick: () => onSortChange(column.key), className: cn('inline-flex items-center gap-1 rounded-[2px] transition-colors hover:text-ink', active && 'text-term', column.align === 'right' && 'flex-row-reverse'), children: [column.header, active
                                                    ? (sortDir === 'asc' ? _jsx(ChevronUp, { className: "size-2.5", "aria-hidden": true }) : _jsx(ChevronDown, { className: "size-2.5", "aria-hidden": true }))
                                                    : _jsx(ChevronsUpDown, { className: "size-2.5 opacity-45", "aria-hidden": true })] })) : (column.header) }, column.key));
                                }) }) }), _jsx("tbody", { children: sorted.map((row, index) => {
                                const key = rowKey(row);
                                const accent = rowAccent?.(row);
                                const clickable = Boolean(onRowClick);
                                return (_jsx("tr", { "data-selected": selectedKey === key || undefined, tabIndex: clickable && keyboardRows ? 0 : undefined, role: clickable ? 'button' : undefined, "aria-label": clickable ? `Open details for ${key}` : undefined, onClick: clickable ? () => onRowClick(row) : undefined, onKeyDown: clickable && keyboardRows ? (e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            onRowClick(row);
                                        }
                                    } : undefined, className: cn(accent && 'shadow-[inset_2px_0_0_var(--stripe)]', clickable && 'cursor-pointer focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-term'), style: accent ? { ['--stripe']: accent } : undefined, children: columns.map((column) => (_jsx("td", { className: cn(column.hideBelow ? HIDE[column.hideBelow] : '', column.align === 'right' && 'text-right', column.align === 'center' && 'text-center', column.className), children: column.render(row, index) }, column.key))) }, key));
                            }) })] }) }), footer ? _jsx("div", { className: "border-t border-line bg-base", children: footer }) : null] }));
}
