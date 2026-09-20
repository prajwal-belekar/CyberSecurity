import { apiRequest, ENDPOINTS, USE_MOCK } from './api';
import { guardFailures, simulateLatency } from './mockApi';
import { INTELLIGENCE_SUMMARY, THREAT_INDICATORS } from '@/data/mock';
export const intelligenceApi = {
    async list(query = {}) {
        if (!USE_MOCK)
            return apiRequest(ENDPOINTS.intelligence, { query: query });
        await guardFailures(ENDPOINTS.intelligence);
        await simulateLatency();
        const search = query.search?.trim().toLowerCase();
        const filtered = THREAT_INDICATORS.filter((indicator) => {
            if (query.type && query.type !== 'all' && indicator.type !== query.type)
                return false;
            if (query.risk && query.risk !== 'all' && indicator.risk !== query.risk)
                return false;
            if (query.status && query.status !== 'all' && indicator.status !== query.status)
                return false;
            if (search) {
                const haystack = `${indicator.id} ${indicator.value} ${indicator.type} ${indicator.source} ${indicator.tags.join(' ')} ${indicator.threatActor ?? ''} ${indicator.description}`.toLowerCase();
                if (!haystack.includes(search))
                    return false;
            }
            return true;
        });
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 10;
        return { items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
    },
    async byId(id) {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.intelligence}/${id}`);
        await simulateLatency(80, 200);
        return THREAT_INDICATORS.find((i) => i.id === id || i.value === id);
    },
    async summary() {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.intelligence}/summary`);
        await simulateLatency(90, 220);
        return INTELLIGENCE_SUMMARY;
    },
    /** Look up an arbitrary value (IP / domain / hash) as an analyst would. */
    async lookup(value) {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.intelligence}/lookup`, { query: { value } });
        await simulateLatency(220, 520);
        const needle = value.trim().toLowerCase();
        if (!needle)
            return [];
        return THREAT_INDICATORS.filter((i) => i.value.toLowerCase() === needle || i.value.toLowerCase().includes(needle));
    },
};
