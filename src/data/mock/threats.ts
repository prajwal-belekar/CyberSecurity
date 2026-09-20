import type { SecurityEvent, Threat, ThreatSummary } from '@/types/threat';
import { daysAgo, hoursAgo, minutesAgo } from '@/utils/dates';
import { intBetween, seededRandom } from '@/utils/random';

const rng = seededRandom('threats');

/**
 * Seed security event corpus. The brute-force escalation that drives the demo
 * scenario is authored explicitly (so the narrative is coherent); the rest of
 * the ambient telemetry is generated deterministically around it.
 */

const SCENARIO_EVENTS: SecurityEvent[] = [
  { id: 'EVT-8841', type: 'Authentication probe', channel: 'AUTH', severity: 'info', source: '192.168.1.42', target: 'AUTH-SERVICE', timestamp: minutesAgo(21), status: 'resolved', description: 'Single credential validation request from an unrecognized client fingerprint.', detectionRule: 'AUTH-001 unusual-client' },
  { id: 'EVT-8842', type: 'Failed login', channel: 'WARN', severity: 'medium', source: '192.168.1.42', target: 'AUTH-SERVICE', timestamp: minutesAgo(19), status: 'investigating', description: 'Failed password authentication for user "admin".', detectionRule: 'AUTH-010 failed-login', threatId: 'THR-1042', incidentId: 'INC-2048' },
  { id: 'EVT-8843', type: 'Failed login', channel: 'WARN', severity: 'medium', source: '192.168.1.42', target: 'AUTH-SERVICE', timestamp: minutesAgo(18), status: 'investigating', description: 'Repeated failure — attempt 12 of 47 within 15 minutes.', detectionRule: 'AUTH-010 failed-login', threatId: 'THR-1042', incidentId: 'INC-2048' },
  { id: 'EVT-8844', type: 'Repeated authentication failures', channel: 'ALERT', severity: 'high', source: '192.168.1.42', target: 'AUTH-SERVICE', timestamp: minutesAgo(14), status: 'investigating', description: 'Velocity threshold exceeded: 25 failures in under 6 minutes from a single source.', detectionRule: 'AUTH-021 velocity-threshold', threatId: 'THR-1042', incidentId: 'INC-2048' },
  { id: 'EVT-8845', type: 'Potential brute-force activity', channel: 'THREAT', severity: 'critical', source: '192.168.1.42', target: 'AUTH-SERVICE', timestamp: minutesAgo(9), status: 'investigating', description: 'Detection engine correlated 47 failures across 31 distinct usernames from one source.', detectionRule: 'AUTH-044 brute-force-pattern', threatId: 'THR-1042', incidentId: 'INC-2048' },
  { id: 'EVT-8846', type: 'Account lockout enforced', channel: 'AUTH', severity: 'high', source: 'AUTH-SERVICE', target: 'admin', timestamp: minutesAgo(7), status: 'contained', description: 'Automatic lockout applied after threshold breach. Source added to temporary deny list.', detectionRule: 'AUTH-050 lockout-enforced', threatId: 'THR-1042', incidentId: 'INC-2048' },
  { id: 'EVT-8847', type: 'Incident created', channel: 'INCIDENT', severity: 'critical', source: 'DETECTION-ENGINE', target: 'INC-2048', timestamp: minutesAgo(6), status: 'investigating', description: 'Incident INC-2048 raised and routed to the on-call analyst queue.', detectionRule: 'SOC-100 auto-incident', threatId: 'THR-1042', incidentId: 'INC-2048' },
  { id: 'EVT-8848', type: 'Outbound data transfer anomaly', channel: 'NET', severity: 'high', source: '192.168.1.42', target: '203.0.113.87', timestamp: minutesAgo(4), status: 'new', description: 'Workstation-07 transferred 340 MB to an external host matched against IOC-0921.', detectionRule: 'NET-031 egress-anomaly', threatId: 'THR-1044', incidentId: 'INC-2048' },
];

