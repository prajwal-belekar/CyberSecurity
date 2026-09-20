import type { NetworkEvent, NetworkLink, NetworkNode, NetworkSummary } from '@/types/network';
import { minutesAgo, hoursAgo } from '@/utils/dates';
import { intBetween, seededRandom } from '@/utils/random';

/**
 * Internal topology uses RFC1918 space; hostile external indicators use the
 * RFC5737 documentation ranges (192.0.2.0/24, 203.0.113.0/24) so demo data
 * never references a real-world target.
 */

export const ATTACKER_IP = '192.168.1.42';

export const NETWORK_NODES: NetworkNode[] = [
  {
    id: 'node-internet', name: 'INTERNET', kind: 'internet', ip: '0.0.0.0/0',
    status: 'active', risk: 'info', position: { x: 0.5, y: 0.06 },
    openPorts: [], protocol: 'BGP', lastSeen: minutesAgo(0),
    bytesIn: 4_820_000_000, bytesOut: 1_240_000_000,
    notes: 'Edge transit — 2 upstream providers',
  },
  {
    id: 'node-fw', name: 'EDGE-FIREWALL', kind: 'firewall', ip: '10.0.0.1',
    mac: '00:1A:2B:3C:4D:01', os: 'SentinelOS 4.2',
    status: 'active', risk: 'low', position: { x: 0.5, y: 0.21 },
    openPorts: [443, 8443], protocol: 'HTTPS', lastSeen: minutesAgo(0),
    bytesIn: 2_100_000_000, bytesOut: 980_000_000,
    notes: 'Primary perimeter filter · 1,284 active rules',
  },
  {
    id: 'node-gw', name: 'CORE-GATEWAY', kind: 'gateway', ip: '10.0.0.2',
    mac: '00:1A:2B:3C:4D:02', os: 'SentinelOS 4.2',
    status: 'active', risk: 'low', position: { x: 0.5, y: 0.36 },
    openPorts: [22, 53, 443], protocol: 'TCP/IP', lastSeen: minutesAgo(0),
    bytesIn: 1_900_000_000, bytesOut: 910_000_000,
    notes: 'Router / DNS resolver for the monitored segment',
  },
  {
    id: 'node-srv-01', name: 'SERVER-01', kind: 'server', ip: '10.0.0.15',
    mac: '00:1A:2B:3C:4D:15', os: 'Ubuntu 24.04 LTS',
    status: 'active', risk: 'low', position: { x: 0.24, y: 0.55 },
    openPorts: [22, 80, 443, 3306], protocol: 'HTTPS', lastSeen: minutesAgo(1),
    bytesIn: 640_000_000, bytesOut: 410_000_000,
    notes: 'Application tier · nginx + FastAPI (planned)',
  },
  {
    id: 'node-auth', name: 'AUTH-SERVICE', kind: 'server', ip: '10.0.0.16',
    mac: '00:1A:2B:3C:4D:16', os: 'Debian 12',
    status: 'suspicious', risk: 'high', position: { x: 0.5, y: 0.55 },
    openPorts: [443, 8443], protocol: 'HTTPS', lastSeen: minutesAgo(0),
    bytesIn: 210_000_000, bytesOut: 88_000_000,
    notes: 'Authentication gateway — currently under credential-stuffing attempt',
  },
  {
    id: 'node-db', name: 'DATABASE-01', kind: 'database', ip: '10.0.0.20',
    mac: '00:1A:2B:3C:4D:20', os: 'PostgreSQL 16',
    status: 'active', risk: 'medium', position: { x: 0.5, y: 0.74 },
    openPorts: [5432], protocol: 'TCP', lastSeen: minutesAgo(0),
    bytesIn: 310_000_000, bytesOut: 520_000_000,
    notes: 'Primary datastore · port reachable from app tier only',
  },
  {
    id: 'node-ws-07', name: 'WORKSTATION-07', kind: 'workstation', ip: '192.168.1.42',
    mac: '3C:22:FB:9A:11:07', os: 'Windows 11 Pro',
    status: 'threat', risk: 'critical', position: { x: 0.76, y: 0.55 },
    openPorts: [445, 3389], protocol: 'SMB/RDP', lastSeen: minutesAgo(2),
    bytesIn: 92_000_000, bytesOut: 340_000_000,
    notes: 'Source of repeated authentication failures — outbound volume anomalous',
  },
  {
    id: 'node-ws-12', name: 'WORKSTATION-12', kind: 'workstation', ip: '192.168.1.57',
    mac: '3C:22:FB:9A:11:12', os: 'macOS 15',
    status: 'active', risk: 'low', position: { x: 0.9, y: 0.72 },
    openPorts: [22], protocol: 'SSH', lastSeen: minutesAgo(3),
    bytesIn: 44_000_000, bytesOut: 18_000_000,
    notes: 'Security analyst workstation',
  },
  {
    id: 'node-iot', name: 'IOT-SENSOR-03', kind: 'iot', ip: '192.168.4.31',
    mac: 'B8:27:EB:4C:22:03', os: 'embedded-linux',
    status: 'idle', risk: 'medium', position: { x: 0.1, y: 0.74 },
    openPorts: [80, 554], protocol: 'HTTP/RTSP', lastSeen: hoursAgo(2),
    bytesIn: 3_200_000, bytesOut: 12_800_000,
    notes: 'Default credentials present — segmentation recommended',
  },
  {
    id: 'node-ext', name: 'UNKNOWN-EXTERNAL', kind: 'external', ip: '203.0.113.87',
    status: 'suspicious', risk: 'high', position: { x: 0.86, y: 0.2 },
    openPorts: [], protocol: 'TCP', lastSeen: minutesAgo(6),
    bytesIn: 18_400_000, bytesOut: 1_100_000,
    notes: 'Documentation-range host · matched threat intel indicator IOC-0921',
  },
];

