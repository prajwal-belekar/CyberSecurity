import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlarmClock, CheckCircle2, CircleAlert, FileSearch, ShieldCheck, Timer } from 'lucide-react';
import { StatTile } from '@/components/ui/StatTile';
import { Meter } from '@/components/ui/Meter';
import { useIncidentSummary } from '@/hooks/useIncidents';
import { cn } from '@/utils/cn';
const COLUMNS = [
    { key: 'open', label: 'Open', icon: _jsx(CircleAlert, { className: "size-4", "aria-hidden": true }), tone: 'critical' },
    { key: 'investigating', label: 'Investigating', icon: _jsx(FileSearch, { className: "size-4", "aria-hidden": true }), tone: 'high' },
    { key: 'contained', label: 'Contained', icon: _jsx(ShieldCheck, { className: "size-4", "aria-hidden": true }), tone: 'medium' },
    { key: 'resolved', label: 'Resolved', icon: _jsx(CheckCircle2, { className: "size-4", "aria-hidden": true }), tone: 'term' },
    { key: 'false_positive', label: 'False Positive', icon: _jsx(AlarmClock, { className: "size-4", "aria-hidden": true }), tone: 'cyber' },
];
/** Status counters plus MTTR and SLA breach metrics for the incident queue. */
export function IncidentStats({ active, onSelect }) {
    const { data, isLoading } = useIncidentSummary();
    return (_jsxs("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6", children: [COLUMNS.map((column) => {
                const selected = active === column.key;
                return (_jsx(StatTile, { loading: isLoading, label: column.label, value: data?.[column.key] ?? 0, icon: column.icon, tone: column.tone, onClick: onSelect ? () => onSelect(selected ? 'all' : column.key) : undefined, className: cn(onSelect && 'cursor-pointer', selected && 'ring-1 ring-term/60'), "aria-pressed": onSelect ? selected : undefined }, column.key));
            }), _jsx(StatTile, { loading: isLoading, label: "Mean Time To Resolve", value: data ? `${data.mttrHours.toFixed(1)}h` : '—', icon: _jsx(Timer, { className: "size-4", "aria-hidden": true }), tone: data && data.mttrHours > 12 ? 'high' : 'term', description: data ? `${data.slaBreaches} SLA breach${data.slaBreaches === 1 ? '' : 'es'} this period` : undefined, footer: _jsx(Meter, { value: data ? Math.min(100, (data.mttrHours / 24) * 100) : 0, tone: data && data.mttrHours > 12 ? 'warn' : 'term', label: "OF 24H TARGET" }) })] }));
}
