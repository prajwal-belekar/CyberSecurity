import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { incidentsApi } from '@/services/incidentsApi';
import { queryKeys } from '@/services/queryKeys';
export function useIncidents(status = 'all') {
    return useQuery({
        queryKey: queryKeys.incidents(status),
        queryFn: () => incidentsApi.list(status),
        staleTime: 10_000,
    });
}
export function useIncident(id) {
    return useQuery({
        queryKey: queryKeys.incidentDetail(id ?? 'none'),
        queryFn: () => incidentsApi.byId(id),
        enabled: Boolean(id),
    });
}
export function useIncidentEvidence(id) {
    return useQuery({
        queryKey: queryKeys.incidentEvidence(id ?? 'none'),
        queryFn: () => incidentsApi.evidence(id),
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
export function useUpdateIncidentStatus(id) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (status) => incidentsApi.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.incidentDetail(id) });
        },
    });
}
export function useAssignIncident(id) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (assignedTo) => incidentsApi.assign(id, assignedTo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.incidentDetail(id) });
        },
    });
}
export function useAddIncidentNote(id) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body) => incidentsApi.addNote(id, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.incidentDetail(id) });
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
        },
    });
}
export function useEscalateToIncident() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (eventId) => incidentsApi.escalateToIncident(eventId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['threat-summary'] });
        },
    });
}
