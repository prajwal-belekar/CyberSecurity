import { Target } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Meter } from '@/components/ui/Meter';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import type { AnalyticsBundle } from '@/services/analyticsApi';

type RuleRow = AnalyticsBundle['ruleEfficacy'][number];

/** Detection rule quality: hits, true positives and precision, worst first. */
export function RuleEfficacy({ rules }: { rules: AnalyticsBundle['ruleEfficacy'] }) {
  const columns: Column<RuleRow>[] = [
    { key: 'rule', header: 'Detection Rule', sortValue: (row) => row.rule, render: (row) => {
      const [id, ...rest] = row.rule.split(' ');
      return (
        <div className="min-w-0">
          <span className="mono text-[10.5px] font-bold text-term">{id}</span>
          <span className="mono ml-1.5 truncate text-[10.5px] text-ink-3">{rest.join(' ')}</span>
        </div>
      );
    } },
    { key: 'hits', header: 'Hits', sortValue: (row) => row.hits, width: '80px', align: 'right', render: (row) => (
      <span className="mono tnum text-[11px] text-ink-2">{row.hits.toLocaleString()}</span>
    ) },
    { key: 'truePositives', header: 'True Pos.', sortValue: (row) => row.truePositives, width: '96px', align: 'right', hideBelow: 'sm', render: (row) => (
      <span className="mono tnum text-[11px] text-cyber">{row.truePositives.toLocaleString()}</span>
    ) },
    { key: 'falsePositives', header: 'False Pos.', sortValue: (row) => row.hits - row.truePositives, width: '100px', align: 'right', hideBelow: 'md', render: (row) => {
      const falsePositives = row.hits - row.truePositives;
      return <span className={cn('mono tnum text-[11px]', falsePositives ? 'text-high' : 'text-ink-4')}>{falsePositives.toLocaleString()}</span>;
    } },
    { key: 'precision', header: 'Precision', sortValue: (row) => row.precision, width: '168px', render: (row) => (
      <div className="flex items-center gap-2">
        <span className="w-16"><Meter value={row.precision * 100} tone={row.precision >= 0.9 ? 'term' : row.precision >= 0.7 ? 'warn' : 'err'} showValue={false} /></span>
        <span className={cn('mono tnum shrink-0 text-[10.5px] font-semibold', row.precision >= 0.9 ? 'text-term' : row.precision >= 0.7 ? 'text-medium' : 'text-critical')}>
          {(row.precision * 100).toFixed(0)}%
        </span>
      </div>
    ) },
    { key: 'verdict', header: 'Tuning', sortValue: (row) => row.precision, width: '118px', hideBelow: 'lg', render: (row) => (
      <Badge tone={row.precision >= 0.9 ? 'term' : row.precision >= 0.7 ? 'warn' : 'err'}>
        {row.precision >= 0.9 ? 'HEALTHY' : row.precision >= 0.7 ? 'MONITOR' : 'REVIEW'}
      </Badge>
    ) },
  ];

  return (
    <Panel title="Detection Rule Efficacy" icon={<Target className="size-3.5" aria-hidden />} noPadding className="min-w-0">
      <DataTable
        columns={columns}
        rows={[...rules].sort((a, b) => a.precision - b.precision)}
        rowKey={(row) => row.rule}
        rowAccent={(row) => (row.precision < 0.7 ? 'var(--color-critical)' : row.precision < 0.9 ? 'var(--color-medium)' : undefined)}
        caption="Detection rule precision"
      />
    </Panel>
  );
}
