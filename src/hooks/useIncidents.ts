import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IncidentStatus } from '@/types/incident';
import { incidentsApi } from '@/services/incidentsApi';
import { queryKeys } from '@/services/queryKeys';

export function useIncidents(status: IncidentStatus | 'all' = 'all') {
  return useQuery({
    queryKey: queryKeys.incidents(status),
    queryFn: () => incidentsApi.list(status),
    staleTime: 10_000,
  });
}

export function useIncident(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.incidentDetail(id ?? 'none'),
    queryFn: () => incidentsApi.byId(id!),
    enabled: Boolean(id),
  });
}

export function useIncidentEvidence(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.incidentEvidence(id ?? 'none'),
    queryFn: () => incidentsApi.evidence(id!),
    enabled: Boolean(id),
  });
}

export function useIncidentSummary() {
  return useQuery({
    queryKey: queryKeys.incidentSummary(),
    queryFn: () => incidentsApi.summary(),
    staleTime: 10_000,
    refetchInterval: 25_000,
  });
}

export function useUpdateIncidentStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: IncidentStatus) => incidentsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.incidentDetail(id) });
    },
  });
}

export function useAssignIncident(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignedTo: string) => incidentsApi.assign(id, assignedTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.incidentDetail(id) });
    },
  });
}

export function useAddIncidentNote(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => incidentsApi.addNote(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidentDetail(id) });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}

export function useEscalateToIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => incidentsApi.escalateToIncident(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['threat-summary'] });
    },
  });
}
