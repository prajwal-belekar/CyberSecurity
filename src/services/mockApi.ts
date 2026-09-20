/**
 * Mock API core.
 *
 * Holds the mutable in-memory "database" that the simulated backend serves from,
 * exposes a tiny event emitter so the live simulator can push updates to the UI,
 * and applies realistic latency (plus optional failure injection so error states
 * can actually be demonstrated).
 *
 * UI code must never import mock arrays directly — it goes through the domain
 * services in ./services/*Api.ts, which call into this store in mock mode and
 * into `apiRequest` in live mode.
 */

import type { SecurityEvent } from '@/types/threat';
import type { Threat } from '@/types/threat';
import type { Incident } from '@/types/incident';
import type { AppNotification } from '@/types/notification';
import type { SystemMetrics } from '@/types/system';
import type { PhishingScanRecord } from '@/types/phishing';
import {
  INCIDENTS, NOTIFICATIONS, SECURITY_EVENTS, THREATS, BASELINE_METRICS, PHISHING_SCAN_HISTORY,
} from '@/data/mock';
import { seededRandom, intBetween } from '@/utils/random';

export type StoreEventType = 'event' | 'notification' | 'metrics' | 'threat' | 'incident' | 'reset';

interface StoreListener {
  (type: StoreEventType, payload?: unknown): void;
}

const rng = seededRandom('mock-store');

/** Latency band (ms) applied to every mock call so skeletons are visible. */
const LATENCY: [number, number] = [140, 520];

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => { setTimeout(resolve, ms); });

export async function simulateLatency(min = LATENCY[0], max = LATENCY[1]): Promise<void> {
  await delay(intBetween(rng, min, max));
}

/**
 * Failure injection — surfaced in Settings → API so the professional error
 * states required by the spec are demonstrable rather than theoretical.
 */
let failureInjection = false;
export const setFailureInjection = (enabled: boolean): void => { failureInjection = enabled; };
export const isFailureInjectionEnabled = (): boolean => failureInjection;

export async function guardFailures(endpoint: string): Promise<void> {
  if (!failureInjection) return;
  const { ApiError } = await import('./api');
  throw new ApiError(
    'The security data service could not be reached.',
    503,
    endpoint,
    'Simulated failure — disable "Inject API failures" in Settings → API configuration.',
  );
}

class MockStore {
  events: SecurityEvent[] = [...SECURITY_EVENTS];
  threats: Threat[] = [...THREATS];
  incidents: Incident[] = structuredClone(INCIDENTS);
  notifications: AppNotification[] = [...NOTIFICATIONS];
  phishingScans: PhishingScanRecord[] = [...PHISHING_SCAN_HISTORY];
  metrics: SystemMetrics = { ...BASELINE_METRICS };
  startedAt = Date.now();

  private listeners = new Set<StoreListener>();

  subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  emit(type: StoreEventType, payload?: unknown): void {
    this.listeners.forEach((listener) => {
      try { listener(type, payload); } catch { /* a broken subscriber must not kill the feed */ }
    });
  }

  /** Newest-first insertion, capped so the feed stays performant. */
  pushEvent(event: SecurityEvent, cap = 400): SecurityEvent {
    this.events = [event, ...this.events].slice(0, cap);
    this.metrics = { ...this.metrics, totalEvents: this.metrics.totalEvents + 1 };
    this.emit('event', event);
    return event;
  }

  pushNotification(notification: AppNotification): AppNotification {
    this.notifications = [notification, ...this.notifications].slice(0, 60);
    this.emit('notification', notification);
    return notification;
  }

  updateThreat(id: string, patch: Partial<Threat>): Threat | undefined {
    const index = this.threats.findIndex((t) => t.id === id);
    if (index === -1) return undefined;
    const next = { ...this.threats[index]!, ...patch };
    this.threats = this.threats.map((t) => (t.id === id ? next : t));
    this.emit('threat', next);
    return next;
  }

  updateIncident(id: string, patch: Partial<Incident>): Incident | undefined {
    const index = this.incidents.findIndex((i) => i.id === id);
    if (index === -1) return undefined;
    const next: Incident = {
      ...this.incidents[index]!,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.incidents = this.incidents.map((i) => (i.id === id ? next : i));
    this.emit('incident', next);
    return next;
  }

  markNotificationRead(id: string): void {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.emit('notification');
  }

  markAllNotificationsRead(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.emit('notification');
  }

  setEventStatus(id: string, status: SecurityEvent['status']): void {
    this.events = this.events.map((e) => (e.id === id ? { ...e, status } : e));
    this.emit('event');
  }

  setMetrics(patch: Partial<SystemMetrics>): void {
    this.metrics = { ...this.metrics, ...patch };
    this.emit('metrics', this.metrics);
  }

  reset(): void {
    this.events = [...SECURITY_EVENTS];
    this.threats = [...THREATS];
    this.incidents = structuredClone(INCIDENTS);
    this.notifications = [...NOTIFICATIONS];
    this.metrics = { ...BASELINE_METRICS };
    this.startedAt = Date.now();
    this.emit('reset');
  }
}

export const mockStore = new MockStore();
