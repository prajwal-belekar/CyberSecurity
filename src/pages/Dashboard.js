import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SecurityOverview } from '@/components/dashboard/SecurityOverview';
import { ThreatStats } from '@/components/dashboard/ThreatStats';
import { ThreatActivityChart } from '@/components/dashboard/ThreatActivityChart';
import { SeverityDistribution } from '@/components/dashboard/SeverityDistribution';
import { RecentEvents } from '@/components/dashboard/RecentEvents';
import { ActiveIncidents } from '@/components/dashboard/ActiveIncidents';
import { NetworkOverview } from '@/components/dashboard/NetworkOverview';
import { SystemHealth } from '@/components/dashboard/SystemHealth';
import { TerminalStatusPanel } from '@/components/dashboard/TerminalStatusPanel';
import { EventStream } from '@/components/system/EventStream';
import { Panel } from '@/components/ui/Card';
import { Radio } from 'lucide-react';
import { useUI } from '@/store/UIContext';
/**
 * Security Command Center.
 *
 * Hierarchy top-to-bottom: posture → summary counters → threat activity →
 * live events → incidents → network → authentication/system health. Decorative
 * surfaces never outrank security information.
 */
export default function Dashboard() {
    const { openEvent } = useUI();
    return (_jsxs("div", { className: "space-y-2.5 p-2.5 sm:p-3", children: [_jsx(SecurityOverview, {}), _jsx(ThreatStats, {}), _jsxs("div", { className: "grid min-w-0 grid-cols-1 gap-2.5 xl:grid-cols-3", children: [_jsx("div", { className: "min-w-0 xl:col-span-2", children: _jsx(ThreatActivityChart, {}) }), _jsx("div", { className: "min-w-0", children: _jsx(SeverityDistribution, {}) })] }), _jsxs("div", { className: "grid min-w-0 grid-cols-1 gap-2.5 xl:grid-cols-3", children: [_jsx("div", { className: "min-w-0 xl:col-span-2", children: _jsx(RecentEvents, {}) }), _jsxs("div", { className: "flex min-w-0 flex-col gap-2.5", children: [_jsx(Panel, { title: "Live Threat Activity", icon: _jsx(Radio, { className: "size-3.5", "aria-hidden": true }), noPadding: true, className: "min-w-0", children: _jsx(EventStream, { limit: 26, maxHeight: 288, showHeader: false, onSelect: openEvent }) }), _jsx(ActiveIncidents, { limit: 3 })] })] }), _jsxs("div", { className: "grid min-w-0 grid-cols-1 gap-2.5 xl:grid-cols-3", children: [_jsx("div", { className: "min-w-0 xl:col-span-2", children: _jsx(NetworkOverview, {}) }), _jsxs("div", { className: "flex min-w-0 flex-col gap-2.5", children: [_jsx(SystemHealth, {}), _jsx(TerminalStatusPanel, {})] })] })] }));
}
