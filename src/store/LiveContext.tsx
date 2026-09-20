import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { SecurityEvent } from '@/types/threat';
import type { AppNotification } from '@/types/notification';
import type { SystemMetrics } from '@/types/system';
import { liveSimulator, mockStore } from '@/services';
import { systemApi } from '@/services/systemApi';
import { useSettings } from './SettingsContext';
import { useToast } from './ToastContext';

interface LiveContextValue {
  /** Most recent simulated events, newest first — feeds the terminal stream. */
  stream: SecurityEvent[];
  metrics: SystemMetrics;
  unreadNotifications: number;
  connected: boolean;
  lastEventAt: string | null;
  scenarioProgress: number;
  pause: () => void;
  resume: () => void;
  paused: boolean;
}

const LiveContext = createContext<LiveContextValue | null>(null);

const STREAM_CAP = 60;

/**
 * Real-time simulation host.
 *
 * Starts the deterministic scenario engine, mirrors new events into a local
 * stream for the terminal panels, throttles TanStack Query invalidation so
 * lists refresh without a re-render storm, and raises toasts in line with the
 * user's notification preferences. When the FastAPI backend lands, only
 * `liveSimulator` is replaced by a WebSocket subscription — nothing below it.
 */
export function LiveProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [stream, setStream] = useState<SecurityEvent[]>(() => mockStore.events.slice(0, STREAM_CAP));
  const [metrics, setMetrics] = useState<SystemMetrics>(() => mockStore.metrics ?? systemApi.baselineMetrics());
  const [unread, setUnread] = useState(() => mockStore.notifications.filter((n) => !n.read).length);
  const [paused, setPaused] = useState(false);
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const invalidateTimer = useRef<number | null>(null);
  const prefs = useRef(settings.notifications);
  prefs.current = settings.notifications;

  const scheduleInvalidation = useCallback(() => {
    if (invalidateTimer.current) return;
    invalidateTimer.current = window.setTimeout(() => {
      invalidateTimer.current = null;
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['threat-summary'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    }, 1200);
  }, [queryClient]);

  useEffect(() => {
    const unsubscribe = mockStore.subscribe((type, payload) => {
      if (type === 'event') {
        const event = payload as SecurityEvent;
        setStream((prev) => [event, ...prev].slice(0, STREAM_CAP));
        setLastEventAt(event.timestamp);
        scheduleInvalidation();
      } else if (type === 'notification') {
        const notification = payload as AppNotification | undefined;
        setUnread(mockStore.notifications.filter((n) => !n.read).length);
        scheduleInvalidation();
        if (!notification) return;
        const allowed =
          (notification.severity === 'critical' && prefs.current.criticalAlerts) ||
          (notification.severity === 'high' && prefs.current.highAlerts) ||
          (notification.severity === 'medium' && prefs.current.mediumAlerts) ||
          (notification.severity !== 'critical' && notification.severity !== 'high' && notification.severity !== 'medium');
        if (allowed && prefs.current.desktopToasts) {
          toast.push({
            severity: notification.severity,
            title: notification.title,
            description: notification.description,
            href: notification.href,
          });
        }
      } else if (type === 'metrics') {
        setMetrics(payload as SystemMetrics);
      } else if (type === 'reset') {
        setStream(mockStore.events.slice(0, STREAM_CAP));
        setMetrics(mockStore.metrics);
        setUnread(mockStore.notifications.filter((n) => !n.read).length);
      }
    });
    return unsubscribe;
  }, [scheduleInvalidation, toast]);

  // Start / stop the simulated feed according to Settings.
  useEffect(() => {
    if (settings.liveEventStream && !paused) {
      liveSimulator.start();
    } else {
      liveSimulator.stop();
    }
    return () => { liveSimulator.stop(); };
  }, [settings.liveEventStream, paused]);

  // Progress ticker for the scenario HUD.
  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress(Math.min(100, Math.round((liveSimulator.elapsedSeconds() / liveSimulator.scenarioLengthSeconds) * 100)));
      setMetrics((prev) => ({ ...prev, uptimeSeconds: prev.uptimeSeconds + 1 }));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => () => { if (invalidateTimer.current) window.clearTimeout(invalidateTimer.current); }, []);

  const value = useMemo<LiveContextValue>(() => ({
    stream,
    metrics,
    unreadNotifications: unread,
    connected: settings.liveEventStream && !paused,
    lastEventAt,
    scenarioProgress: progress,
    pause: () => setPaused(true),
    resume: () => setPaused(false),
    paused,
  }), [stream, metrics, unread, settings.liveEventStream, paused, lastEventAt, progress]);

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLive(): LiveContextValue {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error('useLive must be used inside <LiveProvider>');
  return ctx;
}
