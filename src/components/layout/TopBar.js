import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, Search, Shield, Settings as SettingsIcon, Terminal, User, X, } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useClock, useIsMobile } from '@/hooks';
import { useLive } from '@/store/LiveContext';
import { useUI } from '@/store/UIContext';
import { useHotkey } from '@/hooks/useHotkey';
import { Dropdown } from '@/components/ui/Dropdown';
import { Tooltip } from '@/components/ui/Tooltip';
import { Meter } from '@/components/ui/Meter';
import { formatNumber } from '@/utils/formatting';
function MetricReadout({ label, value, tone }) {
    return (_jsx(Tooltip, { content: `${label}: ${value}`, label: label, children: _jsxs("span", { className: "mono hidden items-baseline gap-1 text-[11px] whitespace-nowrap xl:inline-flex", children: [_jsx("span", { className: "text-ink-4", children: label }), _jsx("span", { className: cn('tnum font-semibold', tone), children: value })] }) }));
}
/**
 * Operator status bar: identity, live system state, telemetry readouts and the
 * global search / notification controls. Monospace throughout for the technical
 * fields.
 */
export function TopBar() {
    const clock = useClock();
    const isMobile = useIsMobile();
    const { metrics, connected } = useLive();
    const { toggleSidebar, setMobileNavOpen, mobileNavOpen, openPalette, setNotificationsOpen, notificationsOpen, terminalDockOpen, toggleTerminalDock } = useUI();
    useHotkey('ctrl+k', (e) => { e.preventDefault(); openPalette(); });
    useHotkey('ctrl+/', (e) => { e.preventDefault(); openPalette(); });
    useHotkey('ctrl+b', (e) => { e.preventDefault(); toggleSidebar(); });
    const cpuTone = metrics.cpu > 80 ? 'text-critical' : metrics.cpu > 60 ? 'text-medium' : 'text-term';
    const memTone = metrics.mem > 85 ? 'text-critical' : metrics.mem > 70 ? 'text-medium' : 'text-cyber';
    const netTone = metrics.netMbps > 45 ? 'text-medium' : 'text-cyber';
    return (_jsxs("header", { className: cn('relative z-40 flex h-11 shrink-0 items-center gap-2 border-b border-line bg-base px-2 sm:px-3', 'after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-line'), children: [isMobile ? (_jsx("button", { type: "button", onClick: () => setMobileNavOpen(!mobileNavOpen), "aria-label": mobileNavOpen ? 'Close navigation' : 'Open navigation', "aria-expanded": mobileNavOpen, className: "inline-flex size-7 items-center justify-center rounded-[2px] border border-line-2 text-ink-2 transition-colors hover:border-term/40 hover:text-term", children: mobileNavOpen ? _jsx(X, { className: "size-4", "aria-hidden": true }) : _jsx(Menu, { className: "size-4", "aria-hidden": true }) })) : (_jsx("button", { type: "button", onClick: toggleSidebar, "aria-label": "Toggle sidebar", className: "inline-flex size-7 items-center justify-center rounded-[2px] border border-line-2 text-ink-3 transition-colors hover:border-term/40 hover:text-term", children: _jsx(Menu, { className: "size-3.5", "aria-hidden": true }) })), _jsxs(Link, { to: "/dashboard", className: "group flex min-w-0 items-center gap-1.5 rounded-[2px] px-1 py-0.5", "aria-label": "CyberSentinel \u2014 go to dashboard", children: [_jsx("span", { className: "mono shrink-0 text-[14px] leading-none text-term", "aria-hidden": true, children: "\u25C8" }), _jsxs("span", { className: "mono truncate text-[12.5px] font-bold tracking-[0.02em] text-ink uppercase", children: ["Cyber", _jsx("span", { className: "text-term", children: "Sentinel" })] })] }), _jsxs("div", { className: "ml-1 hidden items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-2 py-0.5 sm:flex", children: [_jsx("span", { className: cn('size-1.5 rounded-full', connected ? 'bg-term text-term' : 'bg-ink-4 text-ink-4'), "aria-hidden": true }), _jsxs("span", { className: "mono text-[11px] font-semibold tracking-[0.02em] whitespace-nowrap text-ink-2 uppercase", children: ["SYSTEM ", connected ? 'ONLINE' : 'PAUSED'] })] }), _jsx("div", { className: "flex-1" }), _jsxs("div", { className: "hidden items-center gap-3 lg:flex", children: [_jsx(MetricReadout, { label: "CPU", value: `${metrics.cpu}%`, tone: cpuTone }), _jsx(MetricReadout, { label: "MEM", value: `${metrics.mem}%`, tone: memTone }), _jsx(MetricReadout, { label: "NET", value: `${metrics.netMbps} MB/s`, tone: netTone }), _jsx(MetricReadout, { label: "EVENTS", value: formatNumber(metrics.totalEvents), tone: "text-ink" }), _jsx(Tooltip, { content: `Pipeline latency ${metrics.latencyMs}ms`, label: "Latency", children: _jsx("span", { className: "hidden min-w-[54px] 2xl:block", children: _jsx(Meter, { value: Math.min(100, metrics.latencyMs * 1.6), tone: metrics.latencyMs > 45 ? 'warn' : 'term', blocks: true, width: 6, showValue: false }) }) }), _jsx("span", { className: "mono tnum text-[10.5px] font-semibold text-term tabular-nums", children: clock })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsxs("button", { type: "button", onClick: openPalette, className: "group flex h-7 items-center gap-2 rounded-[2px] border border-line-2 bg-panel px-2 text-left transition-colors hover:border-line-3 sm:w-52 lg:w-60", "aria-label": "Open command palette (Ctrl+K)", children: [_jsx(Search, { className: "size-3.5 shrink-0 text-ink-4 group-hover:text-term", "aria-hidden": true }), _jsx("span", { className: "mono hidden flex-1 truncate text-[10.5px] text-ink-4 sm:block", children: "root@cybersentinel:~$ _" }), _jsx("kbd", { className: "mono hidden shrink-0 rounded-[2px] border border-line-3 bg-raised px-1 py-px text-[10.5px] text-ink-4 sm:block", children: "Ctrl K" })] }), _jsx(Tooltip, { content: terminalDockOpen ? 'Hide terminal dock' : 'Show terminal dock', label: "Terminal dock", children: _jsx("button", { type: "button", onClick: toggleTerminalDock, "aria-label": terminalDockOpen ? 'Hide terminal dock' : 'Show terminal dock', "aria-pressed": terminalDockOpen, className: cn('hidden size-7 items-center justify-center rounded-[2px] border transition-colors md:inline-flex', terminalDockOpen
                                ? 'border-term/40 bg-term/10 text-term'
                                : 'border-line-2 text-ink-3 hover:border-line-3 hover:text-ink'), children: _jsx(Terminal, { className: "size-3.5", "aria-hidden": true }) }) }), _jsx(Dropdown, { label: "Notifications", align: "right", width: "w-56", trigger: ({ toggle, open, ref }) => (_jsxs("button", { ref: ref, type: "button", onClick: toggle, "aria-label": "Open notifications", "aria-expanded": open, "aria-haspopup": "true", className: cn('relative inline-flex size-7 items-center justify-center rounded-[2px] border transition-colors', open || notificationsOpen
                                ? 'border-term/40 bg-term/10 text-term'
                                : 'border-line-2 text-ink-3 hover:border-line-3 hover:text-ink'), children: [_jsx(Bell, { className: "size-3.5", "aria-hidden": true }), _jsx(LiveUnreadDot, { onOpen: () => setNotificationsOpen(true) })] })), items: [
                            { id: 'center', label: 'Open notification center', icon: _jsx(Bell, { className: "size-3.5", "aria-hidden": true }), onSelect: () => setNotificationsOpen(true) },
                            { id: 'threats', label: 'Jump to threats', icon: _jsx(Shield, { className: "size-3.5", "aria-hidden": true }), onSelect: () => { window.location.assign('/threats'); } },
                            { id: 'sep', label: '', separator: true },
                            { id: 'settings', label: 'Notification preferences', icon: _jsx(SettingsIcon, { className: "size-3.5", "aria-hidden": true }), onSelect: () => { window.location.assign('/settings'); } },
                        ] }), _jsx(Dropdown, { label: "Account", align: "right", width: "w-64", header: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "flex size-7 items-center justify-center rounded-[2px] border border-term/35 bg-term/10 font-mono text-[11px] font-bold text-term", children: "AR" }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-[11.5px] font-medium text-ink", children: "a.reyes" }), _jsx("p", { className: "mono truncate text-[11px] text-ink-4", children: "SOC analyst \u00B7 Tier 2" })] })] }), trigger: ({ toggle, open, ref }) => (_jsxs("button", { ref: ref, type: "button", onClick: toggle, "aria-label": "Account menu", "aria-expanded": open, "aria-haspopup": "true", className: cn('inline-flex h-7 items-center gap-1 rounded-[2px] border px-1.5 transition-colors', open ? 'border-term/40 bg-term/10 text-term' : 'border-line-2 text-ink-3 hover:border-line-3 hover:text-ink'), children: [_jsx(User, { className: "size-3.5", "aria-hidden": true }), _jsx("span", { className: "mono hidden text-[11px] tracking-[0.01em] sm:block", children: "a.reyes" }), _jsx(ChevronDown, { className: "size-3", "aria-hidden": true })] })), items: [
                            { id: 'session', label: 'Session details', hint: '4h 12m', disabled: true },
                            { id: 'settings', label: 'Workspace settings', icon: _jsx(SettingsIcon, { className: "size-3.5", "aria-hidden": true }), onSelect: () => { window.location.assign('/settings'); } },
                            { id: 'sep', label: '', separator: true },
                            {
                                id: 'signout',
                                label: 'Sign out',
                                icon: _jsx(LogOut, { className: "size-3.5", "aria-hidden": true }),
                                danger: true,
                                hint: 'SOON',
                                disabled: true,
                            },
                        ], footer: _jsx("p", { className: "mono text-[10.5px] leading-relaxed text-ink-4", children: "Authentication is handled by the backend session. No credentials are stored in this frontend." }) })] })] }));
}
function LiveUnreadDot({ onOpen }) {
    const { unreadNotifications } = useLive();
    if (!unreadNotifications)
        return null;
    return (_jsx("button", { type: "button", onClick: (e) => { e.stopPropagation(); onOpen(); }, "aria-label": `${unreadNotifications} unread notifications`, className: "absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-base bg-critical px-0.5 font-mono text-[10.5px] leading-none font-bold text-void", children: unreadNotifications > 9 ? '9+' : unreadNotifications }));
}
