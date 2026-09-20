import type { IndicatorType, Severity } from './common';

export type IndicatorStatus = 'active' | 'suspicious' | 'whitelisted' | 'expired' | 'under_review';

export interface ThreatIndicator {
  id: string;
  value: string;
  type: IndicatorType;
  risk: Severity;
  status: IndicatorStatus;
  firstSeen: string;
  lastSeen: string;
  source: string;
  confidence: number;
  relatedEvents: number;
  tags: string[];
  threatActor?: string;
  campaign?: string;
  country?: string;
  description: string;
  whois?: Record<string, string>;
  references?: string[];
}

export interface IntelligenceSummary {
  totalIndicators: number;
  newToday: number;
  byType: { type: IndicatorType; count: number }[];
  byRisk: { risk: Severity; count: number }[];
  bySource: { source: string; count: number; lastSync: string }[];
  topActors: { name: string; incidents: number; country: string }[];
}
