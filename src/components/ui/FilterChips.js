import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
/**
 * Active-filter row. Every removable filter is visible as a chip, with a single
 * "Clear all" escape hatch — no hidden state driving the result set.
 */
export function FilterChips({ chips, onClearAll, className }) {
    if (!chips.length)
        return null;
    return (_jsxs("div", { className: cn('flex flex-wrap items-center gap-1.5', className), children: [_jsx("span", { className: "label-xs", children: "Active filters" }), chips.map((chip) => (_jsxs("span", { className: "inline-flex items-center gap-1 rounded-[2px] border border-term/30 bg-term/8 px-1.5 py-[2px] font-mono text-[11px] text-term", children: [_jsxs("span", { className: "text-ink-4", children: [chip.label, ":"] }), _jsx("span", { className: "max-w-40 truncate uppercase", children: chip.value }), _jsx("button", { type: "button", onClick: chip.onRemove, "aria-label": `Remove filter ${chip.label} ${chip.value}`, className: "rounded-[1px] p-[1px] text-term/70 transition-colors hover:bg-term/20 hover:text-term", children: _jsx(X, { className: "size-2.5", "aria-hidden": true }) })] }, chip.id))), _jsx("button", { type: "button", onClick: onClearAll, className: "rounded-[2px] border border-line-2 px-1.5 py-[2px] text-[11px] text-ink-3 transition-colors hover:border-critical/40 hover:text-critical", children: "Clear all" })] }));
}
