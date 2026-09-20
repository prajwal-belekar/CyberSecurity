import type { Threat, ThreatFilters } from '@/types/threat';
import type { TimeRange, TimeSeriesPoint } from '@/types/common';
import { apiRequest, ENDPOINTS, USE_MOCK } from './api';
import { guardFailures, mockStore, simulateLatency } from './mockApi';
import { ACTIVITY_RANGES, buildActivitySeries } from '@/data/mock';
import { isWithinRange } from '@/utils/dates';

export const threatsApi = {
  async list(filters: ThreatFilters = {}): Promise<Threat[]> {
    if (!USE_MOCK) return apiRequest(ENDPOINTS.threats, { query: filters as Record<string, string> });
    await guardFailures(ENDPOINTS.threats);
    await simulateLatency();

    const search = filters.search?.trim().toLowerCase();
    return mockStore.threats.filter((threat) => {
      if (filters.severity?.length && !filters.severity.includes(threat.severity)) return false;
      if (filters.status?.length && !filters.status.includes(threat.status)) return false;
      if (filters.type?.length && !filters.type.includes(threat.type)) return false;
      if (filters.source && !threat.source.toLowerCase().includes(filters.source.toLowerCase())) return false;
      if (filters.timeRange && filters.timeRange !== 'all' && !isWithinRange(threat.lastSeen, filters.timeRange)) return false;
      if (search) {
        const haystack = `${threat.id} ${threat.title} ${threat.source} ${threat.target} ${threat.description} ${threat.indicators.join(' ')}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  },

  async byId(id: string): Promise<Threat | undefined> {
    if (!USE_MOCK) return apiRequest(`${ENDPOINTS.threats}/${id}`);
    await simulateLatency(80, 220);
    return mockStore.threats.find((t) => t.id === id);
  },

  async updateStatus(id: string, status: Threat['status']): Promise<Threat | undefined> {
    if (!USE_MOCK) return apiRequest(`${ENDPOINTS.threats}/${id}`, { method: 'PATCH', body: { status } });
    await simulateLatency(120, 320);
    return mockStore.updateThreat(id, { status });
  },

  async activity(range: TimeRange = '24H'): Promise<TimeSeriesPoint[]> {
    if (!USE_MOCK) return apiRequest(`${ENDPOINTS.threats}/activity`, { query: { range } });
    await simulateLatency(120, 300);
    const cfg = ACTIVITY_RANGES[range] ?? ACTIVITY_RANGES['24H']!;
    return buildActivitySeries(cfg.points, cfg.stepMinutes, `activity:${range}`);
  },
};
