import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Library } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { SectionRule } from '@/components/ui/KeyValue';
import { ReportGenerator } from '@/components/reports/ReportGenerator';
import { ReportList } from '@/components/reports/ReportList';
import { ReportViewer } from '@/components/reports/ReportViewer';
import { reportsApi } from '@/services/reportsApi';
import { queryKeys } from '@/services/queryKeys';
const TYPE_LABELS = {
    security_summary: 'Security summary',
    incident: 'Incident report',
    threat: 'Threat report',
    network: 'Network report',
    authentication: 'Authentication report',
};
/** Reports — generate a document, then browse and preview the library. */
export default function Reports() {
    const meta = routeMetaFor('/reports');
    const [selected, setSelected] = useState(null);
    const reports = useQuery({
        queryKey: queryKeys.reports('all'),
        queryFn: () => reportsApi.list('all'),
        staleTime: 15_000,
    });
    const library = reports.data ?? [];
    const byType = library.reduce((acc, report) => {
        acc[report.type] = (acc[report.type] ?? 0) + 1;
        return acc;
    }, {});
    const readyCount = library.filter((report) => report.status === 'ready').length;
    return (_jsxs("div", { className: "space-y-2.5 p-2.5 sm:p-3", children: [_jsx(Breadcrumbs, { items: meta.segments }), _jsx(PageHeader, { title: "Reports", description: "Generate and review point-in-time security documentation.", status: _jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]", children: [_jsx(Library, { className: "size-2.5 text-cyber", "aria-hidden": true }), _jsxs("span", { className: "mono text-[11px] font-semibold tracking-[0.02em] text-ink-2 uppercase", children: [readyCount, " READY \u00B7 ", library.length, " TOTAL"] })] }) }), _jsx(Panel, { title: "Generate Report", icon: _jsx(FileText, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", children: _jsx(ReportGenerator, { onGenerated: (report) => setSelected(report) }) }), _jsxs("div", { className: "grid min-w-0 gap-2.5 xl:grid-cols-[minmax(0,1fr)_300px]", children: [_jsx(Panel, { title: "Report Library", icon: _jsx(Library, { className: "size-3.5", "aria-hidden": true }), noPadding: true, className: "min-w-0", children: _jsx(ReportList, { reports: library, loading: reports.isLoading, error: reports.isError ? (reports.error.message ?? 'Unable to load the report library.') : null, onRetry: () => reports.refetch(), onSelect: setSelected, selectedId: selected?.id }) }), _jsx("div", { className: "flex min-w-0 flex-col gap-2.5", children: _jsxs(Panel, { title: "Library Composition", className: "min-w-0", children: [_jsx(SectionRule, { className: "mb-1.5", children: _jsx("span", { children: "By type" }) }), Object.keys(byType).length ? (_jsx("ul", { className: "space-y-1", children: Object.entries(byType).map(([type, count]) => (_jsxs("li", { className: "flex items-baseline gap-2 border-b border-line pb-1 last:border-b-0", children: [_jsx("span", { className: "mono min-w-0 flex-1 truncate text-[10.5px] text-ink-3", children: TYPE_LABELS[type] ?? type.replace(/_/g, ' ') }), _jsx("span", { className: "mono tnum shrink-0 text-[10.5px] text-cyber", children: count })] }, type))) })) : (_jsx("p", { className: "mono text-[11px] text-ink-4", children: "No reports generated yet." }))] }) })] }), _jsx(ReportViewer, { report: selected, onClose: () => setSelected(null) })] }));
}
