import { seededRandom } from '@/utils/random';
const RANGE_BUCKETS = {
    '24H': { points: 24, stepMinutes: 60, labelStyle: 'clock' },
    '7D': { points: 28, stepMinutes: 360, labelStyle: 'clock' },
    '30D': { points: 30, stepMinutes: 1440, labelStyle: 'day' },
    '90D': { points: 45, stepMinutes: 2880, labelStyle: 'day' },
};
function labelFor(d, style) {
    return style === 'day'
        ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : `${String(d.getHours()).padStart(2, '0')}:00`;
}
/** Builds any analytics series with business-hours weighting so trends read as plausible. */
export function buildSeries(range, seed, shape) {
    const cfg = RANGE_BUCKETS[range] ?? RANGE_BUCKETS['24H'];
    const rng = seededRandom(`${seed}:${range}`);
    const now = Date.now();
    const out = [];
    for (let i = cfg.points - 1; i >= 0; i -= 1) {
        const d = new Date(now - i * cfg.stepMinutes * 60_000);
        const hour = d.getHours();
        const dayFactor = hour >= 9 && hour <= 19 ? 1.55 : hour >= 6 && hour < 9 ? 1.05 : 0.5;
        out.push({
            timestamp: d.toISOString(),
            label: labelFor(d, cfg.labelStyle),
            ...shape(rng, cfg.points - 1 - i, dayFactor),
        });
    }
    return out;
}
export const THREAT_CATEGORY_MIX = [
    { category: 'Phishing', key: 'phishing', count: 96, color: '#9481c6' },
    { category: 'Authentication', key: 'authentication', count: 174, color: '#dd8a52' },
    { category: 'Network', key: 'network', count: 111, color: '#4a9ec4' },
    { category: 'Malware', key: 'malware', count: 27, color: '#de6375' },
    { category: 'Web', key: 'web', count: 20, color: '#3fb37f' },
];
export const SEVERITY_MIX = [
    { severity: 'Critical', key: 'critical', count: 3, color: '#de6375' },
    { severity: 'High', key: 'high', count: 12, color: '#dd8a52' },
    { severity: 'Medium', key: 'medium', count: 27, color: '#d0a94f' },
    { severity: 'Low', key: 'low', count: 64, color: '#5fae7a' },
    { severity: 'Info', key: 'info', count: 322, color: '#4f9ac4' },
];
export const INCIDENT_RESOLUTION_MIX = [
    { label: 'P1', created: 6, resolved: 5, avgHours: 8.2 },
    { label: 'P2', created: 14, resolved: 12, avgHours: 19.6 },
    { label: 'P3', created: 23, resolved: 21, avgHours: 34.1 },
    { label: 'P4', created: 31, resolved: 30, avgHours: 51.7 },
];
export const DETECTION_RULE_EFFICACY = [
    { rule: 'AUTH-044 brute-force-pattern', hits: 47, truePositives: 46, precision: 0.98 },
    { rule: 'NET-031 egress-anomaly', hits: 23, truePositives: 19, precision: 0.83 },
    { rule: 'MAL-007 signature-match', hits: 11, truePositives: 11, precision: 1 },
    { rule: 'PHI-003 user-report', hits: 34, truePositives: 27, precision: 0.79 },
    { rule: 'AUTH-033 impossible-travel', hits: 9, truePositives: 5, precision: 0.56 },
    { rule: 'NET-014 port-scan', hits: 214, truePositives: 190, precision: 0.89 },
];
export const ANALYTICS_HEADLINES = [
    { label: 'Events analysed', value: '1.28M', delta: 8.4, hint: 'rolling 30 days' },
    { label: 'Detections raised', value: '428', delta: 12.1, hint: 'vs previous period' },
    { label: 'Mean time to detect', value: '4m', delta: -18.2, hint: 'lower is better' },
    { label: 'Mean time to resolve', value: '11.4h', delta: -6.7, hint: 'lower is better' },
    { label: 'False-positive rate', value: '9.1%', delta: -2.3, hint: 'lower is better' },
    { label: 'Containment rate', value: '94%', delta: 3.1, hint: 'auto + manual' },
];
