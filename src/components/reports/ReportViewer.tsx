import { Link } from 'react-router-dom';
import { Download, ExternalLink, FileText, Lock } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionRule } from '@/components/ui/KeyValue';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/store/ToastContext';
import { formatDay, formatTimestamp } from '@/utils/dates';
import { cn } from '@/utils/cn';
import type { Report } from '@/types/report';

const CLASSIFICATION_TONE: Record<Report['classification'], string> = {
  INTERNAL: 'border-info/40 bg-info/10 text-info',
  CONFIDENTIAL: 'border-medium/40 bg-medium/10 text-medium',
  RESTRICTED: 'border-critical/40 bg-critical/10 text-critical',
};

/** Rendered document preview: metadata, sections, metrics and linked incidents. */
export function ReportViewer({ report, onClose }: { report: Report | null; onClose: () => void }) {
  const toast = useToast();

  const download = () => {
    if (!report) return;
    // The frontend renders a text rendition; the backend produces the real PDF/CSV.
    const body = [
      `${report.classification} — ${report.title}`,
      `${report.id} · ${report.type.replace(/_/g, ' ')} · ${report.format}`,
      `Period ${formatDay(report.periodStart)} → ${formatDay(report.periodEnd)}`,
      `Generated ${formatTimestamp(report.generatedAt)} by ${report.generatedBy}`,
      '',
      report.summary,
      '',
      ...report.sections.flatMap((section) => [
        `## ${section.heading}`,
        section.body,
        ...(section.metrics?.length ? ['', ...section.metrics.map((metric) => `  - ${metric.label}: ${metric.value}`)] : []),
        '',
      ]),
      report.relatedIncidentIds.length ? `Related incidents: ${report.relatedIncidentIds.join(', ')}` : '',
    ].join('\n');

    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${report.id}-${report.type}.${report.format === 'PDF' ? 'txt' : report.format.toLowerCase()}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success('Export started', `${report.id} downloaded as a text rendition. The backend renderer produces the final ${report.format}.`);
  };

  return (
    <Drawer
      open={Boolean(report)}
      onClose={onClose}
      title={report ? report.title : 'Report'}
      subtitle={report ? <span className="mono truncate text-[10.5px] text-cyber">{report.id} · {report.format}</span> : undefined}
      width="max-w-2xl"
      badge={report ? <span className={cn('mono rounded-[2px] border px-1.5 py-[1px] text-[10.5px] font-bold tracking-[0.01em] uppercase', CLASSIFICATION_TONE[report.classification])}>{report.classification}</span> : undefined}
      footer={
        report ? (
          <div className="flex w-full flex-wrap items-center gap-1.5">
            <span className="mono inline-flex items-center gap-1 text-[11px] text-ink-4">
              <Lock className="size-2.5" aria-hidden />HANDLE PER {report.classification} POLICY
            </span>
            <span className="flex-1" />
            <Button variant="secondary" size="xs" icon={<Download className="size-3" aria-hidden />} onClick={download}>
              Download {report.format}
            </Button>
          </div>
        ) : undefined
      }
    >
      {!report ? (
        <EmptyState icon={<FileText className="size-4" aria-hidden />} title="No report selected" description="Choose a report from the library to preview its sections." prompt />
      ) : (
        <div className="space-y-3">
          <div className="rounded-[2px] border border-line-2 bg-base p-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone="neutral">{report.type.replace(/_/g, ' ').toUpperCase()}</Badge>
              <Badge tone={report.status === 'ready' ? 'term' : 'warn'}>{report.status.toUpperCase()}</Badge>
              <span className="flex-1" />
              {report.sizeKb ? <span className="mono tnum text-[11px] text-ink-4">{report.sizeKb} KB</span> : null}
            </div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-ink-2">{report.summary}</p>
            <dl className="mono mt-2 grid gap-x-3 gap-y-1 border-t border-line pt-2 text-[11px] sm:grid-cols-2">
              {[
                ['PERIOD', `${formatDay(report.periodStart)} → ${formatDay(report.periodEnd)}`],
                ['GENERATED', formatTimestamp(report.generatedAt)],
                ['AUTHOR', report.generatedBy],
                ['FORMAT', report.format],
                ['SECTIONS', `${report.sections.length}`],
                ['CLASSIFICATION', report.classification],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-2">
                  <dt className="field-label shrink-0">{label}</dt>
                  <dd className="min-w-0 truncate text-ink-3">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <SectionRule className="mb-1.5"><span>Document sections</span></SectionRule>
            <ol className="space-y-2">
              {report.sections.map((section, index) => (
                <li key={section.heading} className="rounded-[2px] border border-line bg-void p-2.5">
                  <div className="flex items-baseline gap-2">
                    <span className="mono tnum shrink-0 text-[11px] text-term">{String(index + 1).padStart(2, '0')}</span>
                    <h3 className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink">{section.heading}</h3>
                  </div>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed whitespace-pre-wrap text-ink-2">{section.body}</p>
                  {section.metrics?.length ? (
                    <dl className="mt-2 grid gap-x-3 gap-y-1 border-t border-line pt-2 sm:grid-cols-2">
                      {section.metrics.map((metric) => (
                        <div key={metric.label} className="flex items-baseline justify-between gap-2 border-b border-line py-0.5 last:border-b-0">
                          <dt className="field-label shrink-0">{metric.label}</dt>
                          <dd className="mono tnum min-w-0 truncate text-[10.5px] text-cyber">{metric.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

          {report.relatedIncidentIds.length ? (
            <div>
              <SectionRule className="mb-1.5"><span>Related incidents</span></SectionRule>
              <ul className="flex flex-wrap gap-1.5">
                {report.relatedIncidentIds.map((incidentId) => (
                  <li key={incidentId}>
                    <Link
                      to={`/incidents/${incidentId}`}
                      className="mono inline-flex items-center gap-1 rounded-[2px] border border-line-2 bg-raised px-1.5 py-[2px] text-[11px] text-term transition-colors hover:border-term/40 hover:bg-term/10"
                    >
                      {incidentId}<ExternalLink className="size-2.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </Drawer>
  );
}
