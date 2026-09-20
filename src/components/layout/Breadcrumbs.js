import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
export function Breadcrumbs({ items, className }) {
    return (_jsx("nav", { "aria-label": "Breadcrumb", className: cn('min-w-0', className), children: _jsx("ol", { className: "mono flex min-w-0 items-center gap-1 text-[11px] tracking-[0.02em] uppercase", children: items.map((item, index) => {
                const last = index === items.length - 1;
                return (_jsxs("li", { className: "flex min-w-0 items-center gap-1", children: [index > 0 ? _jsx(ChevronRight, { className: "size-2.5 shrink-0 text-ink-4", "aria-hidden": true }) : null, item.to && !last ? (_jsx(Link, { to: item.to, className: "shrink-0 text-ink-4 transition-colors hover:text-term", children: item.label })) : (_jsx("span", { className: cn('truncate', last ? 'text-ink-2' : 'text-ink-4'), "aria-current": last ? 'page' : undefined, children: item.label }))] }, `${item.label}-${index}`));
            }) }) }));
}
