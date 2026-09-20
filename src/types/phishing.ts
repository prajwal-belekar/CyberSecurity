import type { Severity } from './common';

/** Derived URL attributes fed to the risk scorer. */
export interface PhishingFeatures {
  protocol: string;
  domain: string;
  subdomain?: string;
  tld: string;
  path: string;
  query?: string;
  length: number;
  domainAgeDays: number;
  lookalikeBrand?: string;
  subdomainDepth: number;
  hasLoginForm: boolean;
  isIpHost: boolean;
  redirects: number;
  certIssuer: string;
  reputationHits: number;
  suspiciousKeywords: string[];
}

export type PhishingVerdict =
  | 'safe'
  | 'suspicious'
  | 'phishing'
  | 'malicious'
  | 'unreachable';

export interface UrlIndicator {
  id: string;
  label: string;
  detail: string;
  weight: number;
  severity: Severity;
  detected: boolean;
}

export interface PhishingAnalysis {
  id: string;
  url: string;
  analyzedAt: string;
  riskScore: number;
  verdict: PhishingVerdict;
  severity: Severity;
  confidence: number;
  urlInfo: {
    protocol: string;
    domain: string;
    subdomain?: string;
    tld: string;
    path: string;
    query?: string;
    length: number;
    domainAge?: string;
    registrar?: string;
  };
  certificate: {
    issuer: string;
    valid: boolean;
    expiresAt: string;
    daysRemaining: number;
    evValidated: boolean;
  };
  indicators: UrlIndicator[];
  scanSteps: { index: number; label: string; state: 'pending' | 'running' | 'ok' | 'warning' | 'fail' }[];
  brandImpersonated?: string;
  recommendation: string;
  relatedThreatIds: string[];
}

export interface PhishingScanRecord {
  id: string;
  url: string;
  domain: string;
  scannedAt: string;
  riskScore: number;
  verdict: PhishingVerdict;
  severity: Severity;
  scannedBy: string;
}
