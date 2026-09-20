import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ListTree } from 'lucide-react';
import { Timeline } from '@/components/ui/Timeline';
import { SkeletonText } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SectionRule } from '@/components/ui/KeyValue';
import { eventsApi } from '@/services/eventsApi';
import { queryKeys } from '@/services/queryKeys';
import { formatClockShort } from '@/utils/dates';
/** Chronological reconstruction of a threat from its correlated events. */
export function ThreatTimeline({ threat }) {
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: [...queryKeys.eventRelated(threat.id), threat.source],
        queryFn: () => eventsApi.list({ search: threat.source, pageSize: 40 }),
    });
    const items = useMemo(() => {
        const related = (data?.items ?? []).filter((e) => e.threatId === threat.id || e.source === threat.source || threat.relatedEventIds.includes(e.id));
        return [...related]
            .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp))
            .map((e) => ({
            id: e.id,
            time: formatClockShort(e.timestamp),
            title: e.type,
            detail: `${e.id} · ${e.source}${e.target ? ` → ${e.target}` : ''}${e.detectionRule ? ` · ${e.detectionRule}` : ''}`,
            actor: e.channel,
            tone: (e.severity === 'critical' ? 'critical'
                : e.severity === 'high' ? 'high'
                    : e.severity === 'medium' ? 'medium'
                        : e.severity === 'low' ? 'term' : 'neutral'),
        }));
    }, [data, threat]);
    return (_jsxs("div", { children: [_jsx(SectionRule, { className: "mb-2", right: _jsxs("span", { className: "mono", children: [items.length, " entries"] }), children: _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(ListTree, { className: "size-3", "aria-hidden": true }), " TIMELINE"] }) }), isLoading ? (_jsx(SkeletonText, { lines: 5 })) : isError ? (_jsx(ErrorState, { compact: true, title: "Unable to load timeline", message: error.message, onRetry: () => refetch() })) : !items.length ? (_jsx(EmptyState, { compact: true, icon: _jsx(ListTree, { className: "size-4", "aria-hidden": true }), title: "No correlated events", description: "No individual events are linked to this threat yet." })) : (_jsx(Timeline, { items: items, dense: true }))] }));
}
