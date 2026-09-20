import { minutesAgo } from '@/utils/dates';
import { intBetween, seededRandom } from '@/utils/random';
const rng = seededRandom('auth-events');
const USERS = [
    { user: 'a.reyes', id: 'USR-1042', device: 'WS-REYES-01' },
    { user: 'k.nakamura', id: 'USR-1088', device: 'WS-NAKA-04' },
    { user: 'svc-backup', id: 'SVC-0007', device: 'SERVER-01' },
    { user: 'm.okafor', id: 'USR-1131', device: 'LAPTOP-OKAFOR' },
    { user: 'j.lindqvist', id: 'USR-1176', device: 'WS-LIND-02' },
    { user: 'admin', id: 'USR-0001', device: 'CONSOLE' },
    { user: 'd.mensah', id: 'USR-1204', device: 'WS-MENS-09' },
    { user: 'ci-pipeline', id: 'SVC-0012', device: 'BUILD-RUNNER' },
];
const LOCATIONS = [
    { location: 'Mumbai, IN', country: 'India', code: 'IN' },
    { location: 'Bengaluru, IN', country: 'India', code: 'IN' },
    { location: 'Frankfurt, DE', country: 'Germany', code: 'DE' },
    { location: 'Singapore, SG', country: 'Singapore', code: 'SG' },
    { location: 'Unknown relay', country: 'Unknown', code: '??' },
    { location: 'Ashburn, US', country: 'United States', code: 'US' },
];
function build() {
    const events = [];
    // --- The demo scenario: escalating brute force against AUTH-SERVICE ---
    const scenarioTarget = '192.168.1.42';
    const scenarioStart = 19; // minutes ago
    for (let i = 0; i < 47; i += 1) {
        const minsAgo = scenarioStart - Math.round(i * 0.31);
        events.push({
            id: `AUTH-${String(4200 + i)}`,
            timestamp: minutesAgo(Math.max(0, minsAgo)),
            user: i % 7 === 0 ? 'admin' : `user_${String(intBetween(rng, 10, 999)).padStart(3, '0')}`,
            userId: `USR-${intBetween(rng, 2000, 2999)}`,
            ip: scenarioTarget,
            location: 'Unknown relay',
            country: 'Unknown',
            countryCode: '??',
            method: 'password',
            device: 'unknown-client',
            status: i === 46 ? 'locked' : 'failed',
            risk: i > 39 ? 'critical' : i > 24 ? 'high' : 'medium',
            failureReason: i === 46 ? 'Account locked — threshold exceeded' : 'Invalid credentials',
            attemptNumber: i + 1,
            userAgent: 'curl/8.4.0',
        });
    }
    // --- Normal operational traffic ---
    for (let i = 0; i < 120; i += 1) {
        const u = USERS[intBetween(rng, 0, USERS.length - 1)];
        const l = LOCATIONS[intBetween(rng, 0, LOCATIONS.length - 1)];
        const roll = rng();
        const failed = roll > 0.86;
        events.push({
            id: `AUTH-${String(5000 + i)}`,
            timestamp: minutesAgo(intBetween(rng, 1, 700)),
            user: u.user,
            userId: u.id,
            ip: `192.168.${intBetween(rng, 1, 4)}.${intBetween(rng, 10, 240)}`,
            location: l.location,
            country: l.country,
            countryCode: l.code,
            method: roll > 0.95 ? 'api_key' : roll > 0.72 ? 'mfa' : 'password',
            device: u.device,
            status: failed ? (roll > 0.97 ? 'mfa_failed' : 'failed') : roll > 0.7 ? 'mfa_challenge' : 'success',
            risk: failed ? (roll > 0.97 ? 'high' : 'low') : 'info',
            failureReason: failed ? 'Invalid credentials' : undefined,
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64) SentinelClient/1.4',
        });
    }
    return events.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}
export const AUTHENTICATION_EVENTS = build();
export const AUTH_SEQUENCES = [
    {
        id: 'SEQ-0042',
        user: 'admin',
        ip: '192.168.1.42',
        startedAt: minutesAgo(19),
        endedAt: minutesAgo(4),
        attempts: 47,
        outcome: 'blocked',
        risk: 'critical',
        pattern: 'Credential stuffing — high velocity, rotating usernames, single source',
        events: AUTHENTICATION_EVENTS.filter((e) => e.ip === '192.168.1.42').slice(0, 8),
    },
    {
        id: 'SEQ-0039',
        user: 'svc-backup',
        ip: '203.0.113.19',
        startedAt: minutesAgo(96),
        endedAt: minutesAgo(88),
        attempts: 12,
        outcome: 'abandoned',
        risk: 'high',
        pattern: 'Service-account password spraying from unexpected external relay',
        events: AUTHENTICATION_EVENTS.filter((e) => e.user === 'svc-backup').slice(0, 5),
    },
    {
        id: 'SEQ-0031',
        user: 'k.nakamura',
        ip: '192.168.2.88',
        startedAt: minutesAgo(210),
        endedAt: minutesAgo(203),
        attempts: 4,
        outcome: 'recovered',
        risk: 'low',
        pattern: 'Legitimate MFA retry sequence — user re-authenticated successfully',
        events: AUTHENTICATION_EVENTS.filter((e) => e.user === 'k.nakamura').slice(0, 4),
    },
];
export const AUTH_SUMMARY = {
    successful: 1_284,
    failed: 187,
    suspicious: 23,
    lockedAccounts: 4,
    totalToday: 1_471,
    mfaCoverage: 78,
    uniqueUsers: 214,
    topFailingUsers: [
        { user: 'admin', failures: 41 },
        { user: 'user_207', failures: 18 },
        { user: 'svc-backup', failures: 12 },
        { user: 'user_441', failures: 9 },
        { user: 'j.lindqvist', failures: 4 },
    ],
    topSourceIps: [
        { ip: '192.168.1.42', attempts: 47, blocked: true },
        { ip: '203.0.113.19', attempts: 12, blocked: true },
        { ip: '192.168.2.88', attempts: 4, blocked: false },
        { ip: '192.0.2.141', attempts: 3, blocked: false },
    ],
};
