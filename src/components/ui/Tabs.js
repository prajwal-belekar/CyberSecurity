import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
/** Segmented control used for time ranges, view modes and detail sections. */
export function Tabs({ items, value, onChange, className, size = 'sm', ariaLabel, scrollable = false, }) {
    return (_jsx("div", { role: "tablist", "aria-label": ariaLabel, className: cn('inline-flex items-center gap-0.5 rounded-[2px] border border-line bg-base p-0.5', scrollable && 'max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', className), children: items.map((item) => {
            const active = item.value === value;
            return (_jsxs("button", { role: "tab", type: "button", "aria-selected": active, disabled: item.disabled, onClick: () => onChange(item.value), className: cn('inline-flex shrink-0 items-center gap-1 rounded-[1px] font-mono font-semibold uppercase tracking-[0.01em] transition-colors duration-150', size === 'sm' ? 'h-5.5 px-2 text-[11px]' : 'h-7 px-3 text-[11px]', active
                    ? 'bg-term/12 text-term shadow-[inset_0_0_0_1px_rgba(63,179,127,0.35)]'
                    : 'text-ink-4 hover:bg-raised hover:text-ink-2', item.disabled && 'cursor-not-allowed opacity-40'), children: [item.icon ? _jsx("span", { "aria-hidden": true, children: item.icon }) : null, item.label, typeof item.count === 'number' ? (_jsx("span", { className: cn('tnum rounded-[1px] px-1 text-[10.5px]', active ? 'bg-term/20 text-term' : 'bg-raised text-ink-4'), children: item.count })) : null] }, item.value));
        }) }));
}
