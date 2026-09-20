import { apiRequest, ENDPOINTS, USE_MOCK } from './api';
import { guardFailures, mockStore, simulateLatency } from './mockApi';
import { BASELINE_METRICS, BOOT_LINES, DEFAULT_LOADING_LABEL, ROUTE_LOADING_LABELS, SYSTEM_HEALTH, } from '@/data/mock';
export const systemApi = {
    /** Start-up sequence copy. Presentational, so it is served synchronously. */
    bootLines() {
        return BOOT_LINES;
    },
    /** Seed values the live simulator starts from before telemetry drifts. */
    baselineMetrics() {
        return BASELINE_METRICS;
    },
    /**
     * Terminal-style loading copy for a route (spec §34). Longest prefix match
     * so `/threat-intelligence` is not shadowed by `/threats`.
     */
    routeLoadingLabel(pathname) {
        let best = '';
        let label = DEFAULT_LOADING_LABEL;
        for (const [prefix, text] of ROUTE_LOADING_LABELS) {
            if (pathname.startsWith(prefix) && prefix.length > best.length) {
                best = prefix;
                label = text;
            }
        }
        return label;
    },
    async health() {
        if (!USE_MOCK)
            return apiRequest(ENDPOINTS.systemHealth);
        await guardFailures(ENDPOINTS.systemHealth);
        await simulateLatency(90, 220);
        return SYSTEM_HEALTH;
    },
    /** Synchronous read used by the header/status bar ticker (no network round-trip). */
    metrics() {
        return mockStore.metrics;
    },
    async fetchMetrics() {
        if (!USE_MOCK)
            return apiRequest(ENDPOINTS.systemMetrics);
        await simulateLatency(40, 120);
        return mockStore.metrics;
    },
    subscribe(listener) {
        return mockStore.subscribe((type, payload) => {
            if (type === 'metrics' && payload)
                listener(payload);
        });
    },
};
