import { apiRequest, ENDPOINTS, USE_MOCK } from './api';
import { guardFailures, mockStore, simulateLatency } from './mockApi';
import { INCIDENT_SUMMARY } from '@/data/mock';
import { formatClockShort } from '@/utils/dates';
function recomputeSummary() {
    const counts = mockStore.incidents.reduce((acc, i) => ({ ...acc, [i.status]: (acc[i.status] ?? 0) + 1 }), {});
    return {
        open: counts.open ?? 0,
        investigating: counts.investigating ?? 0,
        contained: counts.contained ?? 0,
        resolved: counts.resolved ?? 0,
        false_positive: counts.false_positive ?? 0,
        total: mockStore.incidents.length,
        mttrHours: INCIDENT_SUMMARY.mttrHours,
        slaBreaches: INCIDENT_SUMMARY.slaBreaches,
    };
}
export const incidentsApi = {
    async list(status) {
        if (!USE_MOCK)
            return apiRequest(ENDPOINTS.incidents, { query: { status } });
        await guardFailures(ENDPOINTS.incidents);
        await simulateLatency();
        const all = [...mockStore.incidents].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        return !status || status === 'all' ? all : all.filter((i) => i.status === status);
    },
    async byId(id) {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.incidents}/${id}`);
        await simulateLatency(100, 260);
        return mockStore.incidents.find((i) => i.id === id);
    },
    async evidence(id) {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.incidents}/${id}/evidence`);
        await simulateLatency(120, 300);
        const incident = mockStore.incidents.find((i) => i.id === id);
        if (!incident)
            return [];
        const byId = new Map(mockStore.events.map((e) => [e.id, e]));
        const linked = incident.evidenceEventIds
            .map((eid) => byId.get(eid))
            .filter((e) => Boolean(e));
        const byIncident = mockStore.events.filter((e) => e.incidentId === id && !incident.evidenceEventIds.includes(e.id));
        return [...linked, ...byIncident].sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
    },
    async summary() {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.incidents}/summary`);
        await simulateLatency(70, 180);
        return recomputeSummary();
    },
    async updateStatus(id, status, actor = 'a.reyes') {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.incidents}/${id}`, { method: 'PATCH', body: { status } });
        await simulateLatency(140, 340);
        const entry = {
            id: `tl-${Date.now()}`,
            time: formatClockShort(new Date()),
            timestamp: new Date().toISOString(),
            title: `Status changed to ${status.replace('_', ' ').toUpperCase()}`,
            kind: status === 'resolved' || status === 'false_positive' ? 'resolution' : 'action',
            actor,
        };
        const incident = mockStore.incidents.find((i) => i.id === id);
        return mockStore.updateIncident(id, {
            status,
            resolvedAt: status === 'resolved' ? new Date().toISOString() : incident?.resolvedAt,
            timeline: [...(incident?.timeline ?? []), entry],
        });
    },
    async assign(id, assignedTo, actor = 'a.reyes') {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.incidents}/${id}/assign`, { method: 'POST', body: { assignedTo } });
        await simulateLatency(140, 320);
        const incident = mockStore.incidents.find((i) => i.id === id);
        const entry = {
            id: `tl-${Date.now()}`,
            time: formatClockShort(new Date()),
            timestamp: new Date().toISOString(),
            title: `Assigned to ${assignedTo}`,
            kind: 'action',
            actor,
        };
        return mockStore.updateIncident(id, {
            assignedTo,
            timeline: [...(incident?.timeline ?? []), entry],
        });
    },
    async addNote(id, body, author = 'a.reyes') {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.incidents}/${id}/notes`, { method: 'POST', body: { body } });
        await simulateLatency(160, 380);
        const incident = mockStore.incidents.find((i) => i.id === id);
        if (!incident)
            return undefined;
        const note = { id: `note-${Date.now()}`, author, timestamp: new Date().toISOString(), body };
        const entry = {
            id: `tl-${Date.now()}`,
            time: formatClockShort(new Date()),
            timestamp: new Date().toISOString(),
            title: 'Analyst note added',
            detail: body.slice(0, 140),
            kind: 'note',
            actor: author,
        };
        return mockStore.updateIncident(id, {
            notes: [...incident.notes, note],
            timeline: [...incident.timeline, entry],
        });
    },
    async escalateToIncident(eventId) {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.incidents}/from-event`, { method: 'POST', body: { eventId } });
        await simulateLatency(200, 460);
        const event = mockStore.events.find((e) => e.id === eventId);
        if (!event)
            return undefined;
        if (event.incidentId)
            return { incidentId: event.incidentId };
        const nextNumber = 2048 + mockStore.incidents.filter((i) => i.id.startsWith('INC-20')).length;
        const id = `INC-${nextNumber}`;
        const now = new Date().toISOString();
        const incident = {
            id,
            title: event.type,
            severity: event.severity === 'info' ? 'low' : event.severity,
            priority: event.severity === 'critical' ? 'p1' : event.severity === 'high' ? 'p2' : 'p3',
            status: 'open',
            type: event.threatId
                ? (mockStore.threats.find((t) => t.id === event.threatId)?.type ?? 'auth_anomaly')
                : 'auth_anomaly',
            source: event.source,
            target: event.target ?? 'unspecified',
            createdAt: now,
            updatedAt: now,
            summary: event.description ?? `Incident raised manually from event ${event.id}.`,
            impact: 'Assessment pending — analyst triage required.',
            tags: ['manually-created'],
            timeline: [{
                    id: `tl-${Date.now()}`, time: formatClockShort(now), timestamp: now,
                    title: 'Incident created from security event', detail: `${event.id} · ${event.type}`,
                    kind: 'system', actor: 'a.reyes',
                }],
            evidenceEventIds: [event.id],
            affectedAssets: [],
            notes: [],
        };
        mockStore.incidents = [incident, ...mockStore.incidents];
        mockStore.emit('incident', incident);
        mockStore.events = mockStore.events.map((e) => (e.id === eventId ? { ...e, incidentId: id, status: 'investigating' } : e));
        mockStore.pushNotification({
            id: `NTF-${Date.now()}`, kind: 'incident', severity: incident.severity,
            title: 'New incident created', description: `${id} · ${incident.title} raised from ${event.id}.`,
            timestamp: now, read: false, href: `/incidents/${id}`, actionLabel: 'Open incident',
        });
        return { incidentId: id };
    },
};
