/**
 * Shared primitives used across every CyberSentinel domain model.
 * These mirror the payload shapes the future FastAPI backend will return,
 * so switching from mock → live transport requires no UI changes.
 */

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type EventStatus = 'new' | 'investigating' | 'contained' | 'resolved' | 'false_positive';

export type ThreatType =
  | 'brute_force'
  | 'phishing'
  | 'malware'
  | 'port_scan'
  | 'suspicious_network'
  | 'auth_anomaly'
  | 'web_security'
  | 'data_exfiltration'
  | 'privilege_escalation';

export type IndicatorType = 'ip' | 'domain' | 'url' | 'hash' | 'email';

export type TimeRange = '1H' | '6H' | '24H' | '7D' | '30D' | '90D';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/** A single point in a time-series used by all charts. */
export interface TimeSeriesPoint {
  /** ISO timestamp of the bucket start. */
  timestamp: string;
  /** Human readable bucket label, e.g. "17:42" or "Sep 14". */
  label: string;
  [metric: string]: string | number;
}

export interface KeyValue {
  label: string;
  value: string;
  /** Render value in monospace (IPs, hashes, ports, IDs…). */
  mono?: boolean;
  /** Allow one-click copy. */
  copyable?: boolean;
}

export interface Trend {
  /** Percentage change versus the previous comparable period. */
  delta: number;
  direction: 'up' | 'down' | 'flat';
  period: string;
}

export interface Confidence {
  /** 0..1 model confidence. */
  score: number;
}

/** Envelope returned by every mock/live service call. */
export interface ServiceResult<T> {
  data: T;
  meta?: {
    generatedAt: string;
    source: 'mock' | 'live';
    latencyMs: number;
  };
}

export const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];

export const EVENT_STATUSES: EventStatus[] = [
  'new',
  'investigating',
  'contained',
  'resolved',
  'false_positive',
];

export const THREAT_TYPES: ThreatType[] = [
  'brute_force',
  'phishing',
  'malware',
  'port_scan',
  'suspicious_network',
  'auth_anomaly',
  'web_security',
  'data_exfiltration',
  'privilege_escalation',
];
