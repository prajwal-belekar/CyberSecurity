import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useIncidents } from '@/hooks/useIncidents';
import { LayoutGrid, List, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { IncidentStats } from '@/components/incidents/IncidentStats';
import { IncidentBoard } from '@/components/incidents/IncidentBoard';
import { IncidentTable } from '@/components/incidents/IncidentTable';
import { IncidentFilters, EMPTY_INCIDENT_FILTERS } from '@/components/incidents/IncidentFilters';
import { priorityMeta } from '@/utils/incidentMeta';
import { severityRank } from '@/utils/severity';
import { formatRelative } from '@/utils/dates';
/** Incident Response — status board or full queue, both filterable. */
export default function Incidents() {
    const meta = routeMetaFor('/incidents');
    const [view, setView] = useState('board');
    const [filters, setFilters] = useState(EMPTY_INCIDENT_FILTERS);
    const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useIncidents('all');
    const incidents = useMemo(() => {
        const search = filters.search?.trim().toLowerCase();
        return (data ?? [])
            .filter((incident) => (filters.status === 'all' ? true : incident.status === filters.status))
            .filter((incident) => (filters.priority === 'all' ? true : incident.priority === filters.priority))
            .filter((incident) => (filters.assignee === 'all' ? true : incident.assignedTo === filters.assignee))
            .filter((incident) => {
            if (!search)
                return true;
            return [incident.id, incident.title, incident.summary, incident.source, incident.target, incident.assignedTo ?? '', ...incident.tags]
                .join(' ')
                .toLowerCase()
                .includes(search);
        })
            .sort((a, b) => priorityMeta(a.priority).rank - priorityMeta(b.priority).rank ||
            severityRank(b.severity) - severityRank(a.severity) ||
            +new Date(b.updatedAt) - +new Date(a.updatedAt));
    }, [data, filters]);
    const activeP1 = (data ?? []).filter((incident) => incident.priority === 'p1' && incident.status !== 'resolved' && incident.status !== 'false_positive');
    return (_jsxs("div", { className: "space-y-2.5 p-2.5 sm:p-3", children: [_jsx(Breadcrumbs, { items: meta.segments }), _jsx(PageHeader, { title: "Incident Response", description: "Open cases by priority, ownership and SLA position.", status: _jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]", children: [_jsx(ShieldAlert, { className: "size-2.5 text-critical", "aria-hidden": true }), _jsxs("span", { className: "mono text-[11px] font-semibold tracking-[0.02em] text-ink-2 uppercase", children: [activeP1.length, " P1 ACTIVE"] })] }), actions: _jsx(Tabs, { ariaLabel: "Incident view", value: view, onChange: (value) => setView(value), items: [
                        { value: 'board', label: 'BOARD', icon: _jsx(LayoutGrid, { className: "size-3", "aria-hidden": true }) },
                        { value: 'table', label: 'TABLE', icon: _jsx(List, { className: "size-3", "aria-hidden": true }) },
                    ] }) }), _jsx(IncidentStats, { active: filters.status, onSelect: (status) => setFilters((current) => ({ ...current, status: status })) }), _jsxs(Panel, { title: view === 'board' ? 'Response Board' : 'Incident Queue', icon: view === 'board' ? _jsx(LayoutGrid, { className: "size-3.5", "aria-hidden": true }) : _jsx(List, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", noPadding: true, actions: _jsx("span", { className: "mono text-[11px] tracking-[0.01em] text-ink-4 uppercase", children: isFetching ? 'SYNC…' : `UPDATED ${formatRelative(dataUpdatedAt)}` }), children: [_jsx("div", { className: "border-b border-line bg-base px-2.5 py-2", children: _jsx(IncidentFilters, { filters: filters, onChange: setFilters, onReset: () => setFilters(EMPTY_INCIDENT_FILTERS), resultCount: incidents.length }) }), isError ? (_jsx("div", { className: "p-2.5", children: _jsx(IncidentTable, { incidents: [], loading: false, error: error.message, onRetry: () => refetch() }) })) : view === 'board' ? (_jsx("div", { className: "p-2.5", children: _jsx(IncidentBoard, { incidents: incidents, loading: isLoading }) })) : (_jsx(IncidentTable, { incidents: incidents, loading: isLoading, error: isError ? error.message : null, onRetry: () => refetch() }))] })] }));
}
