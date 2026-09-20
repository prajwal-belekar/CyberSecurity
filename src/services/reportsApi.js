import { apiRequest, ENDPOINTS, USE_MOCK } from './api';
import { guardFailures, simulateLatency } from './mockApi';
import { REPORTS, REPORT_TYPE_META } from '@/data/mock';
import { intBetween, seededRandom } from '@/utils/random';
let store = [...REPORTS];
export const reportsApi = {
    typeMeta: REPORT_TYPE_META,
    async list(type) {
        if (!USE_MOCK)
            return apiRequest(ENDPOINTS.reports, { query: { type } });
        await guardFailures(ENDPOINTS.reports);
        await simulateLatency();
        const sorted = [...store].sort((a, b) => +new Date(b.generatedAt) - +new Date(a.generatedAt));
        return !type || type === 'all' ? sorted : sorted.filter((r) => r.type === type);
    },
    async byId(id) {
        if (!USE_MOCK)
            return apiRequest(`${ENDPOINTS.reports}/${id}`);
        await simulateLatency(90, 220);
        return store.find((r) => r.id === id);
    },
    /**
     * Mocked generation: registers the report as `generating`, then resolves it.
     * Live mode POSTs to /api/reports/generate and the backend renders the file.
     */
    async generate(request) {
        if (!USE_MOCK)
            return apiRequest(ENDPOINTS.reportsGenerate, { method: 'POST', body: request });
        await guardFailures(ENDPOINTS.reportsGenerate);
        const meta = REPORT_TYPE_META[request.type];
        const id = `RPT-${String(149 + store.length).padStart(4, '0')}`;
        const now = new Date().toISOString();
        const pending = {
            id,
            title: `${meta.label} — ${new Date(request.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
            type: request.type,
            status: 'generating',
            generatedAt: now,
            periodStart: request.periodStart,
            periodEnd: request.periodEnd,
            generatedBy: 'a.reyes',
            format: request.format,
            classification: request.classification,
            summary: 'Report generation in progress — collecting events, incidents and indicators for the selected period.',
            relatedIncidentIds: [],
            sections: [],
        };
        store = [pending, ...store];
        await simulateLatency(1_600, 2_600);
        const rng = seededRandom(`report:${id}`);
        const completed = {
            ...pending,
            status: 'ready',
            sizeKb: intBetween(rng, 120, 1_400),
            summary: `Generated ${meta.label.toLowerCase()} covering ${new Date(request.periodStart).toLocaleDateString()} → ${new Date(request.periodEnd).toLocaleDateString()}.`,
            relatedIncidentIds: request.includeIncidents ? ['INC-2048', 'INC-2047'] : [],
            sections: [
                {
                    heading: 'Scope',
                    body: `This ${meta.label.toLowerCase()} covers all monitored assets and detection channels between ${new Date(request.periodStart).toISOString().slice(0, 10)} and ${new Date(request.periodEnd).toISOString().slice(0, 10)}. Classification: ${request.classification}.`,
                    metrics: [
                        { label: 'Events in scope', value: String(intBetween(rng, 280, 4_800)) },
                        { label: 'Incidents in scope', value: String(intBetween(rng, 1, 12)) },
                        { label: 'Assets covered', value: '128' },
                    ],
                },
                {
                    heading: 'Key findings',
                    body: 'Automated credential access against the authentication service accounted for the largest share of confirmed detections. One endpoint (WORKSTATION-07) is associated with both brute-force source activity and an unverified egress transfer to a known indicator.',
                    metrics: [
                        { label: 'Critical findings', value: String(intBetween(rng, 0, 4)) },
                        { label: 'High findings', value: String(intBetween(rng, 3, 18)) },
                        { label: 'Containment rate', value: '94%' },
                    ],
                },
                {
                    heading: 'Actions taken',
                    body: 'Account lockout enforced automatically, source added to the temporary deny list, indicator published to the intelligence store and the affected endpoint isolated pending forensic review.',
                },
                {
                    heading: 'Recommendations',
                    body: 'Complete MFA re-enrollment for targeted accounts, review 24 hours of NetFlow for the egress transfer, and remediate the missing Content-Security-Policy on the public application endpoint.',
                },
            ],
        };
        store = store.map((r) => (r.id === id ? completed : r));
        return completed;
    },
    /**
     * The frontend cannot render a real PDF/CSV without a backend, so download
     * produces a structured JSON representation of the same report object.
     */
    buildDownload(report) {
        const payload = {
            generator: 'CyberSentinel',
            generatedAt: new Date().toISOString(),
            note: 'Mock export — the FastAPI backend will render the native PDF/CSV artefact.',
            report,
        };
        return {
            filename: `${report.id}-${report.type}.json`,
            blob: new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
        };
    },
};
