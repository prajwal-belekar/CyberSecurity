import type { PhishingAnalysis, PhishingScanRecord, UrlIndicator } from '@/types/phishing';
import type { PhishingFeatures } from '@/types/phishing';
export type { PhishingFeatures };
import { daysAgo, hoursAgo, minutesAgo } from '@/utils/dates';

export const PHISHING_SCAN_HISTORY: PhishingScanRecord[] = [
  { id: 'PHI-2291', url: 'https://secure-microsoft-login.example.test/auth/verify?id=8842', domain: 'secure-microsoft-login.example.test', scannedAt: minutesAgo(11), riskScore: 82, verdict: 'phishing', severity: 'high', scannedBy: 'a.reyes' },
  { id: 'PHI-2290', url: 'http://invoice-payment-portal.example.test/docusign/review', domain: 'invoice-payment-portal.example.test', scannedAt: hoursAgo(3), riskScore: 91, verdict: 'malicious', severity: 'critical', scannedBy: 'j.lindqvist' },
  { id: 'PHI-2289', url: 'https://corp-vpn.example.test/portal', domain: 'corp-vpn.example.test', scannedAt: hoursAgo(7), riskScore: 12, verdict: 'safe', severity: 'low', scannedBy: 'k.nakamura' },
  { id: 'PHI-2288', url: 'https://bit.ly/3xKp9aQ', domain: 'bit.ly', scannedAt: hoursAgo(11), riskScore: 47, verdict: 'suspicious', severity: 'medium', scannedBy: 'm.okafor' },
  { id: 'PHI-2287', url: 'http://192.0.2.141/admin/login.php', domain: '192.0.2.141', scannedAt: daysAgo(1), riskScore: 74, verdict: 'phishing', severity: 'high', scannedBy: 'a.reyes' },
  { id: 'PHI-2286', url: 'https://payroll-update.corp.example.test/self-service', domain: 'payroll-update.corp.example.test', scannedAt: daysAgo(1), riskScore: 8, verdict: 'safe', severity: 'info', scannedBy: 'd.mensah' },
  { id: 'PHI-2285', url: 'https://support-refund.example.test/ticket/99123', domain: 'support-refund.example.test', scannedAt: daysAgo(2), riskScore: 66, verdict: 'suspicious', severity: 'medium', scannedBy: 'j.lindqvist' },
  { id: 'PHI-2284', url: 'https://github.com', domain: 'github.com', scannedAt: daysAgo(3), riskScore: 2, verdict: 'safe', severity: 'info', scannedBy: 'k.nakamura' },
];

/**
 * The deterministic analyzer used by the mock service. Real analysis will move
 * to the FastAPI backend (`POST /api/phishing/analyze`); the scoring contract
 * stays identical so the UI does not change.
 */