const AMBIENT_TEMPLATES: Array<Pick<SecurityEvent, 'type' | 'channel' | 'severity' | 'description' | 'detectionRule'>> = [
  { type: 'Port scan detected', channel: 'NET', severity: 'high', description: 'Sequential SYN probes observed against 214 ports on the perimeter.', detectionRule: 'NET-014 port-scan' },
  { type: 'Suspicious DNS query', channel: 'NET', severity: 'medium', description: 'High-entropy subdomain resolved against a low-reputation nameserver.', detectionRule: 'NET-022 dns-anomaly' },
  { type: 'Malware signature match', channel: 'THREAT', severity: 'critical', description: 'Static signature matched a known loader family in a submitted sample.', detectionRule: 'MAL-007 signature-match' },
  { type: 'Phishing URL reported', channel: 'INTEL', severity: 'high', description: 'User-reported URL matched a credential-harvesting template.', detectionRule: 'PHI-003 user-report' },
  { type: 'Privilege escalation attempt', channel: 'ALERT', severity: 'critical', description: 'Non-administrative account attempted to modify group membership.', detectionRule: 'SYS-041 priv-esc' },
  { type: 'Impossible travel login', channel: 'AUTH', severity: 'high', description: 'Successful authentication from two geographically distant hosts within 9 minutes.', detectionRule: 'AUTH-033 impossible-travel' },
  { type: 'TLS downgrade attempt', channel: 'NET', severity: 'medium', description: 'Peer requested a deprecated protocol version during handshake.', detectionRule: 'NET-045 tls-downgrade' },
  { type: 'Configuration change', channel: 'SYSTEM', severity: 'info', description: 'Firewall rule updated by an authorized administrator.', detectionRule: 'SYS-002 config-change' },
  { type: 'Rule engine updated', channel: 'SYSTEM', severity: 'info', description: 'Detection ruleset synchronized with upstream intelligence feed.', detectionRule: 'SYS-005 ruleset-sync' },
  { type: 'File integrity alert', channel: 'ALERT', severity: 'medium', description: 'Unexpected modification to a monitored system binary.', detectionRule: 'SYS-060 fim-change' },
  { type: 'Web application probe', channel: 'SCAN', severity: 'medium', description: 'Automated scanner fingerprints detected against the public endpoint.', detectionRule: 'WEB-011 scanner-fingerprint' },
  { type: 'Scheduled backup completed', channel: 'SYSTEM', severity: 'info', description: 'Nightly encrypted snapshot written to offsite storage.', detectionRule: 'SYS-090 backup-ok' },
];

const SOURCES = ['192.168.1.42', '203.0.113.87', '192.0.2.141', '198.51.100.23', '10.0.0.15', '192.168.2.88', '10.0.0.16', '203.0.113.19'];
const TARGETS = ['AUTH-SERVICE', 'SERVER-01', 'EDGE-FIREWALL', 'DATABASE-01', 'WORKSTATION-07', 'CORE-GATEWAY'];

function buildAmbientEvents(count: number): SecurityEvent[] {
  const out: SecurityEvent[] = [];
  for (let i = 0; i < count; i += 1) {
    const tpl = AMBIENT_TEMPLATES[intBetween(rng, 0, AMBIENT_TEMPLATES.length - 1)]!;
    const minutes = intBetween(rng, 2, 4300);
    const status = minutes < 30 ? 'new' : minutes < 240 ? 'investigating' : tpl.severity === 'info' ? 'resolved' : 'resolved';
    out.push({
      id: `EVT-${7000 + i}`,
      timestamp: minutesAgo(minutes),
      source: SOURCES[intBetween(rng, 0, SOURCES.length - 1)]!,
      target: TARGETS[intBetween(rng, 0, TARGETS.length - 1)]!,
      status: status as SecurityEvent['status'],
      ...tpl,
    });
  }
  return out;
}

export const SECURITY_EVENTS: SecurityEvent[] = [
  ...SCENARIO_EVENTS,
  ...buildAmbientEvents(150),
].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));

