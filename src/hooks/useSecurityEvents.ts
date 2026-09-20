import { useQuery } from '@tanstack/react-query';
import { eventsApi, type EventQuery } from '@/services/eventsApi';
import { queryKeys } from '@/services/queryKeys';

export function useSecurityEvents(query: EventQuery = {}) {
  return useQuery({
    queryKey: queryKeys.events(query),
    queryFn: () => eventsApi.list(query),
    staleTime: 8_000,
    placeholderData: (previous) => previous,
  });
}

export function useRecentEvents(limit = 8) {
  return useQuery({
    queryKey: queryKeys.eventsRecent(limit),
    queryFn: () => eventsApi.recent(limit),
    staleTime: 5_000,
    refetchInterval: 15_000,
  });
}

export function useEventDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.eventDetail(id ?? 'none'),
    queryFn: () => eventsApi.byId(id!),
    enabled: Boolean(id),
  });
}

export function useRelatedEvents(id: string | null, event: Parameters<typeof eventsApi.related>[0] | null) {
  return useQuery({
    queryKey: queryKeys.eventRelated(id ?? 'none'),
    queryFn: () => eventsApi.related(event!),
    enabled: Boolean(id && event),
  });
}

export function useThreatSummary() {
  return useQuery({
    queryKey: queryKeys.threatSummary(),
    queryFn: () => eventsApi.summary(),
    staleTime: 10_000,
    refetchInterval: 20_000,
  });
}

export function useIncidentEvents(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.incidentEvents(id ?? 'none'),
    queryFn: () => eventsApi.byIncident(id!),
    enabled: Boolean(id),
  });
}
