import type { PhishingAnalysis, PhishingScanRecord } from '@/types/phishing';
import { apiRequest, ENDPOINTS, USE_MOCK } from './api';
import { guardFailures, mockStore, simulateLatency } from './mockApi';
import { buildIndicatorSet } from '@/data/mock/phishing';
import {
  extractFeatures, parseTargetUrl, registrationFor, scoreFromFeatures,
  severityFromScore, verdictFromScore,
} from '@/utils/urlAnalysis';

export interface AnalyzeUrlResult {
  ok: boolean;
  reason?: string;
  analysis?: PhishingAnalysis;
}

export const phishingApi = {
  async history(): Promise<PhishingScanRecord[]> {
    if (!USE_MOCK) return apiRequest(ENDPOINTS.phishingHistory);
    await guardFailures(ENDPOINTS.phishingHistory);
    await simulateLatency();
    return [...mockStore.phishingScans].sort(
      (a, b) => +new Date(b.scannedAt) - +new Date(a.scannedAt),
    );
  },

  /**
   * Mock URL analysis. The frontend never contacts the submitted target —
   * it parses the string locally and returns the deterministic verdict a real
   * backend analyzer would produce. Live mode POSTs to /api/phishing/analyze.
   */
  async analyze(rawUrl: string): Promise<AnalyzeUrlResult> {
    if (!USE_MOCK) {
      return apiRequest(ENDPOINTS.phishingAnalyze, { method: 'POST', body: { url: rawUrl } });
    }
    await guardFailures(ENDPOINTS.phishingAnalyze);

    const parsed = parseTargetUrl(rawUrl);
    if (!parsed.ok) {
      await simulateLatency(120, 260);
      return { ok: false, reason: parsed.reason };
    }

    // Simulate the multi-stage recon pipeline the UI animates through.
    await simulateLatency(1_100, 1_700);

    const features = extractFeatures(parsed);
    const registration = registrationFor(parsed.hostname);
    features.domainAgeDays = registration.domainAgeDays;

    const riskScore = scoreFromFeatures(features);
    const verdict = verdictFromScore(riskScore);
    const severity = severityFromScore(riskScore);
    const indicators = buildIndicatorSet(parsed.href, features);
    const now = new Date().toISOString();

    const analysis: PhishingAnalysis = {
      id: `PHI-${Date.now().toString().slice(-6)}`,
      url: parsed.href,
      analyzedAt: now,
      riskScore,
      verdict,
      severity,
      confidence: Math.min(0.99, 0.55 + riskScore / 200 + features.reputationHits * 0.08),
      urlInfo: {
        protocol: parsed.protocol,
        domain: parsed.domain,
        subdomain: parsed.subdomain,
        tld: parsed.tld,
        path: parsed.path,
        query: parsed.query,
        length: parsed.length,
        domainAge: `${registration.domainAgeDays} days`,
        registrar: registration.registrar,
      },
      certificate: {
        issuer: features.certIssuer,
        valid: parsed.protocol === 'https:',
        expiresAt: new Date(Date.now() + 86_400_000 * (30 + (registration.domainAgeDays % 300))).toISOString().slice(0, 10),
        daysRemaining: 30 + (registration.domainAgeDays % 300),
        evValidated: features.certIssuer.includes('(OV)'),
      },
      indicators,
      scanSteps: [
        { index: 1, label: 'Parsing URL', state: 'ok' },
        { index: 2, label: 'Domain analysis', state: features.domainAgeDays < 30 ? 'warning' : 'ok' },
        { index: 3, label: 'SSL inspection', state: parsed.protocol === 'https:' ? 'ok' : 'fail' },
        { index: 4, label: 'URL structure', state: parsed.subdomainDepth > 2 || parsed.isIpHost ? 'warning' : 'ok' },
        { index: 5, label: 'Reputation analysis', state: features.reputationHits > 0 ? 'warning' : 'ok' },
        { index: 6, label: 'Risk calculation', state: 'ok' },
      ],
      brandImpersonated: features.lookalikeBrand,
      recommendation:
        riskScore >= 60
          ? 'Treat as hostile. Block the domain at the resolver and mail gateway, notify any user who interacted with it, and check for credential reuse.'
          : riskScore >= 35
            ? 'Monitor. Add the domain to the observation list and re-analyze if user reports increase.'
            : 'No action required. The target presents no phishing indicators in the connected data sources.',
      relatedThreatIds: features.reputationHits > 0 ? ['THR-1043'] : [],
    };

    mockStore.phishingScans = [
      {
        id: analysis.id, url: analysis.url, domain: parsed.domain, scannedAt: now,
        riskScore, verdict, severity, scannedBy: 'a.reyes',
      },
      ...mockStore.phishingScans,
    ].slice(0, 40);

    if (riskScore >= 60) {
      mockStore.pushNotification({
        id: `NTF-${Date.now()}`, kind: 'threat', severity,
        title: `Phishing analysis — ${verdict.toUpperCase()}`,
        description: `${parsed.domain} scored ${riskScore}/100.`,
        timestamp: now, read: false, href: '/phishing', actionLabel: 'Open analyzer',
      });
    }

    return { ok: true, analysis };
  },
};
