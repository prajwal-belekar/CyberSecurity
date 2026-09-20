import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, ShieldAlert, Table2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ThreatFilters } from '@/components/threats/ThreatFilters';
import { ThreatTable } from '@/components/threats/ThreatTable';
import { ThreatCard } from '@/components/threats/ThreatCard';
import { useThreats } from '@/hooks/useThreats';
import { useThreatSummary } from '@/hooks/useSecurityEvents';
import { SEVERITY_META } from '@/utils/severity';
const PAGE_SIZE = 12;
const EMPTY_FILTERS = {};
/** Threat Monitor — summary, filters, and a sortable triage grid. */
export default function Threats() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [view, setView] = useState('table');
    const [page, setPage] = useState(1);
    const [sortKey, setSortKey] = useState('lastSeen');
    const [sortDir, setSortDir] = useState('desc');
    const [selected, setSelected] = useState(null);
    const { data: summary, isLoading: summaryLoading, isError: summaryError, error: summaryErr, refetch: refetchSummary } = useThreatSummary();
    // Deep links from dashboard tiles: /threats?severity=critical
    useEffect(() => {
        const severity = searchParams.get('severity');
        if (severity && SEVERITY_META[severity]) {
            setFilters((prev) => ({ ...prev, severity: [severity] }));
        }
        const status = searchParams.get('status');
        if (status)
            setFilters((prev) => ({ ...prev, status: [status] }));
    }, [searchParams]);
    const { data: threats = [], isLoading, isError, error, refetch, isFetching } = useThreats(filters);
    const paged = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return threats.slice(start, start + PAGE_SIZE);
    }, [threats, page]);
    useEffect(() => { setPage(1); }, [filters]);
    const onSort = (key) => {
        if (key === sortKey)
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortKey(key);
            setSortDir('desc');
        }
    };
    const meta = routeMetaFor('/threats');
    return (_jsxs("div", { className: "space-y-2.5 p-2.5 sm:p-3", children: [_jsx(Breadcrumbs, { items: meta.segments }), _jsx(PageHeader, { title: "Threat Monitor", description: "Detections by severity, source, confidence and status.", status: _jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]", children: [_jsx("span", { className: "size-1.5 animate-pulse-dot rounded-full bg-term text-term", "aria-hidden": true }), _jsx("span", { className: "text-[11px] text-ink-3", children: "Detection active" })] }), actions: _jsx(Tabs, { ariaLabel: "Threat view mode", value: view, onChange: setView, items: [
                        { value: 'table', label: 'Grid', icon: _jsx(Table2, { className: "size-3", "aria-hidden": true }) },
                        { value: 'cards', label: 'Cards', icon: _jsx(LayoutGrid, { className: "size-3", "aria-hidden": true }) },
                    ] }) }), _jsx("div", { className: "grid grid-cols-2 gap-2 lg:grid-cols-5", children: summaryError ? (_jsx("div", { className: "panel col-span-full", children: _jsx(ErrorState, { compact: true, title: "Unable to load threat summary", message: summaryErr.message, onRetry: () => refetchSummary() }) })) : (['critical', 'high', 'medium', 'low', 'info'].map((severity) => {
                    const value = summary ? summary[severity] : 0;
                    const active = (filters.severity ?? []).includes(severity);
                    return (_jsx(StatTile, { loading: summaryLoading, label: `${SEVERITY_META[severity].label} Threats`, value: value, padded: severity === 'critical' || severity === 'high', tone: severity === 'critical' || severity === 'high' ? severity : severity === 'medium' ? 'medium' : 'cyber', icon: _jsx(ShieldAlert, { className: "size-3.5", "aria-hidden": true }), onClick: () => setFilters((prev) => ({
                            ...prev,
                            severity: active ? undefined : [severity],
                        })), className: active ? 'border-term/45 bg-term/5' : undefined, description: active ? 'Filter active — click to clear' : `${Math.round(((summary?.total ?? 1) > 0 ? (value / (summary?.total ?? 1)) * 100 : 0))}% of all events` }, severity));
                })) }), _jsxs(Panel, { noPadding: true, className: "min-w-0", children: [_jsx("div", { className: "border-b border-line bg-base px-2.5 py-2", children: _jsx(ThreatFilters, { filters: filters, onChange: (next) => {
                                setFilters(next);
                                // Keep the URL in sync so a filtered view is shareable.
                                const params = new URLSearchParams();
                                if (next.severity?.length)
                                    params.set('severity', next.severity.join(','));
                                if (next.status?.length)
                                    params.set('status', next.status.join(','));
                                setSearchParams(params, { replace: true });
                            }, onReset: () => { setFilters(EMPTY_FILTERS); setSearchParams({}, { replace: true }); }, resultCount: threats.length }) }), isLoading ? (_jsx("div", { className: "space-y-1.5 p-2.5", children: Array.from({ length: 8 }).map((_, i) => _jsx(Skeleton, { className: "h-8 w-full" }, i)) })) : isError ? (_jsx(ErrorState, { title: "Unable to load threats", message: error?.message ?? 'The threat service could not be reached.', hint: error?.hint, onRetry: () => refetch() })) : view === 'table' ? (_jsx(ThreatTable, { threats: paged, page: page, pageSize: PAGE_SIZE, total: threats.length, onPageChange: setPage, sortBy: sortKey, sortDir: sortDir, onSortChange: onSort, onSelect: setSelected, selectedId: selected?.id })) : (_jsxs("div", { className: "p-2.5", children: [!paged.length ? (_jsx("p", { className: "mono px-1 py-6 text-center text-[11px] text-ink-4", children: "No threats match the current filters." })) : (_jsx("div", { className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", children: paged.map((threat) => _jsx(ThreatCard, { threat: threat }, threat.id)) })), threats.length > PAGE_SIZE ? (_jsx("div", { className: "mt-2.5 flex justify-center", children: _jsxs("button", { type: "button", onClick: () => setPage((p) => Math.min(Math.ceil(threats.length / PAGE_SIZE), p + 1)), disabled: page >= Math.ceil(threats.length / PAGE_SIZE), className: "rounded-[2px] border border-line-2 px-3 py-1 text-[11px] tracking-[0.02em] text-ink-3 transition-colors hover:border-term/40 hover:text-term disabled:opacity-40", children: ["Load more \u00B7 page ", page, " of ", Math.ceil(threats.length / PAGE_SIZE)] }) })) : null] })), _jsxs("div", { className: "flex items-center gap-2 border-t border-line bg-base px-2.5 py-1", children: [_jsx("span", { className: "mono text-[11px] tracking-[0.01em] text-ink-4 uppercase", children: isFetching ? 'SYNCING…' : 'DATA CURRENT' }), _jsx("span", { className: "flex-1" }), _jsx("span", { className: "mono text-[11px] text-ink-4", children: "SOURCE: mock-api \u00B7 /api/threats" })] })] })] }));
}
