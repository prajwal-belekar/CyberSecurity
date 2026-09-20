/** Central query-key registry — keeps cache invalidation predictable. */

export const queryKeys = {
  events: (params?: unknown) => ['events', params] as const,
  eventsRecent: (limit?: number) => ['events', 'recent', limit] as const,
  eventDetail: (id: string) => ['events', 'detail', id] as const,
  eventRelated: (id: string) => ['events', 'related', id] as const,
  threatSummary: () => ['threat-summary'] as const,

  threats: (filters?: unknown) => ['threats', filters] as const,
  threatDetail: (id: string) => ['threats', 'detail', id] as const,
  threatActivity: (range: string) => ['threats', 'activity', range] as const,

  incidents: (status?: string) => ['incidents', status] as const,
  incidentDetail: (id: string) => ['incidents', 'detail', id] as const,
  incidentEvidence: (id: string) => ['incidents', 'evidence', id] as const,
  incidentEvents: (id: string) => ['incidents', 'events', id] as const,
  incidentSummary: () => ['incidents', 'summary'] as const,

  networkTopology: () => ['network', 'topology'] as const,
  networkSummary: () => ['network', 'summary'] as const,
  networkEvents: (params?: unknown) => ['network', 'events', params] as const,

  authSummary: () => ['auth', 'summary'] as const,
  authEvents: (params?: unknown) => ['auth', 'events', params] as const,
  authSequences: () => ['auth', 'sequences'] as const,
  authSeries: (range: string) => ['auth', 'series', range] as const,

  phishingHistory: () => ['phishing', 'history'] as const,

  webScan: () => ['web-security', 'latest'] as const,

  malwareReference: () => ['malware', 'reference'] as const,

  intelligence: (params?: unknown) => ['intelligence', params] as const,
  intelligenceSummary: () => ['intelligence', 'summary'] as const,

  analytics: (range: string) => ['analytics', range] as const,

  reports: (type?: string) => ['reports', type] as const,

  notifications: () => ['notifications'] as const,

  systemHealth: () => ['system', 'health'] as const,

  search: (query: string) => ['search', query] as const,
} as const;