export const NETWORK_LINKS: NetworkLink[] = [
  { id: 'link-1', from: 'node-internet', to: 'node-fw', load: 0.82, suspicious: false, blocked: false, protocol: 'BGP' },
  { id: 'link-2', from: 'node-fw', to: 'node-gw', load: 0.74, suspicious: false, blocked: false, protocol: 'TCP/IP' },
  { id: 'link-3', from: 'node-gw', to: 'node-srv-01', load: 0.61, suspicious: false, blocked: false, protocol: 'HTTPS' },
  { id: 'link-4', from: 'node-gw', to: 'node-auth', load: 0.93, suspicious: true, blocked: false, protocol: 'HTTPS' },
  { id: 'link-5', from: 'node-gw', to: 'node-ws-07', load: 0.44, suspicious: true, blocked: false, protocol: 'SMB' },
  { id: 'link-6', from: 'node-auth', to: 'node-db', load: 0.38, suspicious: false, blocked: false, protocol: 'TCP' },
  { id: 'link-7', from: 'node-srv-01', to: 'node-db', load: 0.52, suspicious: false, blocked: false, protocol: 'TCP' },
  { id: 'link-8', from: 'node-ws-07', to: 'node-auth', load: 0.88, suspicious: true, blocked: false, protocol: 'HTTPS' },
  { id: 'link-9', from: 'node-ws-07', to: 'node-ext', load: 0.29, suspicious: true, blocked: true, protocol: 'TCP' },
  { id: 'link-10', from: 'node-gw', to: 'node-ws-12', load: 0.21, suspicious: false, blocked: false, protocol: 'SSH' },
  { id: 'link-11', from: 'node-gw', to: 'node-iot', load: 0.08, suspicious: false, blocked: false, protocol: 'HTTP' },
];

const rng = seededRandom('network-events');

