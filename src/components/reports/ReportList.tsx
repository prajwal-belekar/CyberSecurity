import { FileText } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { formatDay, formatRelative } from '@/utils/dates';
import { cn } from '@/utils/cn';
import type { Report, ReportStatus } from '@/types/report';

const STATUS_TONE: Record<ReportStatus, string> = {
  ready: 'border-term/40 bg-term/10 text-term',
  generating: 'border-cyber/40 bg-cyber/10 text-cyber',
  queued: 'border-medium/40 bg-medium/10 text-medium',
  draft: 'border-line-3 bg-raised text-ink-3',
  failed: 'border-critical/40 bg-critical/10 text-critical',
};

const CLASSIFICATION_TONE: Record<Report['classification'], 'warn' | 'err' | 'neutral'> = {
  INTERNAL: 'neutral',
  CONFIDENTIAL: 'warn',
  RESTRICTED: 'err',
};

/** Report library: title, type, period, classification, status and age. */
export function ReportList({
  reports, loading, error, onRetry, onSelect, selectedId,
}: {
  reports: Report[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSelect?: (report: Report) => void;
  selectedId?: string | null;
}) {
  const columns: Column<Report>[] = [
    { key: 'id', header: 'Report', sortValue: (row) => row.id, width: '92px', render: (row) => (
      <span className="mono text-[11px] font-bold text-term">{row.id}</span>
    ) },
    { key: 'title', header: 'Title', sortValue: (row) => row.title, render: (row) => (
      <div className="min-w-0">
        <div className="truncate text-[11.5px] font-medium text-ink">{row.title}</div>
        <div className="mono truncate text-[10.5px] text-ink-4">{row.summary}</div>
      </div>
    ) },
    { key: 'type', header: 'Type', sortValue: (row) => row.type, width: '132px', hideBelow: 'md', render: (row) => (
      <span className="mono text-[11px] tracking-[0.01em] text-ink-3 uppercase">{row.type.replace(/_/g, ' ')}</span>
    ) },
    { key: 'period', header: 'Period', sortValue: (row) => +new Date(row.periodStart), width: '168px', hideBelow: 'lg', render: (row) => (
      <span className="mono tnum text-[11px] text-ink-3">{formatDay(row.periodStart)} → {formatDay(row.periodEnd)}</span>
    ) },
    { key: 'classification', header: 'Class.', sortValue: (row) => row.classification, width: '118px', hideBelow: 'sm', render: (row) => (
      <Badge tone={CLASSIFICATION_TONE[row.classification]}>{row.classification}</Badge>
    ) },
    { key: 'format', header: 'Format', sortValue: (row) => row.format, width: '72px', render: (row) => (
      <span className="mono text-[11px] font-bold tracking-[0.01em] text-cyber uppercase">{row.format}</span>
    ) },
    { key: 'status', header: 'Status', sortValue: (row) => row.status, width: '108px', render: (row) => (
      <span className={cn('mono inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-[1px] text-[10.5px] font-bold tracking-[0.01em] uppercase', STATUS_TONE[row.status])}>
        {row.status === 'generating' ? <span className="size-1.5 animate-pulse rounded-full bg-current" aria-hidden /> : null}
        {row.status}
      </span>
    ) },
    { key: 'generatedAt', header: 'Generated', sortValue: (row) => +new Date(row.generatedAt), width: '110px', render: (row) => (
      <div className="min-w-0">
        <div className="mono tnum text-[11px] text-ink-3">{formatDay(row.generatedAt)}</div>
        <div className="mono text-[10.5px] text-ink-4">{formatRelative(row.generatedAt)}</div>
      </div>
    ) },
    { key: 'generatedBy', header: 'By', sortValue: (row) => row.generatedBy, width: '96px', hideBelow: 'xl', render: (row) => (
      <span className="mono truncate text-[11px] text-ink-3">{row.generatedBy}</span>
    ) },
  ];

  return (
    <DataTable
      columns={columns}
      rows={reports}
      rowKey={(row) => row.id}
      loading={loading}
      error={error}
      onRetry={onRetry}
      onRowClick={onSelect}
      selectedKey={selectedId ?? undefined}
      rowAccent={(row) => (row.classification === 'RESTRICTED' ? 'var(--color-critical)' : row.classification === 'CONFIDENTIAL' ? 'var(--color-medium)' : undefined)}
      emptyTitle="No reports yet"
      emptyDescription="Generate a report above — the document and its sections will appear here."
      emptyIcon={<FileText className="size-4" aria-hidden />}
      caption="Generated reports"
    />
  );
}
