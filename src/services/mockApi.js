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
import { INCIDENTS, NOTIFICATIONS, SECURITY_EVENTS, THREATS, BASELINE_METRICS, PHISHING_SCAN_HISTORY, } from '@/data/mock';
import { seededRandom, intBetween } from '@/utils/random';
const rng = seededRandom('mock-store');
/** Latency band (ms) applied to every mock call so skeletons are visible. */
const LATENCY = [140, 520];
export const delay = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
export async function simulateLatency(min = LATENCY[0], max = LATENCY[1]) {
    await delay(intBetween(rng, min, max));
}
/**
 * Failure injection — surfaced in Settings → API so the professional error
 * states required by the spec are demonstrable rather than theoretical.
 */
let failureInjection = false;
export const setFailureInjection = (enabled) => { failureInjection = enabled; };
export const isFailureInjectionEnabled = () => failureInjection;
export async function guardFailures(endpoint) {
    if (!failureInjection)
        return;
    const { ApiError } = await import('./api');
    throw new ApiError('The security data service could not be reached.', 503, endpoint, 'Simulated failure — disable "Inject API failures" in Settings → API configuration.');
}
class MockStore {
    events = [...SECURITY_EVENTS];
    threats = [...THREATS];
    incidents = structuredClone(INCIDENTS);
    notifications = [...NOTIFICATIONS];
    phishingScans = [...PHISHING_SCAN_HISTORY];
    metrics = { ...BASELINE_METRICS };
    startedAt = Date.now();
    listeners = new Set();
    subscribe(listener) {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }
    emit(type, payload) {
        this.listeners.forEach((listener) => {
            try {
                listener(type, payload);
            }
            catch { /* a broken subscriber must not kill the feed */ }
        });
    }
    /** Newest-first insertion, capped so the feed stays performant. */
    pushEvent(event, cap = 400) {
        this.events = [event, ...this.events].slice(0, cap);
        this.metrics = { ...this.metrics, totalEvents: this.metrics.totalEvents + 1 };
        this.emit('event', event);
        return event;
    }
    pushNotification(notification) {
        this.notifications = [notification, ...this.notifications].slice(0, 60);
        this.emit('notification', notification);
        return notification;
    }
    updateThreat(id, patch) {
        const index = this.threats.findIndex((t) => t.id === id);
        if (index === -1)
            return undefined;
        const next = { ...this.threats[index], ...patch };
        this.threats = this.threats.map((t) => (t.id === id ? next : t));
        this.emit('threat', next);
        return next;
    }
    updateIncident(id, patch) {
        const index = this.incidents.findIndex((i) => i.id === id);
        if (index === -1)
            return undefined;
        const next = {
            ...this.incidents[index],
            ...patch,
            updatedAt: new Date().toISOString(),
        };
        this.incidents = this.incidents.map((i) => (i.id === id ? next : i));
        this.emit('incident', next);
        return next;
    }
    markNotificationRead(id) {
        this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
        this.emit('notification');
    }
    markAllNotificationsRead() {
        this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
        this.emit('notification');
    }
    setEventStatus(id, status) {
        this.events = this.events.map((e) => (e.id === id ? { ...e, status } : e));
        this.emit('event');
    }
    setMetrics(patch) {
        this.metrics = { ...this.metrics, ...patch };
        this.emit('metrics', this.metrics);
    }
    reset() {
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
