import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, BellOff, Bot, CheckCheck, Fingerprint, Network, Radar, ShieldAlert, X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUI } from '@/store/UIContext';
import {
  useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications,
} from '@/hooks/useNotifications';
import { formatRelative } from '@/utils/dates';
import { severityMeta } from '@/utils/severity';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import type { NotificationKind } from '@/types/notification';

const KIND_ICON: Record<NotificationKind, ReactNode> = {
  threat: <ShieldAlert className="size-3.5" aria-hidden />,
  incident: <Fingerprint className="size-3.5" aria-hidden />,
  authentication: <Radar className="size-3.5" aria-hidden />,
  scan: <Bot className="size-3.5" aria-hidden />,
  intelligence: <Network className="size-3.5" aria-hidden />,
  system: <Bell className="size-3.5" aria-hidden />,
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

  if (!notificationsOpen) return null;

  return (
    <div className="fixed inset-0 z-[85]" role="presentation">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => setNotificationsOpen(false)}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Notification center"
        className="absolute inset-y-0 right-0 flex w-full max-w-[400px] flex-col border-l border-line-2 bg-panel shadow-[-8px_0_24px_rgba(0,0,0,0.45)]"
      >
        <header className="flex shrink-0 items-center gap-2 border-b border-line bg-panel-2 px-3 py-2.5">
          <Bell className="size-3.5 text-term" aria-hidden />
          <h2 className="flex-1 text-[13px] font-semibold text-ink">
            Notifications
          </h2>
          {unread ? (
            <span className={cn(
              'mono tnum rounded-[2px] border px-1.5 py-px text-[11px] font-bold',
              criticalCount ? 'border-critical/40 bg-critical/12 text-critical' : 'border-line-3 bg-raised text-ink-3',
            )}>
              {unread} NEW
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setNotificationsOpen(false)}
            aria-label="Close notification center"
            className="rounded-[2px] p-1 text-ink-3 transition-colors hover:bg-raised hover:text-ink"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex shrink-0 items-center gap-2 border-b border-line bg-base px-3 py-1.5">
          <Button
            variant="secondary"
            size="xs"
            icon={<CheckCheck className="size-3" aria-hidden />}
            onClick={() => markAll.mutate()}
            disabled={!unread || markAll.isPending}
            loading={markAll.isPending}
          >
            Mark all read
          </Button>
          <span className="flex-1" />
          <span className="mono text-[11px] text-ink-4">{items.length} total</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="panel p-2.5">
                  <Skeleton className="mb-2 h-2.5 w-32" />
                  <Skeleton className="mb-1.5 h-2 w-full" />
                  <Skeleton className="h-2 w-2/3" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="Unable to load notifications"
              message={(error as Error)?.message ?? 'The notification service could not be reached.'}
              onRetry={() => refetch()}
              compact
            />
          ) : !items.length ? (
            <EmptyState
              icon={<BellOff className="size-4" aria-hidden />}
              title="No notifications"
              description="Detections, incidents and scan completions will appear here as they occur."
            />
          ) : (
            <ul className="divide-y divide-line">
              {items.map((notification) => {
                const meta = severityMeta(notification.severity);
                return (
                  <li key={notification.id} className={cn('relative px-3 py-2.5 transition-colors', !notification.read && 'bg-panel')}>
                    <span
                      className="absolute inset-y-0 left-0 w-[2px]"
                      style={{ background: notification.read ? 'transparent' : meta.hex }}
                      aria-hidden
                    />
                    <div className="flex items-start gap-2.5">
                      <span className={cn('mt-0.5 shrink-0', notification.read ? 'text-ink-4' : meta.text)} aria-hidden>
                        {KIND_ICON[notification.kind]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className={cn('mono shrink-0 text-[10.5px] font-bold tracking-[0.02em]', meta.text)}>
                            {meta.label}
                          </span>
                          <p className={cn('min-w-0 flex-1 truncate text-[11.5px] font-medium', notification.read ? 'text-ink-3' : 'text-ink')}>
                            {notification.title}
                          </p>
                        </div>
                        <p className="mono mt-0.5 text-[10.5px] leading-relaxed break-words text-ink-4">
                          {notification.description}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="mono text-[11px] text-ink-4">{formatRelative(notification.timestamp)}</span>
                          {!notification.read ? (
                            <>
                              <span className="size-1 rounded-full bg-term" aria-label="Unread" />
                              <button
                                type="button"
                                onClick={() => markRead.mutate(notification.id)}
                                className="text-[11px] tracking-[0.01em] text-ink-4 transition-colors hover:text-term"
                              >
                                Mark read
                              </button>
                            </>
                          ) : null}
                          <span className="flex-1" />
                          {notification.href ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (!notification.read) markRead.mutate(notification.id);
                                setNotificationsOpen(false);
                                navigate(notification.href!);
                              }}
                              className="mono text-[11px] tracking-[0.01em] text-term uppercase transition-colors hover:underline"
                            >
                              {notification.actionLabel ?? 'Open'} →
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="shrink-0 border-t border-line bg-base px-3 py-1.5">
          <p className="mono text-[10.5px] leading-relaxed text-ink-4">
            Alert routing follows Settings → Notifications. Backend delivery (email / webhook) is pending FastAPI integration.
          </p>
        </footer>
      </aside>
    </div>
  );
}