export const THREATS: Threat[] = [
  {
    id: 'THR-1042',
    title: 'Brute Force Attempt',
    type: 'brute_force',
    severity: 'critical',
    status: 'investigating',
    source: '192.168.1.42',
    target: 'AUTH-SERVICE (10.0.0.16)',
    firstSeen: minutesAgo(19),
    lastSeen: minutesAgo(4),
    occurrences: 47,
    confidence: 0.94,
    detectionRule: 'AUTH-044 brute-force-pattern',
    description:
      'A single source produced 47 failed authentication attempts against 31 distinct usernames in under 15 minutes. Username rotation, constant request cadence and a scripted user agent (curl/8.4.0) indicate automated credential stuffing rather than interactive logon.',
    mitre: { id: 'T1110.004', technique: 'Brute Force: Credential Stuffing', tactic: 'Credential Access' },
    indicators: ['192.168.1.42', 'curl/8.4.0', 'IOC-0921', 'user_207'],
    relatedEventIds: ['EVT-8841', 'EVT-8842', 'EVT-8843', 'EVT-8844', 'EVT-8845', 'EVT-8846'],
    incidentId: 'INC-2048',
    recommendedActions: [
      'Confirm the account lockout is still enforced on AUTH-SERVICE',
      'Add 192.168.1.42 to the perimeter deny list for 24 hours',
      'Audit successful logons from the same source in the previous 7 days',
      'Force MFA re-enrollment for any account that was targeted',
    ],
  },
  {
    id: 'THR-1043',
    title: 'Potential Phishing URL',
    type: 'phishing',
    severity: 'high',
    status: 'new',
    source: 'secure-microsoft-login.example.test',
    target: 'user_042@corp.example.test',
    firstSeen: minutesAgo(47),
    lastSeen: minutesAgo(11),
    occurrences: 6,
    confidence: 0.82,
    detectionRule: 'PHI-003 user-report',
    description:
      'A credential-harvesting page mimicking a corporate single sign-on portal was reported by a user. The domain was registered 4 days ago, uses a free certificate, and posts submitted credentials to an unrelated origin.',
    mitre: { id: 'T1566.002', technique: 'Phishing: Spearphishing Link', tactic: 'Initial Access' },
    indicators: ['secure-microsoft-login.example.test', '203.0.113.87', 'IOC-0918'],
    relatedEventIds: ['EVT-7011', 'EVT-7044'],
    recommendedActions: [
      'Block the domain at the DNS resolver and mail gateway',
      'Notify the reporting user and check for credential reuse',
      'Search mail logs for other recipients of the same template',
    ],
  },
  {
    id: 'THR-1044',
    title: 'Unusual Network Connection',
    type: 'data_exfiltration',
    severity: 'high',
    status: 'investigating',
    source: 'WORKSTATION-07 (192.168.1.42)',
    target: '203.0.113.87:443',
    firstSeen: minutesAgo(38),
    lastSeen: minutesAgo(4),
    occurrences: 14,
    confidence: 0.77,
    detectionRule: 'NET-031 egress-anomaly',
    description:
      'Outbound transfer volume from WORKSTATION-07 is 9x its 30-day baseline and terminates at an external host present in threat intelligence indicator IOC-0921. Transfers occur in fixed-size chunks consistent with staged exfiltration.',
    mitre: { id: 'T1048', technique: 'Exfiltration Over Alternative Protocol', tactic: 'Exfiltration' },
    indicators: ['203.0.113.87', 'IOC-0921', '192.168.1.42'],
    relatedEventIds: ['EVT-8848'],
    incidentId: 'INC-2048',
    recommendedActions: [
      'Isolate WORKSTATION-07 from the production VLAN',
      'Capture and preserve 24 hours of flow data for forensics',
      'Verify whether the destination was reached before or after the lockout',
    ],
  },
  {
    id: 'THR-1041',
    title: 'Suspicious Authentication Pattern',
    type: 'auth_anomaly',
    severity: 'medium',
    status: 'investigating',
    source: '203.0.113.19',
    target: 'svc-backup',
    firstSeen: hoursAgo(2),
    lastSeen: minutesAgo(88),
    occurrences: 12,
    confidence: 0.68,
    detectionRule: 'AUTH-033 impossible-travel',
    description:
      'A service account received password-spray attempts from an external relay that has never appeared in the account history. Attempts stopped abruptly, suggesting an abandoned automated run.',
    mitre: { id: 'T1110.003', technique: 'Brute Force: Password Spraying', tactic: 'Credential Access' },
    indicators: ['203.0.113.19', 'svc-backup'],
    relatedEventIds: ['EVT-7031', 'EVT-7062'],
    recommendedActions: [
      'Rotate the service account credential',
      'Restrict svc-backup to internal network ranges only',
    ],
  },
  {
    id: 'THR-1040',
    title: 'Port Scan — Perimeter Sweep',
    type: 'port_scan',
    severity: 'medium',
    status: 'contained',
    source: '198.51.100.23',
    target: 'EDGE-FIREWALL (10.0.0.1)',
    firstSeen: hoursAgo(5),
    lastSeen: hoursAgo(4),
    occurrences: 214,
    confidence: 0.91,
    detectionRule: 'NET-014 port-scan',
    description:
      'Sequential SYN probes across TCP ports 1–1024 from a documentation-range host. No connection was established; all probes were dropped by the perimeter policy.',
    mitre: { id: 'T1046', technique: 'Network Service Discovery', tactic: 'Discovery' },
    indicators: ['198.51.100.23'],
    relatedEventIds: ['EVT-7088'],
    recommendedActions: ['Confirm rate limiting remains active', 'Add source to the 7-day observation list'],
  },
  {
    id: 'THR-1039',
    title: 'Suspicious File Behavior',
    type: 'malware',
    severity: 'critical',
    status: 'contained',
    source: 'WORKSTATION-07 (192.168.1.42)',
    target: 'suspicious_sample.exe',
    firstSeen: hoursAgo(9),
    lastSeen: hoursAgo(6),
    occurrences: 3,
    confidence: 0.88,
    detectionRule: 'MAL-007 signature-match',
    description:
      'A PE32 executable submitted from WORKSTATION-07 spawned a detached child process, wrote to the Run key for persistence and beaconed to a hard-coded external address. Detonation was completed inside the isolated sandbox.',
    mitre: { id: 'T1547.001', technique: 'Boot or Logon Autostart: Registry Run Keys', tactic: 'Persistence' },
    indicators: ['a82f19c4d7e3b91c5560f2a94b1e0c3d88f7a21e6c40b5d93f18a7e2c60493bc', '203.0.113.87', 'IOC-0921'],
    relatedEventIds: ['EVT-7002'],
    incidentId: 'INC-2045',
    recommendedActions: [
      'Push the extracted hash to endpoint detection blocklists',
      'Sweep the estate for the same hash and for the Run key value',
      'Reimage WORKSTATION-07 before returning it to service',
    ],
  },
  {
    id: 'THR-1038',
    title: 'Web Application Scanner Fingerprint',
    type: 'web_security',
    severity: 'low',
    status: 'resolved',
    source: '192.0.2.141',
    target: 'https://app.corp.example.test',
    firstSeen: daysAgo(1),
    lastSeen: hoursAgo(19),
    occurrences: 38,
    confidence: 0.62,
    detectionRule: 'WEB-011 scanner-fingerprint',
    description:
      'Automated reconnaissance requests against the public application endpoint. Traffic was unauthenticated and produced only informational responses; no injection vector succeeded.',
    mitre: { id: 'T1595.002', technique: 'Active Scanning: Vulnerability Scanning', tactic: 'Reconnaissance' },
    indicators: ['192.0.2.141'],
    relatedEventIds: [],
    recommendedActions: ['Keep WAF anomaly scoring enabled', 'Review rate-limit thresholds for the login route'],
  },
  {
    id: 'THR-1037',
    title: 'Multiple Failed Logins — Shared Credential',
    type: 'brute_force',
    severity: 'low',
    status: 'false_positive',
    source: '192.168.2.88',
    target: 'k.nakamura',
    firstSeen: hoursAgo(4),
    lastSeen: hoursAgo(3),
    occurrences: 4,
    confidence: 0.31,
    detectionRule: 'AUTH-010 failed-login',
    description:
      'Four consecutive failures from a known corporate workstation, followed by a successful MFA challenge. Confirmed with the user as a mistyped password after a keyboard layout change.',
    indicators: ['192.168.2.88'],
    relatedEventIds: [],
    recommendedActions: ['No action required — closed as false positive'],
  },
];

