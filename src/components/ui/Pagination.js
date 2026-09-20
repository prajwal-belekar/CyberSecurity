import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
/** Compact record-range pager styled to match the data grid. */
export function Pagination({ page, pageSize, total, onChange, className, label = 'records' }) {
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(total, page * pageSize);
    const pages = Array.from({ length: pageCount }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1)
        .filter((p, i, arr) => arr.indexOf(p) === i);
    return (_jsxs("nav", { "aria-label": "Pagination", className: cn('flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5', className), children: [_jsxs("span", { className: "mono tnum text-[10.5px] text-ink-4", children: [from, "\u2013", to, " / ", total, " ", label] }), _jsxs("div", { className: "flex items-center gap-0.5", children: [_jsx("button", { type: "button", onClick: () => onChange(Math.max(1, page - 1)), disabled: page <= 1, "aria-label": "Previous page", className: "inline-flex size-6 items-center justify-center rounded-[2px] border border-line-2 text-ink-3 transition-colors hover:border-line-3 hover:text-ink disabled:opacity-30 disabled:hover:border-line-2", children: _jsx(ChevronLeft, { className: "size-3.5", "aria-hidden": true }) }), pages.map((p, i) => (_jsxs("span", { className: "flex items-center", children: [i > 0 && p - pages[i - 1] > 1 ? _jsx("span", { className: "px-1 font-mono text-[11px] text-ink-4", children: "\u2026" }) : null, _jsx("button", { type: "button", onClick: () => onChange(p), "aria-current": p === page ? 'page' : undefined, className: cn('mono tnum inline-flex h-6 min-w-6 items-center justify-center rounded-[2px] border px-1.5 text-[10.5px] transition-colors', p === page
                                    ? 'border-term/45 bg-term/12 text-term'
                                    : 'border-line-2 text-ink-3 hover:border-line-3 hover:text-ink'), children: p })] }, p))), _jsx("button", { type: "button", onClick: () => onChange(Math.min(pageCount, page + 1)), disabled: page >= pageCount, "aria-label": "Next page", className: "inline-flex size-6 items-center justify-center rounded-[2px] border border-line-2 text-ink-3 transition-colors hover:border-line-3 hover:text-ink disabled:opacity-30 disabled:hover:border-line-2", children: _jsx(ChevronRight, { className: "size-3.5", "aria-hidden": true }) })] })] }));
}
