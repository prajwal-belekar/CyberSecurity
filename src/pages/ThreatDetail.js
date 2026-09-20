import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Layers, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Panel } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ThreatDetails } from '@/components/threats/ThreatDetails';
import { ThreatTimeline } from '@/components/threats/ThreatTimeline';
import { threatsApi } from '@/services/threatsApi';
import { eventsApi } from '@/services/eventsApi';
import { queryKeys } from '@/services/queryKeys';
import { useUI } from '@/store/UIContext';
import { formatRelative } from '@/utils/dates';
/** Threat investigation console — forensic view of one detection. */
export default function ThreatDetail() {
    const { threatId } = useParams();
    const navigate = useNavigate();
    const { openEvent } = useUI();
    const { data: threat, isLoading, isError, error, refetch } = useQuery({
        queryKey: queryKeys.threatDetail(threatId ?? 'none'),
        queryFn: () => threatsApi.byId(threatId),
        enabled: Boolean(threatId),
    });
    const relatedQuery = useQuery({
        queryKey: [...queryKeys.eventRelated(threatId ?? 'none'), 'threat'],
        queryFn: () => eventsApi.list({ search: threat?.source, pageSize: 30 }),
        enabled: Boolean(threat),
    });
    if (isLoading) {
        return (_jsxs("div", { className: "space-y-2.5 p-2.5 sm:p-3", children: [_jsx(Skeleton, { className: "h-4 w-64" }), _jsx(Skeleton, { className: "h-28 w-full" }), _jsxs("div", { className: "grid gap-2.5 lg:grid-cols-3", children: [_jsx(Skeleton, { className: "h-48 lg:col-span-2" }), _jsx(Skeleton, { className: "h-48" })] })] }));
    }
    if (isError) {
        return (_jsx("div", { className: "p-3", children: _jsx(ErrorState, { title: "Unable to load threat", message: error.message, onRetry: () => refetch() }) }));
    }
    if (!threat) {
        return (_jsx("div", { className: "p-3", children: _jsx(Panel, { children: _jsx(EmptyState, { icon: _jsx(ShieldAlert, { className: "size-4", "aria-hidden": true }), title: `Threat ${threatId ?? ''} not found`, description: "This detection is no longer in the active store. It may have been resolved or purged.", action: _jsx(Button, { variant: "primary", size: "sm", onClick: () => navigate('/threats'), children: "Back to threat monitor" }) }) }) }));
    }
    const relatedEvents = (relatedQuery.data?.items ?? []).filter((e) => e.threatId === threat.id || threat.relatedEventIds.includes(e.id) || e.source === threat.source).slice(0, 14);
    const eventColumns = [
        { key: 'time', header: 'Time', sortValue: (row) => +new Date(row.timestamp), width: '92px', render: (row) => _jsx("span", { className: "mono tnum text-[10.5px] text-ink-4", children: formatRelative(row.timestamp) }) },
        { key: 'id', header: 'Event ID', sortValue: (row) => row.id, width: '96px', render: (row) => _jsx("span", { className: "mono text-[10.5px] text-term", children: row.id }) },
        { key: 'sev', header: 'Severity', sortValue: (row) => row.severity, width: '100px', render: (row) => _jsx(SeverityBadge, { severity: row.severity }) },
        { key: 'type', header: 'Event', sortValue: (row) => row.type, render: (row) => _jsx("span", { className: "truncate text-[11.5px] text-ink-2", children: row.type }) },
        { key: 'src', header: 'Source', sortValue: (row) => row.source, hideBelow: 'md', render: (row) => _jsx("span", { className: "mono text-[10.5px] text-cyber", children: row.source }) },
        { key: 'status', header: 'Status', sortValue: (row) => row.status, width: '126px', render: (row) => _jsx(StatusBadge, { status: row.status }) },
    ];
    return (_jsxs("div", { className: "space-y-2.5 p-2.5 sm:p-3", children: [_jsx(Breadcrumbs, { items: [
                    { label: 'CYBERSENTINEL', to: '/dashboard' },
                    { label: 'Monitoring' },
                    { label: 'Threat Monitor', to: '/threats' },
                    { label: threat.id },
                ] }), _jsx(PageHeader, { compact: true, title: `Threat / ${threat.id}`, description: "Forensic investigation console for a single detection.", actions: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "secondary", size: "sm", icon: _jsx(ArrowLeft, { className: "size-3.5", "aria-hidden": true }), onClick: () => navigate('/threats'), children: "All threats" }), _jsx(Link, { to: "/incidents", className: "contents", children: _jsx(Button, { variant: "ghost", size: "sm", children: "Incident console" }) })] }) }), _jsx(ThreatDetails, { threat: threat }), _jsxs("div", { className: "grid min-w-0 gap-2.5 lg:grid-cols-3", children: [_jsx(Panel, { title: "Correlated Events", icon: _jsx(Layers, { className: "size-3.5", "aria-hidden": true }), noPadding: true, className: "min-w-0 lg:col-span-2", children: _jsx(DataTable, { columns: eventColumns, rows: relatedEvents, rowKey: (row) => row.id, loading: relatedQuery.isLoading, error: relatedQuery.isError ? relatedQuery.error.message : null, onRetry: () => relatedQuery.refetch(), onRowClick: openEvent, emptyTitle: "No correlated events", emptyDescription: "No individual events are linked to this detection.", emptyIcon: _jsx(Layers, { className: "size-4", "aria-hidden": true }), caption: `Events correlated with ${threat.id}` }) }), _jsx(Panel, { title: "Chronology", className: "min-w-0", children: _jsx(ThreatTimeline, { threat: threat }) })] })] }));
}
