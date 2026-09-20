import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle2, KeyRound, ShieldX, UserX } from 'lucide-react';
import { StatTile } from '@/components/ui/StatTile';
import { Meter } from '@/components/ui/Meter';
import { useQuery } from '@tanstack/react-query';
import { authenticationApi } from '@/services/authenticationApi';
import { queryKeys } from '@/services/queryKeys';
/** Successful / failed / suspicious / locked counters for the auth monitor. */
export function AuthenticationStats() {
    const { data, isLoading } = useQuery({
        queryKey: queryKeys.authSummary(),
        queryFn: () => authenticationApi.summary(),
        staleTime: 15_000,
    });
    const failureRate = data ? Math.round((data.failed / Math.max(1, data.totalToday)) * 100) : 0;
    return (_jsxs("div", { className: "grid grid-cols-2 gap-2 xl:grid-cols-4", children: [_jsx(StatTile, { loading: isLoading, label: "Successful Logins", value: data?.successful ?? 0, icon: _jsx(CheckCircle2, { className: "size-4", "aria-hidden": true }), tone: "term", description: `${data?.uniqueUsers ?? 0} distinct identities · MFA coverage ${data?.mfaCoverage ?? 0}%`, footer: _jsx(Meter, { value: data?.mfaCoverage ?? 0, tone: "term", label: "MFA COVERAGE" }) }), _jsx(StatTile, { loading: isLoading, label: "Failed Logins", value: data?.failed ?? 0, icon: _jsx(KeyRound, { className: "size-4", "aria-hidden": true }), tone: "medium", trend: { delta: 34, period: 'vs yesterday' }, description: `${failureRate}% failure rate across ${data?.totalToday ?? 0} attempts today`, footer: _jsx(Meter, { value: failureRate, tone: "warn", showValue: false }) }), _jsx(StatTile, { loading: isLoading, label: "Suspicious Logins", value: data?.suspicious ?? 0, icon: _jsx(ShieldX, { className: "size-4", "aria-hidden": true }), tone: "high", footer: data?.topSourceIps[0] ? (_jsxs("span", { className: "mono truncate text-[11px] text-ink-4", children: ["TOP SOURCE ", data.topSourceIps[0].ip] })) : undefined }), _jsx(StatTile, { loading: isLoading, label: "Locked Accounts", value: data?.lockedAccounts ?? 0, icon: _jsx(UserX, { className: "size-4", "aria-hidden": true }), tone: "critical", footer: data?.topFailingUsers[0] ? (_jsxs("span", { className: "mono truncate text-[11px] text-ink-4", children: ["MOST TARGETED ", data.topFailingUsers[0].user] })) : undefined })] }));
}
/** Side rail: most-targeted identities and noisiest source addresses. */
export function AuthenticationHotspots() {
    const { data, isLoading } = useQuery({
        queryKey: queryKeys.authSummary(),
        queryFn: () => authenticationApi.summary(),
        staleTime: 15_000,
    });
    if (isLoading || !data) {
        return (_jsx("div", { className: "space-y-2", children: Array.from({ length: 5 }).map((_, i) => (_jsx("div", { className: "h-6 animate-pulse rounded-[2px] bg-raised" }, i))) }));
    }
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("div", { className: "section-rule mb-1.5", children: _jsx("span", { children: "Most targeted identities" }) }), _jsx("ul", { className: "space-y-1", children: data.topFailingUsers.map((entry) => {
                            const pct = (entry.failures / Math.max(1, data.topFailingUsers[0].failures)) * 100;
                            return (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: "mono w-28 shrink-0 truncate text-[11px] text-ink-2", children: entry.user }), _jsx("span", { className: "h-1.5 min-w-0 flex-1 overflow-hidden rounded-[1px] bg-raised", children: _jsx("span", { className: "block h-full bg-high", style: { width: `${pct}%` }, "aria-hidden": true }) }), _jsx("span", { className: "mono tnum w-7 shrink-0 text-right text-[10.5px] text-high", children: entry.failures })] }, entry.user));
                        }) })] }), _jsxs("div", { children: [_jsx("div", { className: "section-rule mb-1.5", children: _jsx("span", { children: "Noisiest sources" }) }), _jsx("ul", { className: "space-y-1", children: data.topSourceIps.map((entry) => (_jsxs("li", { className: "flex items-center gap-2 rounded-[2px] border border-line bg-base px-2 py-1", children: [_jsx("span", { className: `size-1.5 shrink-0 rounded-full ${entry.blocked ? 'bg-critical' : 'bg-term'}`, "aria-hidden": true }), _jsx("span", { className: "mono min-w-0 flex-1 truncate text-[11px] text-cyber", children: entry.ip }), _jsx("span", { className: "mono tnum shrink-0 text-[10.5px] text-ink-3", children: entry.attempts }), _jsx("span", { className: `mono shrink-0 text-[10.5px] font-bold tracking-[0.01em] uppercase ${entry.blocked ? 'text-critical' : 'text-term'}`, children: entry.blocked ? 'DENIED' : 'OPEN' })] }, entry.ip))) })] })] }));
}
