import type { TimeSeriesPoint } from '@/types/common';
import { apiRequest, ENDPOINTS, USE_MOCK } from './api';
import { guardFailures, simulateLatency } from './mockApi';
import {
  ANALYTICS_HEADLINES, buildSeries, DETECTION_RULE_EFFICACY, INCIDENT_RESOLUTION_MIX,
  SEVERITY_MIX, THREAT_CATEGORY_MIX,
} from '@/data/mock';
import { intBetween, seededRandom } from '@/utils/random';

export interface AnalyticsBundle {
  headlines: typeof ANALYTICS_HEADLINES;
  threatTrend: TimeSeriesPoint[];
  eventVolume: TimeSeriesPoint[];
  incidentTrend: TimeSeriesPoint[];
  categories: typeof THREAT_CATEGORY_MIX;
  severity: typeof SEVERITY_MIX;
  resolution: typeof INCIDENT_RESOLUTION_MIX;
  ruleEfficacy: typeof DETECTION_RULE_EFFICACY;
}

export const analyticsApi = {
  async bundle(range: '24H' | '7D' | '30D' | '90D' = '30D'): Promise<AnalyticsBundle> {
    if (!USE_MOCK) return apiRequest(ENDPOINTS.analytics, { query: { range } });
    await guardFailures(ENDPOINTS.analytics);
    await simulateLatency(260, 620);

    const trendRng = seededRandom(`trend:${range}`);
    const threatTrend = buildSeries(range, 'threat-trend', (rng, index, dayFactor) => {
      const drift = 1 + index * 0.012;
      return {
        threats: Math.round((6 + rng() * 10) * dayFactor * drift),
        phishing: Math.round((1.5 + rng() * 3) * dayFactor * drift),
        authentication: Math.round((2.5 + rng() * 5) * dayFactor * drift),
        network: Math.round((1.8 + rng() * 4) * dayFactor * drift),
        malware: Math.round(rng() * 1.6 * dayFactor),
        web: Math.round(rng() * 1.4 * dayFactor),
      };
    });

    const eventVolume = buildSeries(range, 'event-volume', (rng, _index, dayFactor) => {
      const total = Math.round((180 + rng() * 260) * dayFactor);
      return { total, ingested: total, dropped: intBetween(trendRng, 0, 3), correlated: Math.round(total * 0.18) };
    });

    const incidentTrend = buildSeries(range, 'incident-trend', (rng, _index, dayFactor) => ({
      created: Math.round((0.4 + rng() * 2.2) * dayFactor),
      resolved: Math.round((0.5 + rng() * 2.0) * dayFactor),
      breached: rng() > 0.93 ? 1 : 0,
    }));

    return {
      headlines: ANALYTICS_HEADLINES,
      threatTrend,
      eventVolume,
      incidentTrend,
      categories: THREAT_CATEGORY_MIX,
      severity: SEVERITY_MIX,
      resolution: INCIDENT_RESOLUTION_MIX,
      ruleEfficacy: DETECTION_RULE_EFFICACY,
    };
  },
};
