import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Target } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Meter } from '@/components/ui/Meter';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
/** Detection rule quality: hits, true positives and precision, worst first. */
export function RuleEfficacy({ rules }) {
    const columns = [
        { key: 'rule', header: 'Detection Rule', sortValue: (row) => row.rule, render: (row) => {
                const [id, ...rest] = row.rule.split(' ');
                return (_jsxs("div", { className: "min-w-0", children: [_jsx("span", { className: "mono text-[10.5px] font-bold text-term", children: id }), _jsx("span", { className: "mono ml-1.5 truncate text-[10.5px] text-ink-3", children: rest.join(' ') })] }));
            } },
        { key: 'hits', header: 'Hits', sortValue: (row) => row.hits, width: '80px', align: 'right', render: (row) => (_jsx("span", { className: "mono tnum text-[11px] text-ink-2", children: row.hits.toLocaleString() })) },
        { key: 'truePositives', header: 'True Pos.', sortValue: (row) => row.truePositives, width: '96px', align: 'right', hideBelow: 'sm', render: (row) => (_jsx("span", { className: "mono tnum text-[11px] text-cyber", children: row.truePositives.toLocaleString() })) },
        { key: 'falsePositives', header: 'False Pos.', sortValue: (row) => row.hits - row.truePositives, width: '100px', align: 'right', hideBelow: 'md', render: (row) => {
                const falsePositives = row.hits - row.truePositives;
                return _jsx("span", { className: cn('mono tnum text-[11px]', falsePositives ? 'text-high' : 'text-ink-4'), children: falsePositives.toLocaleString() });
            } },
        { key: 'precision', header: 'Precision', sortValue: (row) => row.precision, width: '168px', render: (row) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-16", children: _jsx(Meter, { value: row.precision * 100, tone: row.precision >= 0.9 ? 'term' : row.precision >= 0.7 ? 'warn' : 'err', showValue: false }) }), _jsxs("span", { className: cn('mono tnum shrink-0 text-[10.5px] font-semibold', row.precision >= 0.9 ? 'text-term' : row.precision >= 0.7 ? 'text-medium' : 'text-critical'), children: [(row.precision * 100).toFixed(0), "%"] })] })) },
        { key: 'verdict', header: 'Tuning', sortValue: (row) => row.precision, width: '118px', hideBelow: 'lg', render: (row) => (_jsx(Badge, { tone: row.precision >= 0.9 ? 'term' : row.precision >= 0.7 ? 'warn' : 'err', children: row.precision >= 0.9 ? 'HEALTHY' : row.precision >= 0.7 ? 'MONITOR' : 'REVIEW' })) },
    ];
    return (_jsx(Panel, { title: "Detection Rule Efficacy", icon: _jsx(Target, { className: "size-3.5", "aria-hidden": true }), noPadding: true, className: "min-w-0", children: _jsx(DataTable, { columns: columns, rows: [...rules].sort((a, b) => a.precision - b.precision), rowKey: (row) => row.rule, rowAccent: (row) => (row.precision < 0.7 ? 'var(--color-critical)' : row.precision < 0.9 ? 'var(--color-medium)' : undefined), caption: "Detection rule precision" }) }));
}
