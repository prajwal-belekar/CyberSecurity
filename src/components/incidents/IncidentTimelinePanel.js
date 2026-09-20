import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { History } from 'lucide-react';
import { Timeline } from '@/components/ui/Timeline';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatClockShort } from '@/utils/dates';
const KIND_META = {
    detection: { tone: 'critical', glyph: 'DETECTION' },
    escalation: { tone: 'high', glyph: 'ESCALATION' },
    action: { tone: 'cyber', glyph: 'ACTION' },
    note: { tone: 'neutral', glyph: 'NOTE' },
    system: { tone: 'neutral', glyph: 'SYSTEM' },
    resolution: { tone: 'term', glyph: 'RESOLUTION' },
};
/** Forensic timeline of the incident, newest last, grouped by entry kind. */
export function IncidentTimelinePanel({ timeline }) {
    if (!timeline.length) {
        return _jsx(EmptyState, { compact: true, icon: _jsx(History, { className: "size-4", "aria-hidden": true }), title: "No timeline entries", description: "Actions and detections will appear here as the case progresses." });
    }
    const items = [...timeline]
        .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp))
        .map((entry) => {
        const meta = KIND_META[entry.kind];
        return {
            id: entry.id,
            time: entry.time || formatClockShort(entry.timestamp),
            timestamp: entry.timestamp,
            tone: meta.tone,
            title: (_jsxs("span", { className: "flex flex-wrap items-baseline gap-x-2 gap-y-0.5", children: [_jsx("span", { className: "text-[11.5px] font-medium text-ink", children: entry.title }), _jsx("span", { className: "mono text-[10.5px] font-bold tracking-[0.02em] text-ink-4 uppercase", children: meta.glyph })] })),
            detail: (_jsxs("span", { className: "mono block text-[10.5px] leading-relaxed break-words text-ink-3", children: [entry.detail, entry.actor ? _jsxs("span", { className: "ml-1.5 text-ink-4", children: ["\u2014 ", entry.actor] }) : null] })),
            actor: entry.actor,
        };
    });
    return _jsx(Timeline, { items: items, dense: true });
}
