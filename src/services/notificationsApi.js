import { apiRequest, ENDPOINTS, USE_MOCK } from './api';
import { mockStore, simulateLatency } from './mockApi';
import { NOTIFICATIONS } from '@/data/mock';
export const notificationsApi = {
    async list() {
        if (!USE_MOCK)
            return apiRequest(ENDPOINTS.notifications);
        await simulateLatency(80, 200);
        return mockStore.notifications.length ? mockStore.notifications : NOTIFICATIONS;
    },
    async markRead(id) {
        if (!USE_MOCK) {
            await apiRequest(`${ENDPOINTS.notifications}/${id}/read`, { method: 'POST' });
            return;
        }
        await simulateLatency(40, 120);
        mockStore.markNotificationRead(id);
    },
    async markAllRead() {
        if (!USE_MOCK) {
            await apiRequest(`${ENDPOINTS.notifications}/read`, { method: 'POST' });
            return;
        }
        await simulateLatency(60, 160);
        mockStore.markAllNotificationsRead();
    },
};
