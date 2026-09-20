import type { ScanPhase, WebScanResult } from '@/types/websecurity';
import { apiRequest, ENDPOINTS, USE_MOCK } from './api';
import { guardFailures, simulateLatency } from './mockApi';
import { REFERENCE_FINDINGS, REFERENCE_HEADERS, REFERENCE_WEB_SCAN, WEB_SCAN_STEPS } from '@/data/mock';
import { parseTargetUrl } from '@/utils/urlAnalysis';
import { seededRandom, intBetween } from '@/utils/random';

/** Ordered pipeline stages the UI animates through during a scan. */
export const SCAN_PIPELINE: Array<{ phase: ScanPhase; label: string; durationMs: number }> = [
  { phase: 'initializing', label: 'Initializing', durationMs: 800 },
  { phase: 'configuration', label: 'Checking configuration', durationMs: 1200 },
  { phase: 'headers', label: 'Checking security headers', durationMs: 1300 },
  { phase: 'cookies', label: 'Analyzing cookies', durationMs: 1100 },
  { phase: 'content', label: 'Reviewing content exposure', durationMs: 1000 },
  { phase: 'findings', label: 'Generating findings', durationMs: 900 },
];

export interface ScanAuthorization {
  ok: boolean;
  reason?: string;
  token?: string;
  target?: string;
}

/**
 * Authorization gate. Scanning is only ever presented for hosts the operator
 * asserts they own or are contracted to test. The frontend performs no probing
 * itself — this validates intent and records an authorization token that the
 * backend will verify against its own scope registry.
 */
export function validateScanAuthorization(rawTarget: string, authorization: string): ScanAuthorization {
  const parsed = parseTargetUrl(rawTarget);
  if (!parsed.ok) return { ok: false, reason: parsed.reason };
  if (parsed.isIpHost) {
    return { ok: false, reason: 'Raw IP targets are rejected. Supply a hostname that appears in your authorized scope.' };
  }
  const trimmed = authorization.trim();
  if (!trimmed) {
    return { ok: false, reason: 'An authorization reference is required. Scans only run against systems you own or are contracted to test.' };
  }
  if (trimmed.length < 6) {
    return { ok: false, reason: 'Authorization reference looks incomplete (minimum 6 characters).' };
  }
  const reserved = /\.(example|test|invalid|localhost|example\.com|example\.org|example\.net)$/i.test(parsed.domain)
    || parsed.domain.endsWith('.example.test');
  if (!reserved && !/^AUTHZ-/i.test(trimmed)) {
    return {
      ok: false,
      reason: `Target "${parsed.domain}" is outside the documented demo scope. In this build only reserved example domains (.example, .test) may be scanned. A live deployment validates scope server-side against your signed authorization.`,
    };
  }
  return { ok: true, token: /^AUTHZ-/i.test(trimmed) ? trimmed.toUpperCase() : `AUTHZ-${trimmed.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) || 'DEMO'}`, target: parsed.href };
}

export const webSecurityApi = {
  async previousScan(): Promise<WebScanResult> {
    if (!USE_MOCK) return apiRequest(`${ENDPOINTS.webSecurityScan}/latest`);
    await guardFailures(ENDPOINTS.webSecurityScan);
    await simulateLatency(160, 380);
    return REFERENCE_WEB_SCAN;
  },

  /**
   * Produces a completed scan result for an authorized target.
   * Live mode: POST /api/web-security/scan then poll /api/web-security/scan/{id}.
   */
  async completeScan(target: string, token: string): Promise<WebScanResult> {
    if (!USE_MOCK) return apiRequest(ENDPOINTS.webSecurityScan, { method: 'POST', body: { target, token } });
    await simulateLatency(400, 800);

    const rng = seededRandom(`scan:${target}:${token}`);
    // Deterministic-but-target-sensitive finding set derived from the reference corpus.
    const selected = REFERENCE_FINDINGS.filter(() => rng() > 0.22);
    const findings = (selected.length ? selected : REFERENCE_FINDINGS.slice(0, 4)).map((f, i) => ({
      ...f,
      id: `FIND-${String(i + 1).padStart(2, '0')}`,
    }));

    const summary = {
      critical: findings.filter((f) => f.severity === 'critical').length,
      high: findings.filter((f) => f.severity === 'high').length,
      medium: findings.filter((f) => f.severity === 'medium').length,
      low: findings.filter((f) => f.severity === 'low').length,
      pass: intBetween(rng, 22, 38),
    };

    return {
      ...REFERENCE_WEB_SCAN,
      id: `SCAN-${intBetween(rng, 1000, 9999)}`,
      target,
      authorizationToken: token,
      startedAt: new Date(Date.now() - 6_500).toISOString(),
      completedAt: new Date().toISOString(),
      status: 'complete',
      scope: [target, `${target.replace(/\/$/, '')}/api/*`],
      summary,
      findings,
      headers: REFERENCE_HEADERS,
      scanSteps: WEB_SCAN_STEPS.map((s) => ({
        ...s,
        state: s.label === 'Checking security headers' && summary.high > 0 ? 'warning' : 'ok',
      })),
    };
  },
};
