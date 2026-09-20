import { History } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { SeverityBadge } from '@/components/ui/Badge';
import { VERDICT_META } from './RiskScore';
import { useQuery } from '@tanstack/react-query';
import { phishingApi } from '@/services/phishingApi';
import { queryKeys } from '@/services/queryKeys';
import { formatRelative } from '@/utils/dates';
import { cn } from '@/utils/cn';
import type { PhishingScanRecord } from '@/types/phishing';

/** Previous URL analyses — URL, date, risk and verdict. */
export function ScanHistory({ onSelect }: { onSelect?: (record: PhishingScanRecord) => void }) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.phishingHistory(),
    queryFn: () => phishingApi.history(),
  });

  const columns: Column<PhishingScanRecord>[] = [
    { key: 'url', header: 'URL', sortValue: (row) => row.domain, render: (row) => (
      <div className="min-w-0">
        <div className="mono truncate text-[11px] text-cyber">{row.domain}</div>
        <div className="mono truncate text-[10.5px] text-ink-4">{row.url}</div>
      </div>
    ) },
    { key: 'scannedAt', header: 'Date', sortValue: (row) => +new Date(row.scannedAt), width: '92px', render: (row) => (
      <span className="mono tnum text-[10.5px] whitespace-nowrap text-ink-4">{formatRelative(row.scannedAt)}</span>
    ) },
    { key: 'riskScore', header: 'Risk', sortValue: (row) => row.riskScore, width: '96px', align: 'right', render: (row) => (
      <span className="flex items-center justify-end gap-1.5">
        <span className="hidden h-1 w-10 overflow-hidden rounded-[1px] bg-raised sm:block">
          <span className="block h-full" style={{ width: `${row.riskScore}%`, background: VERDICT_META[row.verdict].color }} aria-hidden />
        </span>
        <span className="mono tnum text-[11px] font-semibold" style={{ color: VERDICT_META[row.verdict].color }}>{row.riskScore}</span>
      </span>
    ) },
    { key: 'verdict', header: 'Result', sortValue: (row) => row.verdict, width: '150px', render: (row) => (
      <span className="flex items-center gap-1.5">
        <SeverityBadge severity={row.severity} showGlyph={false} />
        <span className={cn('mono hidden truncate text-[11px] font-semibold tracking-[0.01em] uppercase lg:inline', VERDICT_META[row.verdict].tone)}>
          {VERDICT_META[row.verdict].label}
        </span>
      </span>
    ) },
    { key: 'scannedBy', header: 'Analyst', sortValue: (row) => row.scannedBy, width: '104px', hideBelow: 'xl', render: (row) => (
      <span className="mono truncate text-[10.5px] text-ink-3">{row.scannedBy}</span>
    ) },
  ];

  return (
    <Panel title="Scan History" icon={<History className="size-3.5" aria-hidden />} noPadding className="min-w-0">
      <DataTable
        columns={columns}
        rows={data ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        error={isError ? ((error as Error)?.message ?? 'Unable to load scan history.') : null}
        onRetry={() => refetch()}
        onRowClick={onSelect}
        rowAccent={(row) => row.riskScore >= 80 ? 'var(--color-critical)' : row.riskScore >= 60 ? 'var(--color-high)' : row.riskScore >= 35 ? 'var(--color-medium)' : undefined}
        emptyTitle="No previous scans"
        emptyDescription="Analyzed URLs will be listed here so you can compare against earlier verdicts."
        emptyIcon={<History className="size-4" aria-hidden />}
        caption="Phishing scan history"
      />
    </Panel>
  );
}
