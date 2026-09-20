import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/services/notificationsApi';
import { queryKeys } from '@/services/queryKeys';
import { mockStore } from '@/services/mockApi';
export function useNotifications() {
    const query = useQuery({
        queryKey: queryKeys.notifications(),
        queryFn: () => notificationsApi.list(),
        staleTime: 8_000,
    });
    const unread = query.data?.filter((n) => !n.read).length ?? mockStore.notifications.filter((n) => !n.read).length;
    return { ...query, unread };
}
export function useMarkNotificationRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => notificationsApi.markRead(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications() }),
    });
}
export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => notificationsApi.markAllRead(),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications() }),
    });
}
