import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, BarChart3, Clock, PieChart, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton, SkeletonChart } from '@/components/ui/Skeleton';
import { SectionRule } from '@/components/ui/KeyValue';
import { Meter } from '@/components/ui/Meter';
import { MultiLineChart, DualBarChart, SeverityDonut } from '@/components/ui/Chart';
import { AnalyticsHeadlines } from '@/components/analytics/AnalyticsHeadlines';
import { RuleEfficacy } from '@/components/analytics/RuleEfficacy';
import { analyticsApi } from '@/services/analyticsApi';
import { queryKeys } from '@/services/queryKeys';
import { cn } from '@/utils/cn';
const RANGES = ['24H', '7D', '30D', '90D'];
const THREAT_KEYS = [
    { key: 'phishing', name: 'PHISHING', color: '#9481c6' },
    { key: 'authentication', name: 'AUTH', color: '#dd8a52' },
    { key: 'network', name: 'NETWORK', color: '#4a9ec4' },
    { key: 'malware', name: 'MALWARE', color: '#de6375' },
    { key: 'web', name: 'WEB', color: '#3fb37f' },
];
/** Security Analytics — time-filtered trends, mixes and detection quality. */
export default function Analytics() {
    const meta = routeMetaFor('/analytics');
    const [range, setRange] = useState('30D');
    const bundle = useQuery({
        queryKey: queryKeys.analytics(range),
        queryFn: () => analyticsApi.bundle(range),
        placeholderData: (previous) => previous,
    });
    const data = bundle.data;
    const resolutionColumns = [
        { key: 'label', header: 'Priority', sortValue: (row) => row.label, width: '80px', render: (row) => (_jsx("span", { className: cn('mono text-[10.5px] font-bold', row.label === 'P1' ? 'text-critical' : row.label === 'P2' ? 'text-high' : row.label === 'P3' ? 'text-medium' : 'text-low'), children: row.label })) },
        { key: 'created', header: 'Created', sortValue: (row) => row.created, width: '80px', align: 'right', render: (row) => _jsx("span", { className: "mono tnum text-[11px] text-ink-2", children: row.created }) },
        { key: 'resolved', header: 'Resolved', sortValue: (row) => row.resolved, width: '88px', align: 'right', render: (row) => _jsx("span", { className: "mono tnum text-[11px] text-term", children: row.resolved }) },
        { key: 'backlog', header: 'Open', sortValue: (row) => row.created - row.resolved, width: '64px', align: 'right', render: (row) => {
                const open = row.created - row.resolved;
                return _jsx("span", { className: cn('mono tnum text-[11px]', open ? 'text-high' : 'text-ink-4'), children: open });
            } },
        { key: 'avgHours', header: 'Avg Resolution', sortValue: (row) => row.avgHours, width: '168px', render: (row) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-16", children: _jsx(Meter, { value: Math.min(100, (row.avgHours / 60) * 100), tone: row.avgHours > 24 ? 'err' : row.avgHours > 12 ? 'warn' : 'term', showValue: false }) }), _jsxs("span", { className: "mono tnum shrink-0 text-[10.5px] text-ink-2", children: [row.avgHours.toFixed(1), "h"] })] })) },
    ];
    return (_jsxs("div", { className: "space-y-2.5 p-2.5 sm:p-3", children: [_jsx(Breadcrumbs, { items: meta.segments }), _jsx(PageHeader, { title: "Security Analytics", description: "Detection volume, response performance and rule quality.", status: _jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]", children: [_jsx(BarChart3, { className: "size-2.5 text-cyber", "aria-hidden": true }), _jsxs("span", { className: "mono text-[11px] font-semibold tracking-[0.02em] text-ink-2 uppercase", children: ["WINDOW ", range] })] }), actions: _jsx(Tabs, { ariaLabel: "Analytics time window", value: range, onChange: (value) => setRange(value), items: RANGES.map((value) => ({ value, label: value })) }) }), bundle.isError ? (_jsx(Panel, { className: "min-w-0", children: _jsx(ErrorState, { title: "Analytics unavailable", message: bundle.error.message, onRetry: () => bundle.refetch() }) })) : (_jsxs(_Fragment, { children: [_jsx(AnalyticsHeadlines, { headlines: data?.headlines ?? [], loading: bundle.isLoading }), _jsxs("div", { className: "grid min-w-0 gap-2.5 xl:grid-cols-3", children: [_jsx(Panel, { title: "Threat Trend by Category", icon: _jsx(Activity, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0 xl:col-span-2", actions: _jsx(Badge, { tone: "neutral", children: range }), children: bundle.isLoading ? (_jsx(SkeletonChart, { height: 260 })) : !data?.threatTrend.length ? (_jsx(EmptyState, { icon: _jsx(Activity, { className: "size-4", "aria-hidden": true }), title: "No trend data", description: "No detections were recorded in this window." })) : (_jsx(MultiLineChart, { data: data.threatTrend, keys: THREAT_KEYS, height: 260, ariaLabel: `Threat trend by category over the last ${range}` })) }), _jsx(Panel, { title: "Severity Mix", icon: _jsx(PieChart, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", children: bundle.isLoading ? (_jsx(SkeletonChart, { height: 260 })) : !data?.severity.length ? (_jsx(EmptyState, { compact: true, title: "No severity data" })) : (_jsxs(_Fragment, { children: [_jsx(SeverityDonut, { data: data.severity.map((entry) => ({ name: entry.severity, value: entry.count, color: entry.color })), height: 196, ariaLabel: `Detections by severity over the last ${range}` }), _jsx("ul", { className: "mt-1.5 space-y-1 border-t border-line pt-1.5", children: data.severity.map((entry) => {
                                                const total = data.severity.reduce((sum, item) => sum + item.count, 0);
                                                const share = total ? (entry.count / total) * 100 : 0;
                                                return (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: "size-1.5 shrink-0 rounded-full", style: { background: entry.color }, "aria-hidden": true }), _jsx("span", { className: "mono min-w-0 flex-1 truncate text-[10.5px] text-ink-3 uppercase", children: entry.severity }), _jsx("span", { className: "mono tnum shrink-0 text-[10.5px] text-ink-2", children: entry.count.toLocaleString() }), _jsxs("span", { className: "mono tnum w-10 shrink-0 text-right text-[11px] text-ink-4", children: [share.toFixed(1), "%"] })] }, entry.key));
                                            }) })] })) })] }), _jsxs("div", { className: "grid min-w-0 gap-2.5 xl:grid-cols-3", children: [_jsx(Panel, { title: "Event Volume", icon: _jsx(BarChart3, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0 xl:col-span-2", children: bundle.isLoading ? (_jsx(SkeletonChart, { height: 220 })) : !data?.eventVolume.length ? (_jsx(EmptyState, { compact: true, title: "No volume data" })) : (_jsx(DualBarChart, { data: data.eventVolume, height: 220, stacked: true, ariaLabel: `Ingested versus correlated events over the last ${range}`, keys: [
                                        { key: 'ingested', name: 'INGESTED', color: '#4a9ec4' },
                                        { key: 'correlated', name: 'CORRELATED', color: '#3fb37f' },
                                        { key: 'dropped', name: 'DROPPED', color: '#dd8a52' },
                                    ] })) }), _jsx(Panel, { title: "Incident Throughput", icon: _jsx(Clock, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", children: bundle.isLoading ? (_jsx(SkeletonChart, { height: 220 })) : !data?.incidentTrend.length ? (_jsx(EmptyState, { compact: true, title: "No incident data" })) : (_jsx(DualBarChart, { data: data.incidentTrend, height: 220, ariaLabel: `Incidents created versus resolved over the last ${range}`, keys: [
                                        { key: 'created', name: 'CREATED', color: '#de6375' },
                                        { key: 'resolved', name: 'RESOLVED', color: '#3fb37f' },
                                        { key: 'breached', name: 'SLA BREACH', color: '#d0a94f' },
                                    ] })) })] }), _jsxs("div", { className: "grid min-w-0 gap-2.5 xl:grid-cols-3", children: [_jsx(Panel, { title: "Resolution Performance", icon: _jsx(ShieldCheck, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0 xl:col-span-2", noPadding: true, children: bundle.isLoading ? (_jsx("div", { className: "space-y-2 p-2.5", children: Array.from({ length: 4 }).map((_, index) => _jsx(Skeleton, { className: "h-8 w-full" }, index)) })) : !data?.resolution.length ? (_jsx(EmptyState, { compact: true, title: "No resolution data" })) : (_jsx(DataTable, { columns: resolutionColumns, rows: data.resolution, rowKey: (row) => row.label, caption: "Resolution performance by priority" })) }), _jsx(Panel, { title: "Category Distribution", className: "min-w-0", children: bundle.isLoading ? (_jsx("div", { className: "space-y-2", children: Array.from({ length: 5 }).map((_, index) => _jsx(Skeleton, { className: "h-6 w-full" }, index)) })) : !data?.categories.length ? (_jsx(EmptyState, { compact: true, title: "No category data" })) : (() => {
                                    const total = data.categories.reduce((sum, entry) => sum + entry.count, 0);
                                    return (_jsxs(_Fragment, { children: [_jsx(SectionRule, { className: "mb-1.5", children: _jsx("span", { children: "Detections by category" }) }), _jsx("ul", { className: "space-y-1.5", children: data.categories.map((entry) => {
                                                    const share = total ? (entry.count / total) * 100 : 0;
                                                    return (_jsxs("li", { children: [_jsxs("div", { className: "mb-0.5 flex items-baseline justify-between gap-2", children: [_jsx("span", { className: "mono truncate text-[10.5px] text-ink-2 uppercase", children: entry.category }), _jsxs("span", { className: "mono tnum shrink-0 text-[11px] text-ink-4", children: [entry.count.toLocaleString(), " \u00B7 ", share.toFixed(1), "%"] })] }), _jsx("div", { className: "h-1.5 w-full overflow-hidden rounded-[1px] bg-raised", children: _jsx("div", { className: "h-full", style: { width: `${share}%`, background: entry.color }, "aria-hidden": true }) })] }, entry.key));
                                                }) }), _jsxs("p", { className: "mono mt-2 border-t border-line pt-1.5 text-[11px] text-ink-4", children: ["TOTAL ", total.toLocaleString(), " DETECTIONS \u00B7 ", range] })] }));
                                })() })] }), _jsx(RuleEfficacy, { rules: data?.ruleEfficacy ?? [] })] }))] }));
}
