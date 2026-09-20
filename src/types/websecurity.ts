import type { Severity } from './common';

export type ScanPhase =
  | 'idle'
  | 'initializing'
  | 'configuration'
  | 'headers'
  | 'cookies'
  | 'content'
  | 'findings'
  | 'complete';

export interface SecurityHeader {
  name: string;
  present: boolean;
  value?: string;
  severity: Severity;
  recommendation: string;
}

export interface VulnerabilityFinding {
  id: string;
  title: string;
  severity: Severity;
  category: 'headers' | 'cookies' | 'tls' | 'configuration' | 'injection' | 'information_disclosure';
  description: string;
  evidence: string;
  remediation: string;
  status: 'open' | 'accepted_risk' | 'remediated' | 'false_positive';
  cvss?: number;
  cwe?: string;
  references?: string[];
}

export interface WebScanResult {
  id: string;
  target: string;
  startedAt: string;
  completedAt?: string;
  status: ScanPhase;
  authorizationToken: string;
  scope: string[];
  summary: { critical: number; high: number; medium: number; low: number; pass: number };
  findings: VulnerabilityFinding[];
  headers: SecurityHeader[];
  tls: {
    version: string;
    cipher: string;
    grade: string;
    certificateIssuer: string;
    expiresAt: string;
    hsts: boolean;
  };
  technologyStack: { name: string; category: string; confidence: number }[];
  scanSteps: { index: number; label: string; state: 'pending' | 'running' | 'ok' | 'warning' | 'fail'; detail?: string }[];
}