export function buildIndicatorSet(_url: string, features: PhishingFeatures): UrlIndicator[] {
  return [
    { id: 'ind-domain-age', label: 'Domain age', detail: features.domainAgeDays < 30 ? `Registered ${features.domainAgeDays} days ago — very young domain` : `Registered ${features.domainAgeDays} days ago`, weight: features.domainAgeDays < 30 ? 22 : 0, severity: features.domainAgeDays < 30 ? 'high' : 'info', detected: features.domainAgeDays < 30 },
    { id: 'ind-lookalike', label: 'Brand impersonation', detail: features.lookalikeBrand ? `Hostname mimics "${features.lookalikeBrand}"` : 'No known brand strings detected in the hostname', weight: features.lookalikeBrand ? 24 : 0, severity: features.lookalikeBrand ? 'critical' : 'info', detected: Boolean(features.lookalikeBrand) },
    { id: 'ind-subdomain-depth', label: 'Unusual URL structure', detail: features.subdomainDepth > 2 ? `${features.subdomainDepth} label levels — deep subdomain chain` : 'Hostname depth is normal', weight: features.subdomainDepth > 2 ? 12 : 0, severity: features.subdomainDepth > 2 ? 'medium' : 'info', detected: features.subdomainDepth > 2 },
    { id: 'ind-insecure-proto', label: 'Insecure protocol', detail: features.protocol === 'http:' ? 'Credentials would be transmitted in cleartext' : 'HTTPS transport in use', weight: features.protocol === 'http:' ? 16 : 0, severity: features.protocol === 'http:' ? 'high' : 'info', detected: features.protocol === 'http:' },
    { id: 'ind-login-form', label: 'Login page indicators', detail: features.hasLoginForm ? 'Password field and credential POST target detected' : 'No credential capture form detected', weight: features.hasLoginForm ? 18 : 0, severity: features.hasLoginForm ? 'high' : 'info', detected: features.hasLoginForm },
    { id: 'ind-url-length', label: 'URL length / entropy', detail: features.length > 78 ? `${features.length} characters with high-entropy query string` : `${features.length} characters — within normal range`, weight: features.length > 78 ? 8 : 0, severity: features.length > 78 ? 'medium' : 'info', detected: features.length > 78 },
    { id: 'ind-ip-host', label: 'IP address as hostname', detail: features.isIpHost ? 'Hostname is a raw IP address' : 'Hostname resolves to a registered domain', weight: features.isIpHost ? 20 : 0, severity: features.isIpHost ? 'high' : 'info', detected: features.isIpHost },
    { id: 'ind-redirects', label: 'Redirect chain', detail: features.redirects > 1 ? `${features.redirects} hops before the final destination` : 'Direct response, no redirect chain', weight: features.redirects > 1 ? 10 : 0, severity: features.redirects > 1 ? 'medium' : 'info', detected: features.redirects > 1 },
    { id: 'ind-cert', label: 'Certificate information', detail: features.certIssuer === 'Let\u2019s Encrypt (free DV)' ? 'Free DV certificate — no organizational validation' : `Issued by ${features.certIssuer}`, weight: features.certIssuer.startsWith('Let') ? 7 : 0, severity: features.certIssuer.startsWith('Let') ? 'low' : 'info', detected: features.certIssuer.startsWith('Let') },
    { id: 'ind-reputation', label: 'Reputation analysis', detail: features.reputationHits > 0 ? `Present in ${features.reputationHits} threat-intelligence feed(s)` : 'No reputation matches in connected feeds', weight: features.reputationHits * 14, severity: features.reputationHits > 0 ? 'high' : 'info', detected: features.reputationHits > 0 },
    { id: 'ind-suspicious-tld', label: 'Suspicious keywords', detail: features.suspiciousKeywords.length ? `Matched: ${features.suspiciousKeywords.join(', ')}` : 'No high-risk keywords in path or hostname', weight: features.suspiciousKeywords.length * 6, severity: features.suspiciousKeywords.length ? 'medium' : 'info', detected: features.suspiciousKeywords.length > 0 },
  ];
}

export const LAST_ANALYSIS: PhishingAnalysis = {
  id: 'PHI-2291',
  url: 'https://secure-microsoft-login.example.test/auth/verify?id=8842',
  analyzedAt: minutesAgo(11),
  riskScore: 82,
  verdict: 'phishing',
  severity: 'high',
  confidence: 0.88,
  urlInfo: {
    protocol: 'https:',
    domain: 'secure-microsoft-login.example.test',
    subdomain: 'secure-microsoft-login',
    tld: '.example.test',
    path: '/auth/verify',
    query: '?id=8842',
    length: 62,
    domainAge: '4 days',
    registrar: 'Unregistered — privacy protected',
  },
  certificate: {
    issuer: 'Let\u2019s Encrypt (free DV)',
    valid: true,
    expiresAt: '2026-12-14',
    daysRemaining: 86,
    evValidated: false,
  },
  indicators: buildIndicatorSet('https://secure-microsoft-login.example.test/auth/verify?id=8842', {
    protocol: 'https:',
    domain: 'secure-microsoft-login.example.test',
    tld: '.example.test',
    path: '/auth/verify',
    length: 62,
    domainAgeDays: 4,
    lookalikeBrand: 'Microsoft',
    subdomainDepth: 3,
    hasLoginForm: true,
    isIpHost: false,
    redirects: 2,
    certIssuer: 'Let\u2019s Encrypt (free DV)',
    reputationHits: 1,
    suspiciousKeywords: ['secure', 'login', 'verify', 'auth'],
  }),
  scanSteps: [
    { index: 1, label: 'Parsing URL', state: 'ok' },
    { index: 2, label: 'Domain analysis', state: 'ok' },
    { index: 3, label: 'SSL inspection', state: 'ok' },
    { index: 4, label: 'URL structure', state: 'warning' },
    { index: 5, label: 'Reputation analysis', state: 'warning' },
    { index: 6, label: 'Risk calculation', state: 'ok' },
  ],
  brandImpersonated: 'Microsoft',
  recommendation:
    'Block this domain at the DNS resolver and mail gateway, notify the reporting user, and check for credential reuse across the estate.',
  relatedThreatIds: ['THR-1043'],
};
