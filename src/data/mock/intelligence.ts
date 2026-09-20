import type { IntelligenceSummary, ThreatIndicator } from '@/types/intelligence';
import { daysAgo, hoursAgo, minutesAgo } from '@/utils/dates';

export const THREAT_INDICATORS: ThreatIndicator[] = [
  {
    id: 'IOC-0921', value: '203.0.113.87', type: 'ip', risk: 'critical', status: 'active',
    firstSeen: daysAgo(9), lastSeen: minutesAgo(4), source: 'Internal telemetry', confidence: 0.93,
    relatedEvents: 17, tags: ['c2', 'beaconing', 'exfil'], threatActor: 'UNC-2214', campaign: 'Autumn Relay',
    country: 'Reserved / documentation range',
    description: 'Command-and-control endpoint observed receiving staged HTTPS beacons from WORKSTATION-07. Matched by three independent detection rules within a 24-hour window.',
    references: ['INC-2048', 'INC-2045', 'THR-1044'],
  },
  {
    id: 'IOC-0918', value: 'secure-microsoft-login.example.test', type: 'domain', risk: 'high', status: 'active',
    firstSeen: daysAgo(4), lastSeen: minutesAgo(11), source: 'User report + URL analyzer', confidence: 0.88,
    relatedEvents: 6, tags: ['phishing', 'credential-harvest', 'brand-impersonation'], campaign: 'Finance Lure',
    description: 'Credential-harvesting host impersonating a corporate SSO portal. Registered four days prior to first observation and serving a cloned login template.',
    whois: { registrar: 'privacy-protected', created: '2026-09-15', expires: '2027-09-15', nameservers: 'ns1.example.test, ns2.example.test' },
    references: ['INC-2044', 'THR-1043'],
  },
  {
    id: 'IOC-0917', value: 'a82f19c4d7e3b91c5560f2a94b1e0c3d88f7a21e6c40b5d93f18a7e2c60493bc', type: 'hash', risk: 'critical', status: 'active',
    firstSeen: hoursAgo(9), lastSeen: hoursAgo(6), source: 'Malware analyzer', confidence: 0.97,
    relatedEvents: 3, tags: ['loader', 'persistence', 'pe32'], threatActor: 'UNC-2214',
    description: 'SHA-256 of a packed PE32 loader that writes a registry Run key and beacons to IOC-0921. Flagged by 41 of 72 engines during controlled detonation.',
    references: ['INC-2045', 'THR-1039'],
  },
  {
    id: 'IOC-0915', value: '192.168.1.42', type: 'ip', risk: 'high', status: 'suspicious',
    firstSeen: minutesAgo(21), lastSeen: minutesAgo(4), source: 'Internal telemetry', confidence: 0.9,
    relatedEvents: 47, tags: ['brute-force', 'internal', 'compromised-host'],
    description: 'Internal workstation responsible for 47 failed authentication attempts and an anomalous 340 MB egress transfer. Correlates with IOC-0921 and IOC-0917.',
    references: ['INC-2048', 'THR-1042'],
  },
  {
    id: 'IOC-0912', value: 'http://invoice-payment-portal.example.test/docusign/review', type: 'url', risk: 'critical', status: 'active',
    firstSeen: daysAgo(2), lastSeen: hoursAgo(3), source: 'Mail gateway', confidence: 0.95,
    relatedEvents: 14, tags: ['phishing', 'invoice-lure'], campaign: 'Finance Lure',
    description: 'Invoice-themed lure delivering a fake document-review portal. Cleartext HTTP and a hardcoded credential POST target.',
    references: ['INC-2044'],
  },
  {
    id: 'IOC-0909', value: '203.0.113.19', type: 'ip', risk: 'medium', status: 'active',
    firstSeen: daysAgo(6), lastSeen: minutesAgo(88), source: 'Authentication monitor', confidence: 0.72,
    relatedEvents: 12, tags: ['password-spray', 'relay'],
    description: 'External relay used for low-and-slow password spraying against service accounts. Attempts cease quickly, consistent with opportunistic automation.',
    references: ['INC-2047', 'THR-1041'],
  },
  {
    id: 'IOC-0904', value: 'billing-update.example.test', type: 'domain', risk: 'medium', status: 'under_review',
    firstSeen: daysAgo(12), lastSeen: daysAgo(3), source: 'External feed — OpenFeed A', confidence: 0.55,
    relatedEvents: 2, tags: ['phishing', 'unverified'],
    description: 'Reported by an upstream feed but not yet observed inside the monitored environment. Awaiting local confirmation before promotion to active.',
  },
  {
    id: 'IOC-0901', value: '198.51.100.23', type: 'ip', risk: 'low', status: 'active',
    firstSeen: daysAgo(5), lastSeen: hoursAgo(4), source: 'Perimeter firewall', confidence: 0.81,
    relatedEvents: 214, tags: ['reconnaissance', 'port-scan'],
    description: 'Source of a perimeter SYN sweep across TCP 1–1024. All probes dropped; no session established.',
    references: ['THR-1040'],
  },
  {
    id: 'IOC-0898', value: 'finance-notify@example.test', type: 'email', risk: 'medium', status: 'active',
    firstSeen: daysAgo(3), lastSeen: daysAgo(2), source: 'Mail gateway', confidence: 0.79,
    relatedEvents: 14, tags: ['phishing', 'sender'],
    description: 'Spoofed sender address used in the Finance Lure campaign. SPF failed, DKIM absent.',
    references: ['INC-2044'],
  },
  {
    id: 'IOC-0890', value: '10.0.0.15', type: 'ip', risk: 'info', status: 'whitelisted',
    firstSeen: daysAgo(120), lastSeen: minutesAgo(1), source: 'Asset inventory', confidence: 1,
    relatedEvents: 0, tags: ['internal', 'known-good', 'asset'],
    description: 'Known application server. Whitelisted to suppress noise from routine health checks.',
  },
  {
    id: 'IOC-0884', value: 'd41d8cd98f00b204e9800998ecf8427e', type: 'hash', risk: 'low', status: 'expired',
    firstSeen: daysAgo(200), lastSeen: daysAgo(96), source: 'Malware analyzer', confidence: 0.4,
    relatedEvents: 0, tags: ['empty-file', 'noise'],
    description: 'Hash of a zero-byte placeholder. Retained for history; excluded from active detection.',
  },
  {
    id: 'IOC-0878', value: 'telemetry-relay.example.test', type: 'domain', risk: 'high', status: 'active',
    firstSeen: daysAgo(21), lastSeen: daysAgo(1), source: 'External feed — OpenFeed B', confidence: 0.84,
    relatedEvents: 5, tags: ['c2', 'dns-tunneling'], threatActor: 'UNC-1180',
    description: 'Domain used for DNS tunneling exfiltration with high-entropy TXT records. Not yet observed internally.',
  },
];

