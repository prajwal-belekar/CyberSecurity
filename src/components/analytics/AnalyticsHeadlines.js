import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
/** Lower-is-better metrics: a negative delta is an improvement. */
const LOWER_IS_BETTER = new Set(['Mean time to detect', 'Mean time to resolve', 'False-positive rate']);
/** KPI strip: headline metric, delta against the previous period, and the hint. */
export function AnalyticsHeadlines({ headlines, loading }) {
    if (loading) {
        return (_jsx("div", { className: "grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6", children: Array.from({ length: 6 }).map((_, index) => _jsx(Skeleton, { className: "h-[76px] w-full" }, index)) }));
    }
    return (_jsx("div", { className: "grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6", children: headlines.map((headline) => {
            const improving = LOWER_IS_BETTER.has(headline.label) ? headline.delta < 0 : headline.delta > 0;
            const flat = Math.abs(headline.delta) < 0.05;
            return (_jsxs("div", { className: "panel relative overflow-hidden p-2.5", children: [_jsx("span", { className: cn('absolute inset-x-0 top-0 h-[2px]', flat ? 'bg-line-3' : improving ? 'bg-term' : 'bg-high'), "aria-hidden": true }), _jsx("p", { className: "label-xs truncate", children: headline.label }), _jsx("p", { className: "mono tnum mt-1 text-[22px] leading-none font-bold text-ink", children: headline.value }), _jsxs("p", { className: cn('mono mt-1.5 flex items-center gap-1 text-[11px] tracking-[0.01em] uppercase', flat ? 'text-ink-4' : improving ? 'text-term' : 'text-high'), children: [flat ? null : improving ? _jsx(TrendingDown, { className: "size-2.5", "aria-hidden": true }) : _jsx(TrendingUp, { className: "size-2.5", "aria-hidden": true }), headline.delta > 0 ? '+' : '', headline.delta.toFixed(1), "%", _jsx("span", { className: "text-ink-4 normal-case", children: headline.hint })] })] }, headline.label));
        }) }));
}
