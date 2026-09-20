import type { Severity } from './common';

export type AuthStatus =
  | 'success'
  | 'failed'
  | 'locked'
  | 'mfa_challenge'
  | 'mfa_failed'
  | 'suspicious'
  | 'blocked';

export interface AuthenticationEvent {
  id: string;
  timestamp: string;
  user: string;
  userId: string;
  ip: string;
  location: string;
  country: string;
  countryCode: string;
  method: 'password' | 'mfa' | 'sso' | 'api_key' | 'certificate';
  device: string;
  status: AuthStatus;
  risk: Severity;
  failureReason?: string;
  attemptNumber?: number;
  userAgent?: string;
}

export interface AuthSummary {
  successful: number;
  failed: number;
  suspicious: number;
  lockedAccounts: number;
  totalToday: number;
  mfaCoverage: number;
  uniqueUsers: number;
  topFailingUsers: { user: string; failures: number }[];
  topSourceIps: { ip: string; attempts: number; blocked: boolean }[];
}

export interface AuthSequence {
  id: string;
  user: string;
  ip: string;
  startedAt: string;
  endedAt: string;
  attempts: number;
  outcome: 'blocked' | 'compromised' | 'abandoned' | 'recovered';
  risk: Severity;
  events: AuthenticationEvent[];
  pattern: string;
}
