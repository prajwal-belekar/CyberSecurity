import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { DualBarChart } from '@/components/ui/Chart';
import { SkeletonChart } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { AuthenticationStats, AuthenticationHotspots } from '@/components/authentication/AuthenticationStats';
import { LoginTable } from '@/components/authentication/LoginTable';
import { LoginTimeline } from '@/components/authentication/LoginTimeline';
import { authenticationApi } from '@/services/authenticationApi';
import { queryKeys } from '@/services/queryKeys';
/** Authentication Monitor — outcomes chart, hotspots, sequences and the login grid. */
export default function Authentication() {
    const [range, setRange] = useState('24H');
    const meta = routeMetaFor('/authentication');
    const series = useQuery({
        queryKey: queryKeys.authSeries(range),
        queryFn: () => authenticationApi.outcomesSeries(range),
    });
    const totals = (series.data ?? []).reduce((acc, point) => ({
        successful: acc.successful + Number(point.successful ?? 0),
        failed: acc.failed + Number(point.failed ?? 0),
        suspicious: acc.suspicious + Number(point.suspicious ?? 0),
    }), { successful: 0, failed: 0, suspicious: 0 });
    return (_jsxs("div", { className: "space-y-2.5 p-2.5 sm:p-3", children: [_jsx(Breadcrumbs, { items: meta.segments }), _jsx(PageHeader, { title: "Authentication Monitor", description: "Logon outcomes, MFA coverage and lockouts.", status: _jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]", children: [_jsx(KeyRound, { className: "size-2.5 text-cyber", "aria-hidden": true }), _jsx("span", { className: "text-[11px] text-ink-3", children: "Identity feed live" })] }) }), _jsx(AuthenticationStats, {}), _jsxs("div", { className: "grid min-w-0 gap-2.5 xl:grid-cols-3", children: [_jsx(Panel, { title: "Successful vs Failed Logins", icon: _jsx(KeyRound, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0 xl:col-span-2", noPadding: true, actions: _jsx(Tabs, { ariaLabel: "Login chart range", value: range, onChange: (value) => setRange(value), items: [
                                { value: '24H', label: '24H' },
                                { value: '7D', label: '7D' },
                                { value: '30D', label: '30D' },
                            ] }), children: _jsx("div", { className: "p-2.5", children: series.isLoading ? (_jsx(SkeletonChart, { height: 240 })) : series.isError ? (_jsx(ErrorState, { title: "Unable to load login series", message: series.error.message, onRetry: () => series.refetch(), compact: true })) : !series.data?.length ? (_jsx(EmptyState, { icon: _jsx(KeyRound, { className: "size-4", "aria-hidden": true }), title: "No authentication data", description: "No logon events recorded in this window." })) : (_jsxs(_Fragment, { children: [_jsx(DualBarChart, { data: series.data, height: 240, ariaLabel: `Successful versus failed logins over the last ${range}`, keys: [
                                            { key: 'successful', name: 'SUCCESSFUL', color: '#3fb37f' },
                                            { key: 'failed', name: 'FAILED', color: '#dd8a52' },
                                            { key: 'suspicious', name: 'SUSPICIOUS', color: '#de6375' },
                                        ] }), _jsx("div", { className: "mt-1.5 grid grid-cols-3 gap-2 border-t border-line pt-2", children: [
                                            { label: 'SUCCESSFUL', value: totals.successful, tone: 'text-term' },
                                            { label: 'FAILED', value: totals.failed, tone: 'text-high' },
                                            { label: 'SUSPICIOUS', value: totals.suspicious, tone: 'text-critical' },
                                        ].map((cell) => (_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "label-xs truncate", children: [cell.label, " \u00B7 ", range] }), _jsx("div", { className: `mono tnum mt-0.5 text-[16px] leading-none font-semibold ${cell.tone}`, children: cell.value.toLocaleString() })] }, cell.label))) })] })) }) }), _jsx(Panel, { title: "Access Hotspots", className: "min-w-0", children: _jsx(AuthenticationHotspots, {}) })] }), _jsx(LoginTimeline, { limit: 2 }), _jsx(LoginTable, {})] }));
}
