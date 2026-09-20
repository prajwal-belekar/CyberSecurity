import type { Severity } from './common';

export type NodeStatus = 'active' | 'idle' | 'suspicious' | 'threat' | 'offline';

export type NodeKind =
  | 'internet'
  | 'gateway'
  | 'firewall'
  | 'server'
  | 'workstation'
  | 'database'
  | 'iot'
  | 'external';

export interface NetworkNode {
  id: string;
  name: string;
  kind: NodeKind;
  ip: string;
  mac?: string;
  os?: string;
  status: NodeStatus;
  risk: Severity;
  /** Normalised 0..1 coordinates used by the canvas layout. */
  position: { x: number; y: number };
  openPorts: number[];
  protocol?: string;
  bytesIn?: number;
  bytesOut?: number;
  lastSeen: string;
  notes?: string;
}

export interface NetworkLink {
  id: string;
  from: string;
  to: string;
  /** relative traffic intensity 0..1 */
  load: number;
  suspicious: boolean;
  blocked: boolean;
  protocol?: string;
}

export interface NetworkEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  sourceName?: string;
  destIp: string;
  destName?: string;
  destPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'DNS' | 'HTTP' | 'HTTPS' | 'TLS' | 'SSH' | 'SMB';
  bytes: number;
  action: 'allowed' | 'blocked' | 'flagged';
  severity: Severity;
  category: string;
  country?: string;
  detail?: string;
}

export interface NetworkSummary {
  connectedDevices: number;
  activeConnections: number;
  suspiciousConnections: number;
  blockedConnections: number;
  totalBandwidthMbps: number;
  inboundMbps: number;
  outboundMbps: number;
  topTalkers: { name: string; ip: string; mbps: number; share: number }[];
  protocolMix: { protocol: string; count: number; percent: number }[];
  blockedByCountry: { country: string; code: string; count: number }[];
}
