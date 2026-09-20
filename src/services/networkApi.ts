import type { NetworkEvent, NetworkLink, NetworkNode, NetworkSummary } from '@/types/network';
import { apiRequest, ENDPOINTS, USE_MOCK } from './api';
import { guardFailures, simulateLatency } from './mockApi';
import { NETWORK_EVENTS, NETWORK_LINKS, NETWORK_NODES, NETWORK_SUMMARY } from '@/data/mock';
import { isWithinRange } from '@/utils/dates';

export interface NetworkQuery {
  search?: string;
  severity?: string;
  action?: string;
  protocol?: string;
  timeRange?: string;
  page?: number;
  pageSize?: number;
}

export const networkApi = {
  async topology(): Promise<{ nodes: NetworkNode[]; links: NetworkLink[] }> {
    if (!USE_MOCK) return apiRequest(ENDPOINTS.networkTopology);
    await guardFailures(ENDPOINTS.networkTopology);
    await simulateLatency(180, 420);
    return { nodes: NETWORK_NODES, links: NETWORK_LINKS };
  },

  async summary(): Promise<NetworkSummary> {
    if (!USE_MOCK) return apiRequest(ENDPOINTS.networkSummary);
    await guardFailures(ENDPOINTS.networkSummary);
    await simulateLatency(120, 300);
    return NETWORK_SUMMARY;
  },

  async events(query: NetworkQuery = {}): Promise<{ items: NetworkEvent[]; total: number }> {
    if (!USE_MOCK) return apiRequest(ENDPOINTS.networkEvents, { query: query as Record<string, string> });
    await guardFailures(ENDPOINTS.networkEvents);
    await simulateLatency();

    const search = query.search?.trim().toLowerCase();
    const filtered = NETWORK_EVENTS.filter((event) => {
      if (query.severity && query.severity !== 'all' && event.severity !== query.severity) return false;
      if (query.action && query.action !== 'all' && event.action !== query.action) return false;
      if (query.protocol && query.protocol !== 'all' && event.protocol !== query.protocol) return false;
      if (query.timeRange && query.timeRange !== 'all' && !isWithinRange(event.timestamp, query.timeRange)) return false;
      if (search) {
        const haystack = `${event.id} ${event.sourceIp} ${event.destIp} ${event.category} ${event.protocol}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 14;
    return { items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
  },

  async node(id: string): Promise<NetworkNode | undefined> {
    if (!USE_MOCK) return apiRequest(`${ENDPOINTS.networkTopology}/${id}`);
    await simulateLatency(60, 160);
    return NETWORK_NODES.find((n) => n.id === id);
  },
};
