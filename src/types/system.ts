import type { Severity } from './common';

export interface SystemMetrics {
  cpu: number;
  mem: number;
  netMbps: number;
  eventsPerSecond: number;
  latencyMs: number;
  totalEvents: number;
  uptimeSeconds: number;
}

export type SubsystemState = 'online' | 'degraded' | 'offline' | 'ready';

export interface Subsystem {
  id: string;
  name: string;
  state: SubsystemState;
  detail: string;
  latencyMs: number;
}

export interface SystemHealth {
  overall: 'operational' | 'degraded' | 'incident';
  subsystems: Subsystem[];
  engineVersion: string;
  rulesetVersion: string;
  lastRuleSync: string;
  database: { host: string; status: 'connected' | 'reconnecting'; records: number; replicationLagMs: number };
}

export interface AppSettings {
  theme: 'terminal-dark' | 'high-contrast';
  density: 'compact' | 'normal' | 'cozy';
  defaultTimeRange: string;
  autoRefresh: boolean;
  autoRefreshSeconds: number;
  bootSequence: boolean;
  liveEventStream: boolean;
  reduceMotion: boolean;
  showTerminalDock: boolean;
  notifications: {
    criticalAlerts: boolean;
    highAlerts: boolean;
    mediumAlerts: boolean;
    desktopToasts: boolean;
    emailNotifications: boolean;
    soundOnCritical: boolean;
  };
  api: {
    mode: 'mock' | 'live';
    baseUrl: string;
    timeoutMs: number;
  };
}

export interface ToastMessage {
  id: string;
  severity: Severity;
  title: string;
  description?: string;
  href?: string;
  durationMs?: number;
}