export const INTELLIGENCE_SUMMARY: IntelligenceSummary = {
  totalIndicators: THREAT_INDICATORS.length,
  newToday: 2,
  byType: [
    { type: 'ip', count: 4 },
    { type: 'domain', count: 3 },
    { type: 'url', count: 1 },
    { type: 'hash', count: 2 },
    { type: 'email', count: 1 },
  ],
  byRisk: [
    { risk: 'critical', count: 3 },
    { risk: 'high', count: 3 },
    { risk: 'medium', count: 3 },
    { risk: 'low', count: 2 },
    { risk: 'info', count: 1 },
  ],
  bySource: [
    { source: 'Internal telemetry', count: 412, lastSync: minutesAgo(1) },
    { source: 'Malware analyzer', count: 96, lastSync: minutesAgo(8) },
    { source: 'Authentication monitor', count: 74, lastSync: minutesAgo(2) },
    { source: 'External feed — OpenFeed A', count: 1_284, lastSync: hoursAgo(1) },
    { source: 'External feed — OpenFeed B', count: 940, lastSync: hoursAgo(3) },
  ],
  topActors: [
    { name: 'UNC-2214', incidents: 2, country: 'Unknown' },
    { name: 'UNC-1180', incidents: 1, country: 'Unknown' },
    { name: 'Finance Lure (campaign)', incidents: 1, country: 'Unknown' },
  ],
};
