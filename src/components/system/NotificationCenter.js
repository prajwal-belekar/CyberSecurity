import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, Bot, CheckCheck, Fingerprint, Network, Radar, ShieldAlert, X, } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUI } from '@/store/UIContext';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications, } from '@/hooks/useNotifications';
import { formatRelative } from '@/utils/dates';
import { severityMeta } from '@/utils/severity';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
const KIND_ICON = {
    threat: _jsx(ShieldAlert, { className: "size-3.5", "aria-hidden": true }),
    incident: _jsx(Fingerprint, { className: "size-3.5", "aria-hidden": true }),
    authentication: _jsx(Radar, { className: "size-3.5", "aria-hidden": true }),
    scan: _jsx(Bot, { className: "size-3.5", "aria-hidden": true }),
    intelligence: _jsx(Network, { className: "size-3.5", "aria-hidden": true }),
    system: _jsx(Bell, { className: "size-3.5", "aria-hidden": true }),
};
/** Slide-over notification center with per-item and bulk read handling. */
export function NotificationCenter() {
    const { notificationsOpen, setNotificationsOpen } = useUI();
    const { data, isLoading, isError, error, refetch, unread } = useNotifications();
    const markRead = useMarkNotificationRead();
    const markAll = useMarkAllNotificationsRead();
    const navigate = useNavigate();
    const items = useMemo(() => data ?? [], [data]);
    const criticalCount = items.filter((n) => !n.read && n.severity === 'critical').length;
    if (!notificationsOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-[85]", role: "presentation", children: [_jsx("div", { className: "absolute inset-0 bg-black/60", onClick: () => setNotificationsOpen(false), "aria-hidden": true }), _jsxs("aside", { role: "dialog", "aria-modal": "true", "aria-label": "Notification center", className: "absolute inset-y-0 right-0 flex w-full max-w-[400px] flex-col border-l border-line-2 bg-panel shadow-[-8px_0_24px_rgba(0,0,0,0.45)]", children: [_jsxs("header", { className: "flex shrink-0 items-center gap-2 border-b border-line bg-panel-2 px-3 py-2.5", children: [_jsx(Bell, { className: "size-3.5 text-term", "aria-hidden": true }), _jsx("h2", { className: "flex-1 text-[13px] font-semibold text-ink", children: "Notifications" }), unread ? (_jsxs("span", { className: cn('mono tnum rounded-[2px] border px-1.5 py-px text-[11px] font-bold', criticalCount ? 'border-critical/40 bg-critical/12 text-critical' : 'border-line-3 bg-raised text-ink-3'), children: [unread, " NEW"] })) : null, _jsx("button", { type: "button", onClick: () => setNotificationsOpen(false), "aria-label": "Close notification center", className: "rounded-[2px] p-1 text-ink-3 transition-colors hover:bg-raised hover:text-ink", children: _jsx(X, { className: "size-4", "aria-hidden": true }) })] }), _jsxs("div", { className: "flex shrink-0 items-center gap-2 border-b border-line bg-base px-3 py-1.5", children: [_jsx(Button, { variant: "secondary", size: "xs", icon: _jsx(CheckCheck, { className: "size-3", "aria-hidden": true }), onClick: () => markAll.mutate(), disabled: !unread || markAll.isPending, loading: markAll.isPending, children: "Mark all read" }), _jsx("span", { className: "flex-1" }), _jsxs("span", { className: "mono text-[11px] text-ink-4", children: [items.length, " total"] })] }), _jsx("div", { className: "min-h-0 flex-1 overflow-y-auto", children: isLoading ? (_jsx("div", { className: "space-y-2 p-3", children: Array.from({ length: 5 }).map((_, i) => (_jsxs("div", { className: "panel p-2.5", children: [_jsx(Skeleton, { className: "mb-2 h-2.5 w-32" }), _jsx(Skeleton, { className: "mb-1.5 h-2 w-full" }), _jsx(Skeleton, { className: "h-2 w-2/3" })] }, i))) })) : isError ? (_jsx(ErrorState, { title: "Unable to load notifications", message: error?.message ?? 'The notification service could not be reached.', onRetry: () => refetch(), compact: true })) : !items.length ? (_jsx(EmptyState, { icon: _jsx(BellOff, { className: "size-4", "aria-hidden": true }), title: "No notifications", description: "Detections, incidents and scan completions will appear here as they occur." })) : (_jsx("ul", { className: "divide-y divide-line", children: items.map((notification) => {
                                const meta = severityMeta(notification.severity);
                                return (_jsxs("li", { className: cn('relative px-3 py-2.5 transition-colors', !notification.read && 'bg-panel'), children: [_jsx("span", { className: "absolute inset-y-0 left-0 w-[2px]", style: { background: notification.read ? 'transparent' : meta.hex }, "aria-hidden": true }), _jsxs("div", { className: "flex items-start gap-2.5", children: [_jsx("span", { className: cn('mt-0.5 shrink-0', notification.read ? 'text-ink-4' : meta.text), "aria-hidden": true, children: KIND_ICON[notification.kind] }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-baseline gap-2", children: [_jsx("span", { className: cn('mono shrink-0 text-[10.5px] font-bold tracking-[0.02em]', meta.text), children: meta.label }), _jsx("p", { className: cn('min-w-0 flex-1 truncate text-[11.5px] font-medium', notification.read ? 'text-ink-3' : 'text-ink'), children: notification.title })] }), _jsx("p", { className: "mono mt-0.5 text-[10.5px] leading-relaxed break-words text-ink-4", children: notification.description }), _jsxs("div", { className: "mt-1.5 flex items-center gap-2", children: [_jsx("span", { className: "mono text-[11px] text-ink-4", children: formatRelative(notification.timestamp) }), !notification.read ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "size-1 rounded-full bg-term", "aria-label": "Unread" }), _jsx("button", { type: "button", onClick: () => markRead.mutate(notification.id), className: "text-[11px] tracking-[0.01em] text-ink-4 transition-colors hover:text-term", children: "Mark read" })] })) : null, _jsx("span", { className: "flex-1" }), notification.href ? (_jsxs("button", { type: "button", onClick: () => {
                                                                        if (!notification.read)
                                                                            markRead.mutate(notification.id);
                                                                        setNotificationsOpen(false);
                                                                        navigate(notification.href);
                                                                    }, className: "mono text-[11px] tracking-[0.01em] text-term uppercase transition-colors hover:underline", children: [notification.actionLabel ?? 'Open', " \u2192"] })) : null] })] })] })] }, notification.id));
                            }) })) }), _jsx("footer", { className: "shrink-0 border-t border-line bg-base px-3 py-1.5", children: _jsx("p", { className: "mono text-[10.5px] leading-relaxed text-ink-4", children: "Alert routing follows Settings \u2192 Notifications. Backend delivery (email / webhook) is pending FastAPI integration." }) })] })] }));
}
