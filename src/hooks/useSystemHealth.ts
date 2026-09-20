import { useQuery } from '@tanstack/react-query';
import { systemApi } from '@/services/systemApi';
import { queryKeys } from '@/services/queryKeys';

export function useSystemHealth() {
  return useQuery({
    queryKey: queryKeys.systemHealth(),
    queryFn: () => systemApi.health(),
    staleTime: 60_000,
  });
}
