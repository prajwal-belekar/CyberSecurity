import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { ALL_NAV_ITEMS, NAVIGATION } from '@/app/router/navigation';
import { useUI } from '@/store/UIContext';
import { useLive } from '@/store/LiveContext';
import { Tooltip } from '@/components/ui/Tooltip';
import { useIncidentSummary } from '@/hooks/useIncidents';
import { useThreatSummary } from '@/hooks/useSecurityEvents';
function NavBadge({ count, tone = 'critical' }) {
    if (!count)
        return null;
    return (_jsx("span", { className: cn('mono tnum shrink-0 rounded-[2px] border px-1 text-[10.5px] font-bold', tone === 'critical' ? 'border-critical/40 bg-critical/15 text-critical' : 'border-high/40 bg-high/15 text-high'), children: count > 99 ? '99+' : count }));
}
/**
 * Command rail. Expanded shows the terminal-prefixed label; collapsed shows the
 * icon plus a tooltip. Group labels become hairline rules when collapsed.
 */
export function Sidebar() {
    const { sidebarCollapsed } = useUI();
    const { connected } = useLive();
    const { data: threatSummary } = useThreatSummary();
    const { data: incidentSummary } = useIncidentSummary();
    const badges = {
        threats: (threatSummary?.critical ?? 0) + (threatSummary?.high ?? 0),
        incidents: (incidentSummary?.open ?? 0) + (incidentSummary?.investigating ?? 0),
    };
    return (_jsxs(motion.aside, { animate: { width: sidebarCollapsed ? 52 : 196 }, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }, className: "relative z-30 hidden shrink-0 flex-col border-r border-line bg-base lg:flex", "aria-label": "Primary navigation", children: [_jsx("nav", { className: "min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2 no-scrollbar", children: NAVIGATION.map((group) => (_jsxs("div", { className: "mb-1.5", children: [sidebarCollapsed ? (_jsx("div", { className: "mx-2.5 my-2 h-px bg-line", role: "separator", "aria-label": group.label })) : (_jsxs("div", { className: "mono mb-1 flex items-center gap-1.5 px-3 text-[10.5px] font-semibold tracking-[0.02em] text-ink-4 uppercase", children: [_jsx("span", { "aria-hidden": true, children: "\u2500\u2500" }), _jsx("span", { className: "truncate", children: group.label }), _jsx("span", { className: "h-px flex-1 bg-line", "aria-hidden": true })] })), _jsx("ul", { className: "space-y-px", children: group.items.map((item) => {
                                const Icon = item.icon;
                                const badge = item.badgeKey ? badges[item.badgeKey] ?? 0 : 0;
                                const link = (_jsx(NavLink, { to: item.to, title: sidebarCollapsed ? item.label : undefined, className: ({ isActive }) => cn('group relative flex items-center gap-2 border-l-2 py-[5px] transition-colors duration-150', sidebarCollapsed ? 'justify-center border-l-2 pl-0' : 'pr-2 pl-2.5', isActive
                                        ? 'border-term bg-term/8 text-term'
                                        : 'border-transparent text-ink-3 hover:border-line-3 hover:bg-panel-2 hover:text-ink'), children: ({ isActive }) => (_jsxs(_Fragment, { children: [!sidebarCollapsed ? (_jsx("span", { className: cn('mono w-2.5 shrink-0 text-[11px]', isActive ? 'text-term' : 'text-ink-4 group-hover:text-term/70'), "aria-hidden": true, children: isActive ? '>>' : '>' })) : null, _jsx(Icon, { className: "size-3.5 shrink-0", "aria-hidden": true }), !sidebarCollapsed ? (_jsx("span", { className: "mono min-w-0 flex-1 truncate text-[10.5px] font-semibold tracking-[0.02em] uppercase", children: item.short })) : null, !sidebarCollapsed && badge ? _jsx(NavBadge, { count: badge, tone: item.badgeKey === 'incidents' ? 'high' : 'critical' }) : null, sidebarCollapsed && badge ? (_jsx("span", { className: "absolute top-1 right-1.5 size-1.5 rounded-full bg-critical", "aria-hidden": true })) : null, isActive ? (_jsx(motion.span, { layoutId: "nav-active-glow", className: "absolute inset-y-0 right-0 w-px bg-term/60", transition: { duration: 0.2 }, "aria-hidden": true })) : null] })) }));
                                return (_jsx("li", { children: sidebarCollapsed ? (_jsx(Tooltip, { content: item.label, side: "right", label: item.label, className: "w-full", children: _jsx("span", { className: "block w-full", children: link }) })) : (link) }, item.to));
                            }) })] }, group.id))) }), _jsx("div", { className: "shrink-0 border-t border-line bg-base px-2.5 py-2", children: sidebarCollapsed ? (_jsx(Tooltip, { content: connected ? 'All subsystems operational' : 'Live feed paused', side: "right", label: "System status", children: _jsx("span", { className: "flex w-full items-center justify-center", children: _jsx("span", { className: cn('size-2 rounded-full', connected ? 'bg-term text-term' : 'bg-ink-4 text-ink-4'), "aria-hidden": true }) }) })) : (_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "label-xs mb-1", children: "System status" }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: cn('size-1.5 shrink-0 rounded-full', connected ? 'bg-term text-term' : 'bg-ink-4 text-ink-4'), "aria-hidden": true }), _jsx("span", { className: cn('mono truncate text-[11px] font-semibold tracking-[0.01em] uppercase', connected ? 'text-term' : 'text-ink-3'), children: connected ? 'Operational' : 'Paused' })] }), _jsx(AnimatePresence, { children: connected ? (_jsx(motion.p, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "mono mt-1 truncate text-[10.5px] text-ink-4", children: "stream connected" })) : null })] })) })] }));
}
/** Slide-out drawer variant for tablet/mobile widths. */
export function SidebarDrawer() {
    const { mobileNavOpen, setMobileNavOpen } = useUI();
    const { connected } = useLive();
    const { data: threatSummary } = useThreatSummary();
    const { data: incidentSummary } = useIncidentSummary();
    const badges = {
        threats: (threatSummary?.critical ?? 0) + (threatSummary?.high ?? 0),
        incidents: (incidentSummary?.open ?? 0) + (incidentSummary?.investigating ?? 0),
    };
    return (_jsx(AnimatePresence, { children: mobileNavOpen ? (_jsxs("div", { className: "fixed inset-0 z-[75] lg:hidden", children: [_jsx(motion.div, { className: "absolute inset-0 bg-black/75", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 }, onClick: () => setMobileNavOpen(false), "aria-hidden": true }), _jsxs(motion.nav, { "aria-label": "Primary navigation", className: "absolute inset-y-0 left-0 flex w-[248px] flex-col border-r border-line-2 bg-base", initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' }, transition: { type: 'tween', duration: 0.22, ease: [0.22, 1, 0.36, 1] }, children: [_jsxs("div", { className: "flex h-11 shrink-0 items-center gap-2 border-b border-line px-3", children: [_jsxs("span", { className: "flex min-w-0 items-center gap-1.5", children: [_jsx("span", { className: "mono text-[12px] leading-none text-term", "aria-hidden": true, children: "\u25C8" }), _jsxs("span", { className: "mono truncate text-[11px] font-bold tracking-[0.02em] text-ink uppercase", children: ["Cyber", _jsx("span", { className: "text-term", children: "Sentinel" })] })] }), _jsx("span", { className: "flex-1" }), _jsx("button", { type: "button", onClick: () => setMobileNavOpen(false), "aria-label": "Close navigation", className: "rounded-[2px] border border-line-2 p-1 text-ink-3", children: _jsx("svg", { viewBox: "0 0 24 24", className: "size-3.5", fill: "none", stroke: "currentColor", strokeWidth: "2.5", "aria-hidden": true, children: _jsx("path", { d: "M18 6 6 18M6 6l12 12" }) }) })] }), _jsx("div", { className: "min-h-0 flex-1 overflow-y-auto py-2", children: NAVIGATION.map((group) => (_jsxs("div", { className: "mb-2", children: [_jsxs("div", { className: "mono mb-1 flex items-center gap-1.5 px-3 text-[10.5px] font-semibold tracking-[0.02em] text-ink-4 uppercase", children: [_jsx("span", { "aria-hidden": true, children: "\u2500\u2500" }), _jsx("span", { children: group.label }), _jsx("span", { className: "h-px flex-1 bg-line", "aria-hidden": true })] }), _jsx("ul", { className: "space-y-px", children: group.items.map((item) => {
                                            const Icon = item.icon;
                                            const badge = item.badgeKey ? badges[item.badgeKey] ?? 0 : 0;
                                            return (_jsx("li", { children: _jsxs(NavLink, { to: item.to, onClick: () => setMobileNavOpen(false), className: ({ isActive }) => cn('flex items-center gap-2 border-l-2 py-2 pr-3 pl-2.5 transition-colors', isActive ? 'border-term bg-term/8 text-term' : 'border-transparent text-ink-3 hover:bg-panel-2 hover:text-ink'), children: [_jsx("span", { className: "mono w-3 text-[11px] text-ink-4", "aria-hidden": true, children: ">" }), _jsx(Icon, { className: "size-4 shrink-0", "aria-hidden": true }), _jsx("span", { className: "mono min-w-0 flex-1 truncate text-[11px] font-semibold tracking-[0.01em] uppercase", children: item.short }), badge ? _jsx(NavBadge, { count: badge }) : null] }) }, item.to));
                                        }) })] }, group.id))) }), _jsx("div", { className: "shrink-0 border-t border-line px-3 py-2", children: _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: cn('size-1.5 rounded-full', connected ? 'bg-term text-term' : 'bg-ink-4 text-ink-4'), "aria-hidden": true }), _jsxs("span", { className: "mono text-[11px] font-semibold tracking-[0.01em] text-ink-2 uppercase", children: ["SYSTEM ", connected ? 'ONLINE' : 'PAUSED'] })] }) })] })] })) : null }));
}
export const NAV_ITEM_COUNT = ALL_NAV_ITEMS.length;
