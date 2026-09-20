import type { AppNotification } from '@/types/notification';
import { hoursAgo, minutesAgo } from '@/utils/dates';

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'NTF-9001', kind: 'threat', severity: 'critical', title: 'Critical threat detected', description: 'Potential brute-force activity against AUTH-SERVICE from 192.168.1.42 — 47 failed attempts in 15 minutes.', timestamp: minutesAgo(9), read: false, href: '/threats/THR-1042', actionLabel: 'Investigate' },
  { id: 'NTF-9002', kind: 'incident', severity: 'critical', title: 'New incident created', description: 'INC-2048 · Brute Force Attempt was raised at priority P1 and routed to the on-call queue.', timestamp: minutesAgo(6), read: false, href: '/incidents/INC-2048', actionLabel: 'Open incident' },
  { id: 'NTF-9003', kind: 'authentication', severity: 'high', title: 'Suspicious login sequence', description: 'Password spraying observed against service account svc-backup from 203.0.113.19.', timestamp: minutesAgo(38), read: false, href: '/authentication', actionLabel: 'Review' },
  { id: 'NTF-9004', kind: 'threat', severity: 'high', title: 'Egress anomaly on WORKSTATION-07', description: '340 MB transferred to 203.0.113.87, a host matched by intelligence indicator IOC-0921.', timestamp: minutesAgo(4), read: false, href: '/network', actionLabel: 'Inspect traffic' },
  { id: 'NTF-9005', kind: 'scan', severity: 'medium', title: 'Security scan completed', description: 'Web security scan of authorized-test-site.example finished — 2 high, 4 medium findings.', timestamp: hoursAgo(1), read: true, href: '/web-security', actionLabel: 'View findings' },
  { id: 'NTF-9006', kind: 'intelligence', severity: 'medium', title: 'Threat intelligence updated', description: '2 new indicators ingested from OpenFeed A, including a DNS-tunneling domain.', timestamp: hoursAgo(2), read: true, href: '/threat-intelligence', actionLabel: 'Browse intel' },
  { id: 'NTF-9007', kind: 'scan', severity: 'high', title: 'Malware analysis complete', description: 'suspicious_sample.exe scored 93/100 — malicious. Hash blocklisted fleet-wide.', timestamp: hoursAgo(6), read: true, href: '/malware', actionLabel: 'Open report' },
  { id: 'NTF-9008', kind: 'system', severity: 'info', title: 'Detection ruleset synchronized', description: 'Ruleset 2026.09.4 applied. 12 rules updated, 3 retired.', timestamp: hoursAgo(9), read: true, href: '/settings' },
  { id: 'NTF-9009', kind: 'incident', severity: 'low', title: 'Incident resolved', description: 'INC-2046 · Network Anomaly — IoT Segment was closed by m.okafor.', timestamp: hoursAgo(20), read: true, href: '/incidents/INC-2046' },
];
