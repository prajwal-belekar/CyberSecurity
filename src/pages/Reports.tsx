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
import type { Report, ReportType } from '@/types/report';

const TYPE_LABELS: Record<ReportType, string> = {
  security_summary: 'Security summary',
  incident: 'Incident report',
  threat: 'Threat report',
  network: 'Network report',
  authentication: 'Authentication report',
};

/** Reports — generate a document, then browse and preview the library. */
export default function Reports() {
  const meta = routeMetaFor('/reports');
  const [selected, setSelected] = useState<Report | null>(null);

  const reports = useQuery({
    queryKey: queryKeys.reports('all'),
    queryFn: () => reportsApi.list('all'),
    staleTime: 15_000,
  });

  const library = reports.data ?? [];
  const byType = library.reduce<Record<string, number>>((acc, report) => {
    acc[report.type] = (acc[report.type] ?? 0) + 1;
    return acc;
  }, {});
  const readyCount = library.filter((report) => report.status === 'ready').length;

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={meta.segments} />
      <PageHeader
        title="Reports"
        description="Generate and review point-in-time security documentation."
        status={
          <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]">
            <Library className="size-2.5 text-cyber" aria-hidden />
            <span className="mono text-[11px] font-semibold tracking-[0.02em] text-ink-2 uppercase">
              {readyCount} READY · {library.length} TOTAL
            </span>
          </span>
        }
      />

      <Panel title="Generate Report" icon={<FileText className="size-3.5" aria-hidden />} className="min-w-0">
        <ReportGenerator onGenerated={(report) => setSelected(report)} />
      </Panel>

      <div className="grid min-w-0 gap-2.5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel title="Report Library" icon={<Library className="size-3.5" aria-hidden />} noPadding className="min-w-0">
          <ReportList
            reports={library}
            loading={reports.isLoading}
            error={reports.isError ? ((reports.error as Error).message ?? 'Unable to load the report library.') : null}
            onRetry={() => reports.refetch()}
            onSelect={setSelected}
            selectedId={selected?.id}
          />
        </Panel>

        <div className="flex min-w-0 flex-col gap-2.5">
          <Panel title="Library Composition" className="min-w-0">
            <SectionRule className="mb-1.5"><span>By type</span></SectionRule>
            {Object.keys(byType).length ? (
              <ul className="space-y-1">
                {Object.entries(byType).map(([type, count]) => (
                  <li key={type} className="flex items-baseline gap-2 border-b border-line pb-1 last:border-b-0">
                    <span className="mono min-w-0 flex-1 truncate text-[10.5px] text-ink-3">
                      {TYPE_LABELS[type as ReportType] ?? type.replace(/_/g, ' ')}
                    </span>
                    <span className="mono tnum shrink-0 text-[10.5px] text-cyber">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mono text-[11px] text-ink-4">No reports generated yet.</p>
            )}
          </Panel>

        </div>
      </div>

      <ReportViewer report={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
