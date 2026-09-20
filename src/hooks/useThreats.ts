import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ThreatFilters } from '@/types/threat';
import type { TimeRange } from '@/types/common';
import { threatsApi } from '@/services/threatsApi';
import { queryKeys } from '@/services/queryKeys';

export function useThreats(filters: ThreatFilters = {}) {
  return useQuery({
    queryKey: queryKeys.threats(filters),
    queryFn: () => threatsApi.list(filters),
    staleTime: 10_000,
  });
}

export function useThreat(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.threatDetail(id ?? 'none'),
    queryFn: () => threatsApi.byId(id!),
    enabled: Boolean(id),
  });
}

export function useThreatActivity(range: TimeRange = '24H') {
  return useQuery({
    queryKey: queryKeys.threatActivity(range),
    queryFn: () => threatsApi.activity(range),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useUpdateThreatStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Parameters<typeof threatsApi.updateStatus>[1] }) =>
      threatsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      queryClient.invalidateQueries({ queryKey: ['threat-summary'] });
    },
  });
}
