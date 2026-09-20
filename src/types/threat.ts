import type { EventStatus, Severity, ThreatType } from './common';

export interface SecurityEvent {
  id: string;
  type: string;
  /** Machine readable channel used by the live event stream, e.g. AUTH / NET / THREAT. */
  channel: EventChannel;
  severity: Severity;
  source: string;
  target?: string;
  timestamp: string;
  status: EventStatus;
  description?: string;
  detectionRule?: string;
  /** Optional correlated threat id. */
  threatId?: string;
  /** Optional correlated incident id. */
  incidentId?: string;
  metadata?: Record<string, string | number>;
}

export type EventChannel =
  | 'SYSTEM'
  | 'AUTH'
  | 'NET'
  | 'WARN'
  | 'ALERT'
  | 'THREAT'
  | 'INCIDENT'
  | 'INTEL'
  | 'SCAN'
  | 'INFO'
  | 'AI';

export interface Threat {
  id: string;
  title: string;
  type: ThreatType;
  severity: Severity;
  status: EventStatus;
  source: string;
  target: string;
  firstSeen: string;
  lastSeen: string;
  occurrences: number;
  confidence: number;
  detectionRule: string;
  description: string;
  /** MITRE ATT&CK style reference (tactic / technique). */
  mitre?: { id: string; technique: string; tactic: string };
  indicators: string[];
  relatedEventIds: string[];
  incidentId?: string;
  recommendedActions: string[];
}

export interface ThreatSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  total: number;
  activeIncidents: number;
  eventsToday: number;
  blockedToday: number;
  meanTimeToDetectMinutes: number;
}

export interface ThreatFilters {
  severity?: Severity[];
  status?: EventStatus[];
  type?: ThreatType[];
  search?: string;
  timeRange?: string;
  source?: string;
}
