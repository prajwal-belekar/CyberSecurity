/**
 * Mock real-time engine.
 *
 * Replays the deterministic escalation script from data/mock/events.ts against
 * the in-memory store, jittering system metrics along the way. This is the exact
 * seam that a FastAPI WebSocket feed will replace: consumers subscribe to
 * `mockStore` and never learn where the events came from.
 *
 * Design constraints honoured:
 *  · predictable, escalating scenario rather than random noise
 *  · one event every ~12s (configurable), never a firehose
 *  · notifications only for high/critical steps
 */
import { mockStore } from './mockApi';
import { instantiateScriptEvent, SCENARIO_LENGTH_SECONDS, SCENARIO_SCRIPT } from '@/data/mock';
import { seededRandom } from '@/utils/random';
const TICK_FLOOR_SECONDS = 10;
const rng = seededRandom('live-sim');
let timer = null;
let cursor = 0;
let startedAt = Date.now();
let running = false;
const listeners = new Set();
export function onLiveEvent(listener) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}
function nextTickMs() {
    // Script timestamps are absolute; derive the wait from the schedule so the
    // escalation cadence stays recognisable rather than uniformly random.
    const current = SCENARIO_SCRIPT[cursor];
    const next = SCENARIO_SCRIPT[cursor + 1];
    if (!current)
        return 12_000;
    if (!next)
        return 12_000;
    const delta = Math.max(TICK_FLOOR_SECONDS, next.atSeconds - current.atSeconds);
    return delta * 1000 + Math.round(rng() * 1200);
}
function jitterMetrics() {
    const m = mockStore.metrics;
    const drift = (value, amount, min, max) => Math.min(max, Math.max(min, value + (rng() - 0.5) * amount));
    mockStore.setMetrics({
        cpu: Math.round(drift(m.cpu, 9, 18, 88)),
        mem: Math.round(drift(m.mem, 5, 41, 84)),
        netMbps: Number(drift(m.netMbps, 7, 4.5, 62).toFixed(1)),
        eventsPerSecond: Number(drift(m.eventsPerSecond, 3.4, 2.1, 24).toFixed(1)),
        latencyMs: Math.round(drift(m.latencyMs, 9, 8, 64)),
        uptimeSeconds: Math.floor((Date.now() - mockStore.startedAt) / 1000) + 384_210,
    });
}
function fire() {
    if (!running)
        return;
    const step = SCENARIO_SCRIPT[cursor];
    if (step) {
        const event = instantiateScriptEvent(step);
        mockStore.pushEvent(event);
        listeners.forEach((l) => { try {
            l(event);
        }
        catch { /* subscriber isolation */ } });
        if (step.severity === 'critical' || step.severity === 'high') {
            mockStore.pushNotification({
                id: `NTF-LIVE-${event.id}`,
                kind: step.channel === 'INCIDENT' ? 'incident'
                    : step.channel === 'AUTH' ? 'authentication'
                        : step.channel === 'INTEL' ? 'intelligence'
                            : step.channel === 'SCAN' ? 'scan'
                                : 'threat',
                severity: step.severity,
                title: step.type,
                description: step.description,
                timestamp: event.timestamp,
                read: false,
                href: step.incidentId ? `/incidents/${step.incidentId}` : step.threatId ? `/threats/${step.threatId}` : '/threats',
                actionLabel: step.incidentId ? 'Open incident' : 'Investigate',
            });
        }
    }
    cursor += 1;
    jitterMetrics();
    // Loop the scenario after a quiet period so the demo stays alive indefinitely.
    if (cursor >= SCENARIO_SCRIPT.length) {
        cursor = 0;
        startedAt = Date.now();
        timer = setTimeout(fire, 26_000);
        return;
    }
    timer = setTimeout(fire, nextTickMs());
}
export const liveSimulator = {
    start(intervalMs) {
        if (running)
            return;
        running = true;
        cursor = 0;
        startedAt = Date.now();
        // First beat arrives quickly so a fresh page load feels alive.
        timer = setTimeout(fire, intervalMs ? Math.min(intervalMs, 6_000) : 4_500);
    },
    stop() {
        running = false;
        if (timer)
            clearTimeout(timer);
        timer = null;
    },
    isRunning() {
        return running;
    },
    /** Seconds since the current scenario loop began. */
    elapsedSeconds() {
        return Math.floor((Date.now() - startedAt) / 1000);
    },
    scenarioLengthSeconds: SCENARIO_LENGTH_SECONDS,
    /** Manually advance one step — used by the terminal dock's `stream next` command. */
    step() {
        if (timer)
            clearTimeout(timer);
        fire();
    },
};
