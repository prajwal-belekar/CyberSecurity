/**
 * Transport layer.
 *
 * Every domain service decides between the in-browser mock implementation and a
 * real HTTP call to the future FastAPI backend using `USE_MOCK`. Endpoint paths
 * below are the exact routes the backend is expected to expose, so flipping
 * VITE_API_MODE=live is the only change required to go live.
 *
 * No secrets are ever stored in the frontend — the base URL comes from
 * environment variables and authentication is delegated to the backend session.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
export const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT ?? 15_000);
export const API_MODE = import.meta.env.VITE_API_MODE ?? 'mock';
export const USE_MOCK = API_MODE !== 'live';
/** Contract shared by the mock layer and the real backend. */
export const ENDPOINTS = {
    events: '/events',
    threats: '/threats',
    incidents: '/incidents',
    networkEvents: '/network/events',
    networkTopology: '/network/topology',
    networkSummary: '/network/summary',
    authEvents: '/authentication/events',
    authSummary: '/authentication/summary',
    authSequences: '/authentication/sequences',
    phishingAnalyze: '/phishing/analyze',
    phishingHistory: '/phishing/scans',
    webSecurityScan: '/web-security/scan',
    webSecurityStatus: '/web-security/scan/{id}',
    malwareAnalyze: '/malware/analyze',
    intelligence: '/threat-intelligence',
    analytics: '/analytics',
    reports: '/reports',
    reportsGenerate: '/reports/generate',
    aiInvestigate: '/ai/investigate',
    notifications: '/notifications',
    systemHealth: '/system/health',
    systemMetrics: '/system/metrics',
};
export class ApiError extends Error {
    status;
    endpoint;
    hint;
    constructor(message, status = 503, endpoint = '', hint) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.endpoint = endpoint;
        this.hint = hint;
    }
}
function buildUrl(path, query) {
    const url = `${API_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
    if (!query)
        return url;
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '')
            params.set(key, String(value));
    });
    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
}
/**
 * Thin fetch wrapper used by every live-mode call: adds timeout handling,
 * JSON (de)serialisation and normalised ApiError reporting.
 */
export async function apiRequest(path, options = {}) {
    const { body, query, timeoutMs = API_TIMEOUT_MS, headers, ...init } = options;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(buildUrl(path, query), {
            ...init,
            headers: {
                Accept: 'application/json',
                ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
                ...headers,
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });
        if (!response.ok) {
            throw new ApiError(`Request to ${path} failed with status ${response.status}`, response.status, path, response.status === 401 || response.status === 403
                ? 'The backend rejected this session. Re-authenticate and retry.'
                : undefined);
        }
        if (response.status === 204)
            return undefined;
        return (await response.json());
    }
    catch (error) {
        if (error instanceof ApiError)
            throw error;
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new ApiError(`Request to ${path} timed out after ${timeoutMs}ms`, 408, path);
        }
        throw new ApiError('The security data service could not be reached.', 503, path, 'Confirm the FastAPI backend is running and VITE_API_BASE_URL is correct.');
    }
    finally {
        clearTimeout(timer);
    }
}
