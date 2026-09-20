import { apiRequest, ENDPOINTS, USE_MOCK } from './api';
import { guardFailures, simulateLatency } from './mockApi';
import { NETWORK_EVENTS, NETWORK_LINKS, NETWORK_NODES, NETWORK_SUMMARY } from '@/data/mock';
import { isWithinRange } from '@/utils/dates';
export const networkApi = {
    async topology() {
        if (!USE_MOCK)
            return apiRequest(ENDPOINTS.networkTopology);
        await guardFailures(ENDPOINTS.networkTopology);
        await simulateLatency(180, 420);
        return { nodes: NETWORK_NODES, links: NETWORK_LINKS };
    },
    async summary() {
        if (!USE_MOCK)
            return apiRequest(ENDPOINTS.networkSummary);
        await guardFailures(ENDPOINTS.networkSummary);
        await simulateLatency(120, 300);
        return NETWORK_SUMMARY;
    },
    async events(query = {}) {
        if (!USE_MOCK)
            return apiRequest(ENDPOINTS.networkEvents, { query: query });
        await guardFailures(ENDPOINTS.networkEvents);
        await simulateLatency();
        const search = query.search?.trim().toLowerCase();
        const filtered = NETWORK_EVENTS.filter((event) => {
            if (query.severity && query.severity !== 'all' && event.severity !== query.severity)
                return false;
            if (query.action && query.action !== 'all' && event.action !== query.action)
                return false;
            if (query.protocol && query.protocol !== 'all' && event.protocol !== query.protocol)
                return false;
            if (query.timeRange && query.timeRange !== 'all' && !isWithinRange(event.timestamp, query.timeRange))
                return false;
            if (search) {
                const haystack = `${event.id} ${event.sourceIp} ${event.destIp} ${event.category} ${event.protocol}`.toLowerCase();
                if (!haystack.includes(search))
                    return false;
            }
            return true;
        });
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 14;
        return { items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
    },
    async node(id) {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.networkTopology}/${id}`);
        await simulateLatency(60, 160);
        return NETWORK_NODES.find((n) => n.id === id);
    },
};
