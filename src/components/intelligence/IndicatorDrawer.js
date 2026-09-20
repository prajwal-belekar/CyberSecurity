import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Globe2, Radio, ShieldAlert } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SeverityBadge, Badge } from '@/components/ui/Badge';
import { SectionRule, KeyValueGrid } from '@/components/ui/KeyValue';
import { Meter } from '@/components/ui/Meter';
import { CopyButton } from '@/components/ui/CopyButton';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { intelligenceApi } from '@/services/intelligenceApi';
import { queryKeys } from '@/services/queryKeys';
import { formatTimestamp, formatRelative } from '@/utils/dates';
import { cn } from '@/utils/cn';
const STATUS_TONE = {
    active: 'border-critical/40 bg-critical/10 text-critical',
    suspicious: 'border-high/40 bg-high/10 text-high',
    under_review: 'border-medium/40 bg-medium/10 text-medium',
    whitelisted: 'border-term/40 bg-term/10 text-term',
    expired: 'border-line-3 bg-raised text-ink-4',
};
/** Full indicator record: provenance, confidence, WHOIS, references and tags. */
export function IndicatorDrawer({ id, onClose }) {
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: queryKeys.intelligence(id ?? 'none'),
        queryFn: () => intelligenceApi.byId(id),
        enabled: Boolean(id),
    });
    return (_jsx(Drawer, { open: Boolean(id), onClose: onClose, title: data ? `Indicator ${data.id}` : 'Indicator', subtitle: data ? _jsx("span", { className: "mono truncate text-[10.5px] text-cyber", children: data.value }) : undefined, width: "max-w-xl", footer: data ? (_jsxs("div", { className: "flex w-full flex-wrap items-center gap-1.5", children: [_jsx(CopyButton, { value: data.value, label: `Copy ${data.value}` }), _jsx("span", { className: "mono text-[11px] text-ink-4", children: "Copy value" }), _jsx("span", { className: "flex-1" }), _jsx(Link, { to: "/threat-intelligence", children: _jsx(Button, { variant: "ghost", size: "xs", icon: _jsx(Radio, { className: "size-3", "aria-hidden": true }), children: "Intel feed" }) }), _jsx(Link, { to: "/threats", children: _jsx(Button, { variant: "secondary", size: "xs", icon: _jsx(ShieldAlert, { className: "size-3", "aria-hidden": true }), children: "Hunt related threats" }) })] })) : undefined, children: isLoading ? (_jsxs("div", { className: "space-y-2.5", children: [_jsx(Skeleton, { className: "h-16 w-full" }), _jsx(Skeleton, { className: "h-40 w-full" }), _jsx(Skeleton, { className: "h-24 w-full" })] })) : isError ? (_jsx(ErrorState, { title: "Indicator unavailable", message: error.message, onRetry: () => refetch() })) : !data ? (_jsx(EmptyState, { icon: _jsx(Globe2, { className: "size-4", "aria-hidden": true }), title: "No indicator selected", description: "Choose a row in the intelligence feed to inspect its full record.", prompt: true })) : (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "rounded-[2px] border border-line-2 bg-base p-2.5", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [_jsx(SeverityBadge, { severity: data.risk }), _jsx("span", { className: cn('mono rounded-[2px] border px-1.5 py-[1px] text-[10.5px] font-bold tracking-[0.01em] uppercase', STATUS_TONE[data.status]), children: data.status.replace(/_/g, ' ') }), _jsx(Badge, { tone: "neutral", children: data.type.replace(/_/g, ' ').toUpperCase() }), _jsx("span", { className: "flex-1" }), _jsxs("span", { className: "mono text-[11px] text-ink-4", children: ["LAST SEEN ", formatRelative(data.lastSeen)] })] }), _jsxs("p", { className: "mono mt-2 flex items-start gap-1.5 text-[12px] leading-relaxed break-all text-cyber", children: [_jsx("span", { className: "min-w-0 flex-1", children: data.value }), _jsx(CopyButton, { value: data.value, label: `Copy ${data.value}` })] }), _jsx("p", { className: "mt-2 text-[11.5px] leading-relaxed text-ink-2", children: data.description })] }), _jsxs("div", { children: [_jsx(SectionRule, { className: "mb-1.5", children: _jsx("span", { children: "Confidence & coverage" }) }), _jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [_jsxs("div", { className: "rounded-[2px] border border-line bg-base p-2", children: [_jsx("div", { className: "label-xs mb-1", children: "Source confidence" }), _jsx(Meter, { value: data.confidence * 100, tone: data.confidence > 0.75 ? 'err' : data.confidence > 0.45 ? 'warn' : 'term' }), _jsxs("p", { className: "mono mt-1 text-[11px] text-ink-4", children: [(data.confidence * 100).toFixed(0), "% \u00B7 ", data.source] })] }), _jsxs("div", { className: "rounded-[2px] border border-line bg-base p-2", children: [_jsx("div", { className: "label-xs mb-1", children: "Internal correlation" }), _jsx("div", { className: "mono tnum text-[22px] leading-none font-bold text-cyber", children: data.relatedEvents }), _jsx("p", { className: "mt-1 text-[11px] text-ink-4", children: "Matching security events" })] })] })] }), _jsxs("div", { children: [_jsx(SectionRule, { className: "mb-1.5", children: _jsx("span", { children: "Record" }) }), _jsx(KeyValueGrid, { columns: 2, rows: [
                                { label: 'Indicator ID', value: data.id, copy: data.id, mono: true },
                                { label: 'Type', value: data.type.replace(/_/g, ' '), mono: true },
                                { label: 'Feed source', value: data.source },
                                { label: 'Country', value: data.country ?? '—' },
                                { label: 'Threat actor', value: data.threatActor ?? 'UNATTRIBUTED' },
                                { label: 'Campaign', value: data.campaign ?? '—' },
                                { label: 'First seen', value: formatTimestamp(data.firstSeen), mono: true },
                                { label: 'Last seen', value: formatTimestamp(data.lastSeen), mono: true },
                            ] })] }), data.whois && Object.keys(data.whois).length ? (_jsxs("div", { children: [_jsx(SectionRule, { className: "mb-1.5", children: _jsx("span", { children: "Registration data" }) }), _jsx("dl", { className: "rounded-[2px] border border-line bg-void p-2", children: Object.entries(data.whois).map(([key, value]) => (_jsxs("div", { className: "flex items-baseline justify-between gap-3 border-b border-line py-1 last:border-b-0", children: [_jsx("dt", { className: "label-xs shrink-0", children: key.toUpperCase() }), _jsx("dd", { className: "mono min-w-0 truncate text-right text-[10.5px] text-ink-2", children: value })] }, key))) })] })) : null, data.tags.length ? (_jsxs("div", { children: [_jsx(SectionRule, { className: "mb-1.5", children: _jsx("span", { children: "Tags" }) }), _jsx("ul", { className: "flex flex-wrap gap-1", children: data.tags.map((tag) => (_jsx("li", { className: "mono rounded-[2px] border border-line-2 bg-raised px-1.5 py-[1px] text-[11px] tracking-[0.01em] text-ink-3 uppercase", children: tag }, tag))) })] })) : null, data.references?.length ? (_jsxs("div", { children: [_jsx(SectionRule, { className: "mb-1.5", children: _jsx("span", { children: "References" }) }), _jsx("ul", { className: "space-y-0.5", children: data.references.map((reference) => (_jsxs("li", { className: "mono flex items-start gap-2 text-[10.5px] leading-relaxed break-all text-ink-3", children: [_jsx("span", { className: "shrink-0 text-term", children: "\u203A" }), _jsx("span", { className: "min-w-0", children: reference })] }, reference))) })] })) : null] })) }));
}
