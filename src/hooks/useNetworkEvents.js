import { useQuery } from '@tanstack/react-query';
import { networkApi } from '@/services/networkApi';
import { queryKeys } from '@/services/queryKeys';
export function useNetworkTopology() {
    return useQuery({
        queryKey: queryKeys.networkTopology(),
        queryFn: () => networkApi.topology(),
        staleTime: 30_000,
    });
}
export function useNetworkSummary() {
    return useQuery({
        queryKey: queryKeys.networkSummary(),
        queryFn: () => networkApi.summary(),
        staleTime: 15_000,
        refetchInterval: 20_000,
    });
}
export function useNetworkEvents(query = {}) {
    return useQuery({
        queryKey: queryKeys.networkEvents(query),
        queryFn: () => networkApi.events(query),
        staleTime: 10_000,
        placeholderData: (previous) => previous,
    });
}
