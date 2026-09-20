/**
 * Deterministic URL feature extraction for the phishing detector.
 *
 * This is *presentation logic only* — it parses a string the analyst typed and
 * derives the signals the mock scorer needs. No network request is made and no
 * target is contacted. Real analysis (reputation lookups, SSL inspection,
 * rendering) belongs to the FastAPI backend.
 */
import { hashString, seededRandom, intBetween } from '@/utils/random';
const BRAND_TERMS = [
    'microsoft', 'google', 'apple', 'amazon', 'netflix', 'paypal', 'docusign',
    'dropbox', 'adobe', 'chase', 'wellsfargo', 'hsbc', 'linkedin', 'facebook',
    'instagram', 'whatsapp', 'outlook', 'office365', 'icloud', 'spotify',
];
const SUSPICIOUS_KEYWORDS = [
    'secure', 'security', 'verify', 'verification', 'account', 'login', 'signin',
    'sign-in', 'update', 'billing', 'invoice', 'payment', 'refund', 'support',
    'confirm', 'password', 'credential', 'wallet', 'recovery', 'suspended',
];
const IP_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;
export function parseTargetUrl(raw) {
    const trimmed = raw.trim();
    if (!trimmed) {
        return { ok: false, reason: 'No target supplied.', href: '', protocol: '', hostname: '', domain: '', tld: '', path: '', length: 0, subdomainDepth: 0, isIpHost: false };
    }
    const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
        const url = new URL(withProtocol);
        if (!['http:', 'https:'].includes(url.protocol)) {
            return { ok: false, reason: `Unsupported scheme "${url.protocol}" — only http and https can be analyzed.`, href: trimmed, protocol: url.protocol, hostname: url.hostname, domain: url.hostname, tld: '', path: url.pathname, length: trimmed.length, subdomainDepth: 0, isIpHost: false };
        }
        const labels = url.hostname.split('.').filter(Boolean);
        const isIp = IP_PATTERN.test(url.hostname);
        const domain = isIp ? url.hostname : labels.slice(-2).join('.');
        const subdomain = labels.length > 2 ? labels.slice(0, -2).join('.') : undefined;
        const tld = isIp ? '' : `.${labels.slice(-1)[0] ?? ''}`;
        return {
            ok: true,
            href: url.href,
            protocol: url.protocol,
            hostname: url.hostname,
            domain,
            subdomain,
            tld,
            path: url.pathname,
            query: url.search || undefined,
            length: url.href.length,
            subdomainDepth: labels.length,
            isIpHost: isIp,
        };
    }
    catch {
        return { ok: false, reason: 'Could not parse the target as a valid URL.', href: trimmed, protocol: '', hostname: '', domain: '', tld: '', path: '', length: trimmed.length, subdomainDepth: 0, isIpHost: false };
    }
}
/** Derives the feature vector fed to the mock risk scorer. */
export function extractFeatures(parsed) {
    const rng = seededRandom(parsed.href);
    const lowerHost = parsed.hostname.toLowerCase();
    const lowerPath = parsed.path.toLowerCase();
    const combined = `${lowerHost}${lowerPath}`;
    const lookalikeBrand = BRAND_TERMS.find((brand) => {
        if (!combined.includes(brand))
            return false;
        // An exact registrable-domain match for a known brand is not impersonation.
        return parsed.domain.split('.')[0] !== brand;
    });
    const suspiciousKeywords = Array.from(new Set(SUSPICIOUS_KEYWORDS.filter((k) => combined.includes(k)))).slice(0, 5);
    const hasLoginForm = /login|signin|sign-in|auth|verify|account|password|portal/i.test(combined);
    return {
        protocol: parsed.protocol,
        domain: parsed.domain,
        subdomain: parsed.subdomain,
        tld: parsed.tld,
        path: parsed.path,
        query: parsed.query,
        length: parsed.length,
        domainAgeDays: intBetween(rng, 1, 900),
        lookalikeBrand,
        subdomainDepth: parsed.subdomainDepth,
        hasLoginForm,
        isIpHost: parsed.isIpHost,
        redirects: intBetween(rng, 0, 3),
        certIssuer: parsed.protocol === 'https:'
            ? (rng() > 0.55 ? 'Let\u2019s Encrypt (free DV)' : 'Example Test CA (OV)')
            : 'Not applicable — cleartext HTTP',
        reputationHits: combined.includes('example.test') && (lookalikeBrand || suspiciousKeywords.length > 1) ? intBetween(rng, 1, 2) : rng() > 0.85 ? 1 : 0,
        suspiciousKeywords,
    };
}
export function scoreFromFeatures(features) {
    let score = 0;
    if (features.domainAgeDays < 7)
        score += 22;
    else if (features.domainAgeDays < 30)
        score += 16;
    else if (features.domainAgeDays < 90)
        score += 6;
    if (features.lookalikeBrand)
        score += 24;
    if (features.subdomainDepth > 3)
        score += 12;
    else if (features.subdomainDepth > 2)
        score += 7;
    if (features.protocol === 'http:')
        score += 16;
    if (features.hasLoginForm)
        score += 14;
    if (features.isIpHost)
        score += 20;
    if (features.length > 90)
        score += 8;
    else if (features.length > 70)
        score += 4;
    if (features.redirects > 1)
        score += 10;
    if (features.certIssuer.startsWith('Let'))
        score += 6;
    score += features.reputationHits * 14;
    score += features.suspiciousKeywords.length * 5;
    return Math.max(1, Math.min(99, score));
}
export function verdictFromScore(score) {
    if (score >= 80)
        return 'malicious';
    if (score >= 60)
        return 'phishing';
    if (score >= 35)
        return 'suspicious';
    return 'safe';
}
export function severityFromScore(score) {
    if (score >= 80)
        return 'critical';
    if (score >= 60)
        return 'high';
    if (score >= 35)
        return 'medium';
    if (score >= 15)
        return 'low';
    return 'info';
}
/** Stable pseudo-registration data so repeated analyses of a URL agree. */
export function registrationFor(host) {
    const rng = seededRandom(`whois:${host}`);
    const days = intBetween(rng, 1, 900);
    const created = new Date(Date.now() - days * 86_400_000);
    return {
        domainAgeDays: days,
        created: created.toISOString().slice(0, 10),
        registrar: days < 30 ? 'Unregistered — privacy protected' : 'Example Registrar LLC',
    };
}
export { hashString };
