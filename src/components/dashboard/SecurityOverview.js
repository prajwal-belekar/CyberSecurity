import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Activity, Cpu, Gauge, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Meter } from '@/components/ui/Meter';
import { Tooltip } from '@/components/ui/Tooltip';
import { useLive } from '@/store/LiveContext';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { formatDuration } from '@/utils/dates';
/**
 * Dashboard masthead: page identity, system status and the live posture strip.
 * Kept deliberately flat — no hero, no gradient wash, no decorative chrome.
 */
export function SecurityOverview() {
    const { connected, metrics, scenarioProgress } = useLive();
    const { data: health, isLoading } = useSystemHealth();
    const overall = health?.overall ?? 'operational';
    const degraded = health?.subsystems.filter((s) => s.state !== 'online' && s.state !== 'ready').length ?? 0;
    const threatLevel = Math.min(100, Math.round(((metrics.totalEvents % 100) + degraded * 12) / 1.4));
    return (_jsxs("section", { className: "panel overflow-hidden", "aria-labelledby": "command-center-title", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3 border-b border-line bg-panel-2 px-3 py-2.5", children: [_jsx("div", { className: "min-w-0", children: _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("h1", { id: "command-center-title", className: "text-[15px] font-semibold tracking-[-0.01em] text-ink sm:text-[17px]", children: "Security Command Center" }), _jsxs("span", { className: cn('inline-flex items-center gap-1.5 rounded-[2px] border px-1.5 py-[1px] font-mono text-[11px] font-bold tracking-[0.02em] uppercase', connected
                                        ? overall === 'operational' ? 'border-term/40 bg-term/10 text-term' : 'border-medium/40 bg-medium/10 text-medium'
                                        : 'border-line-3 bg-raised text-ink-3'), children: [_jsx("span", { className: cn('size-1.5 rounded-full', 'bg-current'), "aria-hidden": true }), "SYSTEM ", connected ? (overall === 'operational' ? 'OPERATIONAL' : 'DEGRADED') : 'PAUSED'] })] }) }), _jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-2", children: [_jsx(Tooltip, { content: "Scenario replay progress \u2014 the simulated detection chain currently running", children: _jsx("div", { className: "min-w-[104px]", children: _jsx(Meter, { label: "SCENARIO", value: scenarioProgress, tone: "cyber", blocks: true, width: 8 }) }) }), _jsx(Tooltip, { content: `Uptime ${formatDuration(metrics.uptimeSeconds)}`, children: _jsx("div", { className: "min-w-[92px]", children: _jsx(Meter, { label: "UPTIME", value: Math.min(100, (metrics.uptimeSeconds % 86_400) / 864), tone: "term", blocks: true, width: 8, suffix: "" }) }) })] })] }), _jsxs("div", { className: "grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x", children: [_jsx(PostureCell, { icon: _jsx(Cpu, { className: "size-3.5", "aria-hidden": true }), label: "ENGINE LOAD", value: `${metrics.cpu}%`, tone: metrics.cpu > 80 ? 'text-critical' : metrics.cpu > 60 ? 'text-medium' : 'text-term', meter: { value: metrics.cpu, tone: metrics.cpu > 80 ? 'err' : metrics.cpu > 60 ? 'warn' : 'term' } }), _jsx(PostureCell, { icon: _jsx(Activity, { className: "size-3.5", "aria-hidden": true }), label: "INGEST RATE", value: `${metrics.eventsPerSecond}/s`, tone: "text-cyber", meter: { value: Math.min(100, metrics.eventsPerSecond * 4), tone: 'cyber' } }), _jsx(PostureCell, { icon: _jsx(Gauge, { className: "size-3.5", "aria-hidden": true }), label: "THREAT LEVEL", value: `${threatLevel}%`, tone: threatLevel > 66 ? 'text-critical' : threatLevel > 33 ? 'text-medium' : 'text-term', meter: { value: threatLevel, tone: threatLevel > 66 ? 'err' : threatLevel > 33 ? 'warn' : 'term' } }), _jsx(PostureCell, { icon: _jsx(ShieldCheck, { className: "size-3.5", "aria-hidden": true }), label: "SUBSYSTEMS", value: isLoading ? '—' : `${(health?.subsystems.length ?? 0) - degraded}/${health?.subsystems.length ?? 0}`, tone: degraded ? 'text-medium' : 'text-term', meter: { value: health ? ((health.subsystems.length - degraded) / health.subsystems.length) * 100 : 100, tone: degraded ? 'warn' : 'term' } })] })] }));
}
function PostureCell({ icon, label, value, tone, meter, }) {
    return (_jsxs("div", { className: "min-w-0 border-b border-line px-3 py-2 last:border-b-0 sm:border-b-0", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-ink-4", "aria-hidden": true, children: icon }), _jsx("span", { className: "label-xs truncate", children: label })] }), _jsx("div", { className: cn('mono tnum mt-1 text-[15px] leading-none font-semibold', tone), children: value }), _jsx("div", { className: "mt-1.5", children: _jsx(Meter, { value: meter.value, tone: meter.tone, showValue: false, className: "h-1" }) })] }));
}
