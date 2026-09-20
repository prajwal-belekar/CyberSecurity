import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Database, Globe2, Radar, Users } from 'lucide-react';
import { StatTile } from '@/components/ui/StatTile';
import { SeverityDonut, CapabilityRadar } from '@/components/ui/Chart';
import { Panel } from '@/components/ui/Card';
import { Skeleton, SkeletonChart } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionRule } from '@/components/ui/KeyValue';
import { Meter } from '@/components/ui/Meter';
import { useQuery } from '@tanstack/react-query';
import { intelligenceApi } from '@/services/intelligenceApi';
import { queryKeys } from '@/services/queryKeys';
import { formatRelative } from '@/utils/dates';
import { severityMeta } from '@/utils/severity';
/** Feed health counters plus type/risk/source/actor breakdowns. */
export function IntelSummary() {
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: queryKeys.intelligenceSummary(),
        queryFn: () => intelligenceApi.summary(),
        staleTime: 20_000,
    });
    if (isLoading) {
        return (_jsx("div", { className: "grid grid-cols-2 gap-2 xl:grid-cols-4", children: Array.from({ length: 4 }).map((_, i) => _jsx(Skeleton, { className: "h-24 w-full" }, i)) }));
    }
    if (isError || !data) {
        return (_jsx(Panel, { className: "min-w-0", children: _jsx(ErrorState, { title: "Intelligence summary unavailable", message: error?.message ?? 'No summary returned.', onRetry: () => refetch() }) }));
    }
    const maxSource = Math.max(1, ...data.bySource.map((entry) => entry.count));
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 gap-2 xl:grid-cols-4", children: [_jsx(StatTile, { label: "Indicators Tracked", value: data.totalIndicators, icon: _jsx(Database, { className: "size-4", "aria-hidden": true }), tone: "cyber", description: "Active entries across every connected feed" }), _jsx(StatTile, { label: "Added Today", value: data.newToday, icon: _jsx(Radar, { className: "size-4", "aria-hidden": true }), tone: "term", trend: { delta: 12, period: 'vs yesterday' }, description: "Newly ingested and correlated indicators" }), _jsx(StatTile, { label: "Feed Sources", value: data.bySource.length, icon: _jsx(Globe2, { className: "size-4", "aria-hidden": true }), tone: "neutral", description: `Last sync ${formatRelative(data.bySource[0]?.lastSync ?? new Date().toISOString())}` }), _jsx(StatTile, { label: "Tracked Actors", value: data.topActors.length, icon: _jsx(Users, { className: "size-4", "aria-hidden": true }), tone: "high", description: data.topActors[0] ? `Most active: ${data.topActors[0].name}` : undefined })] }), _jsxs("div", { className: "grid min-w-0 gap-2.5 xl:grid-cols-3", children: [_jsx(Panel, { title: "Risk Distribution", className: "min-w-0", children: data.byRisk.length ? (_jsx(SeverityDonut, { data: data.byRisk.map((entry) => ({
                                name: severityMeta(entry.risk).label,
                                value: entry.count,
                                color: severityMeta(entry.risk).hex,
                            })), height: 196, ariaLabel: "Indicators by risk level" })) : (_jsx(EmptyState, { compact: true, title: "No risk breakdown" })) }), _jsx(Panel, { title: "Indicator Types", className: "min-w-0", children: data.byType.length ? (_jsx(CapabilityRadar, { data: data.byType.map((entry) => ({ subject: entry.type.replace(/_/g, ' ').toUpperCase(), value: entry.count })), height: 196, ariaLabel: "Indicators by type" })) : (_jsx(EmptyState, { compact: true, title: "No type breakdown" })) }), _jsxs(Panel, { title: "Feeds & Actors", className: "min-w-0", children: [_jsx(SectionRule, { className: "mb-1.5", children: _jsx("span", { children: "Feed sources" }) }), _jsx("ul", { className: "space-y-1", children: data.bySource.map((entry) => (_jsxs("li", { children: [_jsxs("div", { className: "mb-0.5 flex items-baseline justify-between gap-2", children: [_jsx("span", { className: "mono truncate text-[10.5px] text-ink-2", children: entry.source }), _jsx("span", { className: "mono tnum shrink-0 text-[11px] text-ink-4", children: entry.count })] }), _jsx(Meter, { value: (entry.count / maxSource) * 100, tone: "cyber", showValue: false }), _jsxs("p", { className: "mono mt-0.5 text-[10.5px] text-ink-4", children: ["SYNCED ", formatRelative(entry.lastSync)] })] }, entry.source))) }), _jsx(SectionRule, { className: "mt-2.5 mb-1.5", children: _jsx("span", { children: "Top actors" }) }), data.topActors.length ? (_jsx("ul", { className: "space-y-px", children: data.topActors.map((actor) => (_jsxs("li", { className: "flex items-center gap-2 border-b border-line py-1 last:border-b-0", children: [_jsx("span", { className: "mono min-w-0 flex-1 truncate text-[10.5px] text-ink-2", children: actor.name }), _jsx("span", { className: "mono shrink-0 text-[10.5px] text-ink-4", children: actor.country }), _jsx("span", { className: cnCountTone(actor.incidents), children: actor.incidents })] }, actor.name))) })) : (_jsx("p", { className: "mono text-[11px] text-ink-4", children: "No attributed activity." })), data.byRisk.length ? (_jsxs("p", { className: "mono mt-2 text-[10.5px] text-ink-4", children: ["DOMINANT RISK :: ", severityMeta(data.byRisk.reduce((a, b) => (a.count > b.count ? a : b)).risk).label] })) : null] })] })] }));
}
function cnCountTone(count) {
    return `mono tnum shrink-0 text-[10.5px] font-semibold ${count >= 4 ? 'text-critical' : count >= 2 ? 'text-high' : 'text-ink-3'}`;
}
export { SkeletonChart };
