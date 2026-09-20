import type { AuthenticationEvent, AuthSequence, AuthSummary } from '@/types/authentication';
import type { TimeSeriesPoint } from '@/types/common';
import { apiRequest, ENDPOINTS, USE_MOCK } from './api';
import { guardFailures, simulateLatency } from './mockApi';
import { AUTHENTICATION_EVENTS, AUTH_SEQUENCES, AUTH_SUMMARY } from '@/data/mock';
import { isWithinRange } from '@/utils/dates';
import { seededRandom, intBetween } from '@/utils/random';

export interface AuthQuery {
  search?: string;
  status?: string;
  risk?: string;
  timeRange?: string;
  page?: number;
  pageSize?: number;
}

export const authenticationApi = {
  async summary(): Promise<AuthSummary> {
    if (!USE_MOCK) return apiRequest(ENDPOINTS.authSummary);
    await guardFailures(ENDPOINTS.authSummary);
    await simulateLatency(110, 280);
    return AUTH_SUMMARY;
  },

  async events(query: AuthQuery = {}): Promise<{ items: AuthenticationEvent[]; total: number }> {
    if (!USE_MOCK) return apiRequest(ENDPOINTS.authEvents, { query: query as Record<string, string> });
    await guardFailures(ENDPOINTS.authEvents);
    await simulateLatency();

    const search = query.search?.trim().toLowerCase();
    const filtered = AUTHENTICATION_EVENTS.filter((event) => {
      if (query.status && query.status !== 'all' && event.status !== query.status) return false;
      if (query.risk && query.risk !== 'all' && event.risk !== query.risk) return false;
      if (query.timeRange && query.timeRange !== 'all' && !isWithinRange(event.timestamp, query.timeRange)) return false;
      if (search) {
        const haystack = `${event.user} ${event.ip} ${event.location} ${event.device} ${event.method}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    return { items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
  },

  async sequences(): Promise<AuthSequence[]> {
    if (!USE_MOCK) return apiRequest(ENDPOINTS.authSequences);
    await simulateLatency(140, 340);
    return AUTH_SEQUENCES;
  },

  /** Hourly successful vs failed logins for the authentication chart. */
  async outcomesSeries(range: '24H' | '7D' | '30D' = '24H'): Promise<TimeSeriesPoint[]> {
    if (!USE_MOCK) return apiRequest(`${ENDPOINTS.authEvents}/series`, { query: { range } });
    await simulateLatency(120, 300);
    const points = range === '24H' ? 24 : range === '7D' ? 28 : 30;
    const stepMinutes = range === '24H' ? 60 : range === '7D' ? 360 : 1440;
    const rng = seededRandom(`auth-series:${range}`);
    const now = Date.now();
    const out: TimeSeriesPoint[] = [];
    for (let i = points - 1; i >= 0; i -= 1) {
      const d = new Date(now - i * stepMinutes * 60_000);
      const hour = d.getHours();
      const factor = hour >= 9 && hour <= 19 ? 1.6 : hour >= 6 && hour < 9 ? 1.1 : 0.45;
      const successful = Math.round((30 + rng() * 45) * factor);
      const failed = Math.round((2 + rng() * 9) * factor);
      out.push({
        timestamp: d.toISOString(),
        label: stepMinutes >= 1440
          ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : `${String(hour).padStart(2, '0')}:00`,
        successful,
        failed,
        suspicious: Math.round(failed * 0.25),
        locked: intBetween(rng, 0, 1),
      });
    }
    return out;
  },
};
