import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { GitBranch, ShieldAlert } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { Timeline } from '@/components/ui/Timeline';
import { SeverityBadge, Badge } from '@/components/ui/Badge';
import { SkeletonText } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CopyButton } from '@/components/ui/CopyButton';
import { authenticationApi } from '@/services/authenticationApi';
import { queryKeys } from '@/services/queryKeys';
import { formatClockShort, formatRelative } from '@/utils/dates';
import { cn } from '@/utils/cn';
const OUTCOME_META = {
    compromised: { label: 'COMPROMISED', tone: 'critical' },
    blocked: { label: 'BLOCKED', tone: 'critical' },
    abandoned: { label: 'ABANDONED', tone: 'high' },
    recovered: { label: 'RECOVERED', tone: 'term' },
};
/**
 * Suspicious authentication sequences rendered as forensic timelines — the
 * escalating-failure view an analyst needs when triaging credential attacks.
 */
export function LoginTimeline({ limit = 2 }) {
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: queryKeys.authSequences(),
        queryFn: () => authenticationApi.sequences(),
    });
    const sequences = (data ?? []).slice(0, limit);
    return (_jsx(Panel, { title: "Suspicious Authentication Sequences", icon: _jsx(GitBranch, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", noPadding: true, children: isLoading ? (_jsx("div", { className: "p-3", children: _jsx(SkeletonText, { lines: 6 }) })) : isError ? (_jsx(ErrorState, { compact: true, title: "Unable to load sequences", message: error.message, onRetry: () => refetch() })) : !sequences.length ? (_jsx(EmptyState, { compact: true, icon: _jsx(ShieldAlert, { className: "size-4", "aria-hidden": true }), title: "No suspicious sequences", description: "No multi-attempt authentication patterns are currently flagged." })) : (_jsx("div", { className: "divide-y divide-line", children: sequences.map((sequence) => {
                const outcome = OUTCOME_META[sequence.outcome];
                return (_jsxs("article", { className: "min-w-0 p-2.5", children: [_jsxs("header", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "mono text-[11px] font-bold tracking-[0.01em] text-term", children: sequence.id }), _jsx(SeverityBadge, { severity: sequence.risk }), _jsx(Badge, { tone: outcome.tone === 'critical' ? 'err' : outcome.tone === 'high' ? 'warn' : 'term', children: outcome.label }), _jsx("span", { className: "mono text-[10.5px] text-ink-2", children: sequence.user }), _jsxs("span", { className: "mono flex items-center gap-1 text-[10.5px] text-cyber", children: [sequence.ip, _jsx(CopyButton, { value: sequence.ip, label: `Copy ${sequence.ip}` })] }), _jsx("span", { className: "flex-1" }), _jsxs("span", { className: "mono tnum text-[11px] text-ink-4", children: [sequence.attempts, " ATTEMPTS"] }), _jsx("span", { className: "mono text-[11px] text-ink-4", children: formatRelative(sequence.startedAt) })] }), _jsxs("p", { className: "mono mt-1.5 rounded-[2px] border border-line bg-base px-2 py-1 text-[10.5px] leading-relaxed text-ink-3", children: ["PATTERN :: ", sequence.pattern] }), _jsx("div", { className: "mt-2", children: _jsx(Timeline, { dense: true, items: sequence.events.slice(0, 6).map((event) => ({
                                    id: event.id,
                                    time: formatClockShort(event.timestamp),
                                    title: `${event.status.replace('_', ' ').toUpperCase()} · ${event.user}`,
                                    detail: `${event.method.toUpperCase()} from ${event.ip} · ${event.device}${event.failureReason ? ` · ${event.failureReason}` : ''}`,
                                    tone: event.risk === 'critical' ? 'critical' : event.risk === 'high' ? 'high' : event.risk === 'medium' ? 'medium' : 'neutral',
                                })) }) }), _jsxs("div", { className: "mono mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-4", children: [_jsxs("span", { children: ["WINDOW ", formatClockShort(sequence.startedAt), " \u2192 ", formatClockShort(sequence.endedAt)] }), _jsxs("span", { className: cn('font-semibold uppercase', outcome.tone === 'term' ? 'text-term' : outcome.tone === 'high' ? 'text-high' : 'text-critical'), children: ["OUTCOME ", outcome.label] })] })] }, sequence.id));
            }) })) }));
}
