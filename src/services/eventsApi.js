import { apiRequest, ENDPOINTS, USE_MOCK } from './api';
import { guardFailures, mockStore, simulateLatency } from './mockApi';
import { THREAT_SUMMARY } from '@/data/mock';
import { isWithinRange } from '@/utils/dates';
function filterEvents(query) {
    const search = query.search?.trim().toLowerCase();
    return mockStore.events.filter((event) => {
        if (query.severity && query.severity !== 'all' && event.severity !== query.severity)
            return false;
        if (query.status && query.status !== 'all' && event.status !== query.status)
            return false;
        if (query.channel && query.channel !== 'all' && event.channel !== query.channel)
            return false;
        if (query.timeRange && query.timeRange !== 'all' && !isWithinRange(event.timestamp, query.timeRange))
            return false;
        if (search) {
            const haystack = `${event.id} ${event.type} ${event.source} ${event.target ?? ''} ${event.description ?? ''}`.toLowerCase();
            if (!haystack.includes(search))
                return false;
        }
        return true;
    });
}
export const eventsApi = {
    async list(query = {}) {
        if (!USE_MOCK) {
            return apiRequest(ENDPOINTS.events, { query: query });
        }
        await guardFailures(ENDPOINTS.events);
        await simulateLatency();
        const all = filterEvents(query);
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 12;
        return { items: all.slice((page - 1) * pageSize, page * pageSize), total: all.length };
    },
    async recent(limit = 8) {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.events}?limit=${limit}`);
        await guardFailures(ENDPOINTS.events);
        await simulateLatency(90, 240);
        return mockStore.events.slice(0, limit);
    },
    async byId(id) {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.events}/${id}`);
        await simulateLatency(60, 160);
        return mockStore.events.find((e) => e.id === id);
    },
    async byIncident(incidentId) {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.events}?incidentId=${incidentId}`);
        await simulateLatency(80, 200);
        return mockStore.events.filter((e) => e.incidentId === incidentId);
    },
    /** Evidence trail: events sharing a source, target, threat or incident. */
    async related(event, limit = 8) {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.events}/${event.id}/related`);
        await simulateLatency(80, 200);
        return mockStore.events
            .filter((e) => e.id !== event.id &&
            (e.source === event.source || e.target === event.target || e.threatId === event.threatId || e.incidentId === event.incidentId))
            .slice(0, limit);
    },
    async summary() {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.events}/summary`);
        await guardFailures(ENDPOINTS.events);
        await simulateLatency(80, 200);
        const critical = mockStore.events.filter((e) => e.severity === 'critical').length;
        const high = mockStore.events.filter((e) => e.severity === 'high').length;
        return {
            ...THREAT_SUMMARY,
            critical: Math.max(THREAT_SUMMARY.critical, critical),
            high: Math.max(THREAT_SUMMARY.high, high),
            eventsToday: mockStore.metrics.totalEvents,
            total: mockStore.metrics.totalEvents,
        };
    },
    async setStatus(id, status) {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.events}/${id}`, { method: 'PATCH', body: { status } });
        await simulateLatency(80, 200);
        mockStore.setEventStatus(id, status);
        return mockStore.events.find((e) => e.id === id);
    },
};