export const THREAT_SUMMARY: ThreatSummary = {
  critical: 3,
  high: 12,
  medium: 27,
  low: 64,
  info: 322,
  total: 428,
  activeIncidents: 5,
  eventsToday: 428,
  blockedToday: 417,
  meanTimeToDetectMinutes: 4,
};

/** Deterministic threat-activity series used by the dashboard & analytics charts. */
export function buildActivitySeries(points: number, stepMinutes: number, seed = 'activity') {
  const rand = seededRandom(seed);
  const now = Date.now();
  const series = [];
  for (let i = points - 1; i >= 0; i -= 1) {
    const ts = new Date(now - i * stepMinutes * 60_000);
    const hour = ts.getHours();
    // Business-hours weighting keeps the shape believable rather than uniform noise.
    const dayFactor = hour >= 9 && hour <= 19 ? 1.6 : hour >= 6 && hour < 9 ? 1.1 : 0.55;
    const base = 4 + rand() * 6;
    const critical = Math.round(rand() * 2 * dayFactor * 0.5);
    const high = Math.round((base * 0.5 + rand() * 3) * dayFactor * 0.6);
    const medium = Math.round((base + rand() * 5) * dayFactor);
    const low = Math.round((base * 1.7 + rand() * 9) * dayFactor);
    const info = Math.round((base * 3 + rand() * 14) * dayFactor);
    series.push({
      timestamp: ts.toISOString(),
      label:
        stepMinutes >= 1440
          ? ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : `${String(hour).padStart(2, '0')}:${String(ts.getMinutes()).padStart(2, '0')}`,
      critical,
      high,
      medium,
      low,
      info,
      total: critical + high + medium + low + info,
    });
  }
  return series;
}

export const ACTIVITY_RANGES: Record<string, { points: number; stepMinutes: number }> = {
  '1H': { points: 12, stepMinutes: 5 },
  '6H': { points: 24, stepMinutes: 15 },
  '24H': { points: 24, stepMinutes: 60 },
  '7D': { points: 28, stepMinutes: 360 },
  '30D': { points: 30, stepMinutes: 1440 },
  '90D': { points: 45, stepMinutes: 2880 },
};
