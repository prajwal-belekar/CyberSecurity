import type { Severity, ThreatType } from './common';
import type { SecurityEvent } from './threat';

export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved' | 'false_positive';

export type IncidentPriority = 'p1' | 'p2' | 'p3' | 'p4';

export interface IncidentTimelineEntry {
  id: string;
  timestamp: string;
  /** Short label rendered on the left rail, e.g. "14:01". */
  time: string;
  title: string;
  detail?: string;
  kind: 'detection' | 'action' | 'note' | 'system' | 'escalation' | 'resolution';
  actor?: string;
}

export interface AffectedAsset {
  id: string;
  name: string;
  type: 'host' | 'service' | 'account' | 'database' | 'gateway' | 'endpoint' | 'iot';
  ip?: string;
  owner?: string;
  criticality: Severity;
  compromised: boolean;
}

export interface IncidentNote {
  id: string;
  author: string;
  timestamp: string;
  body: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  priority: IncidentPriority;
  status: IncidentStatus;
  type: ThreatType;
  source: string;
  target: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  summary: string;
  impact: string;
  timeline: IncidentTimelineEntry[];
  evidenceEventIds: string[];
  affectedAssets: AffectedAsset[];
  notes: IncidentNote[];
  aiAnalysis?: IncidentAiAnalysis;
  tags: string[];
}

export interface IncidentAiAnalysis {
  narrative: string;
  confidence: number;
  relatedEvents: number;
  probableAttackChain: string[];
  suggestedNextSteps: string[];
  falsePositiveLikelihood: number;
}

export interface IncidentSummary {
  open: number;
  investigating: number;
  contained: number;
  resolved: number;
  false_positive: number;
  total: number;
  mttrHours: number;
  slaBreaches: number;
}

export interface IncidentWithEvents extends Incident {
  evidence: SecurityEvent[];
}