const EVENT_TEMPLATES: Array<{
  category: string; protocol: NetworkEvent['protocol']; port: number;
  severity: NetworkEvent['severity']; action: NetworkEvent['action']; detail: string;
}> = [
  { category: 'TLS handshake', protocol: 'HTTPS', port: 443, severity: 'info', action: 'allowed', detail: 'Standard encrypted session established' },
  { category: 'DNS query', protocol: 'DNS', port: 53, severity: 'info', action: 'allowed', detail: 'Recursive resolution completed' },
  { category: 'SSH session', protocol: 'SSH', port: 22, severity: 'low', action: 'allowed', detail: 'Key-based authentication accepted' },
  { category: 'Port sweep', protocol: 'TCP', port: 0, severity: 'high', action: 'flagged', detail: 'Sequential SYN probes across 1–1024' },
  { category: 'SMB lateral movement', protocol: 'SMB', port: 445, severity: 'critical', action: 'blocked', detail: 'Remote share enumeration blocked by policy' },
  { category: 'ICMP flood', protocol: 'ICMP', port: 0, severity: 'medium', action: 'blocked', detail: 'Rate limit exceeded — source throttled' },
  { category: 'DNS tunneling', protocol: 'DNS', port: 53, severity: 'high', action: 'flagged', detail: 'High-entropy TXT queries to rare resolver' },
  { category: 'Data egress', protocol: 'HTTPS', port: 443, severity: 'high', action: 'flagged', detail: 'Unusually large outbound transfer to external host' },
  { category: 'RDP attempt', protocol: 'TCP', port: 3389, severity: 'medium', action: 'blocked', detail: 'Inbound remote desktop connection refused' },
  { category: 'Certificate error', protocol: 'TLS', port: 443, severity: 'medium', action: 'flagged', detail: 'Self-signed certificate presented by peer' },
];

function buildNetworkEvents(count = 140): NetworkEvent[] {
  const out: NetworkEvent[] = [];
  for (let i = 0; i < count; i += 1) {
    const tpl = EVENT_TEMPLATES[intBetween(rng, 0, EVENT_TEMPLATES.length - 1)]!;
    const external = rng() > 0.55;
    const source = external
      ? `203.0.113.${intBetween(rng, 2, 250)}`
      : `192.168.${intBetween(rng, 1, 4)}.${intBetween(rng, 10, 240)}`;
    const dest = external
      ? `10.0.0.${intBetween(rng, 15, 20)}`
      : `203.0.113.${intBetween(rng, 2, 250)}`;
    out.push({
      id: `NET-${String(9000 + i)}`,
      timestamp: minutesAgo(Math.round(i * 1.7 + rng() * 2)),
      sourceIp: source,
      sourceName: external ? undefined : NETWORK_NODES.find((n) => n.ip === source)?.name,
      destIp: dest,
      destName: NETWORK_NODES.find((n) => n.ip === dest)?.name,
      destPort: tpl.port || intBetween(rng, 20, 8080),
      protocol: tpl.protocol,
      bytes: intBetween(rng, 64, 4_800_000),
      action: tpl.action,
      severity: tpl.severity,
      category: tpl.category,
      country: external ? 'Unknown' : 'Internal',
      detail: tpl.detail,
    });
  }
  return out;
}

export const NETWORK_EVENTS: NetworkEvent[] = buildNetworkEvents();

export const NETWORK_SUMMARY: NetworkSummary = {
  connectedDevices: 128,
  activeConnections: 1_842,
  suspiciousConnections: 23,
  blockedConnections: 417,
  totalBandwidthMbps: 184.6,
  inboundMbps: 121.4,
  outboundMbps: 63.2,
  topTalkers: [
    { name: 'SERVER-01', ip: '10.0.0.15', mbps: 48.2, share: 26 },
    { name: 'DATABASE-01', ip: '10.0.0.20', mbps: 39.7, share: 22 },
    { name: 'AUTH-SERVICE', ip: '10.0.0.16', mbps: 31.1, share: 17 },
    { name: 'WORKSTATION-07', ip: '192.168.1.42', mbps: 27.9, share: 15 },
    { name: 'EDGE-FIREWALL', ip: '10.0.0.1', mbps: 18.4, share: 10 },
    { name: 'Other (123 hosts)', ip: '—', mbps: 19.3, share: 10 },
  ],
  protocolMix: [
    { protocol: 'HTTPS', count: 8_412, percent: 46 },
    { protocol: 'DNS', count: 4_180, percent: 23 },
    { protocol: 'SSH', count: 1_640, percent: 9 },
    { protocol: 'SMB', count: 1_290, percent: 7 },
    { protocol: 'NTP', count: 1_105, percent: 6 },
    { protocol: 'Other', count: 1_673, percent: 9 },
  ],
  blockedByCountry: [
    { country: 'Reserved / Documentation', code: 'RD', count: 184 },
    { country: 'Unknown relay', code: '??', count: 96 },
    { country: 'Internal segment', code: 'IN', count: 71 },
    { country: 'Cloud provider', code: 'CL', count: 44 },
    { country: 'Hosting / VPS', code: 'VP', count: 22 },
  ],
};
