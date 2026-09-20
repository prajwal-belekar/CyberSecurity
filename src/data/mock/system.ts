import type { Subsystem, SystemHealth, SystemMetrics } from '@/types/system';
import { minutesAgo } from '@/utils/dates';

export const SUBSYSTEMS: Subsystem[] = [
  { id: 'engine', name: 'SECURITY ENGINE', state: 'online', detail: 'Correlation + detection pipeline', latencyMs: 12 },
  { id: 'events', name: 'EVENT MONITOR', state: 'online', detail: 'Ingesting 428 events/min', latencyMs: 8 },
  { id: 'network', name: 'NETWORK MONITOR', state: 'online', detail: '128 hosts · 1,842 sessions', latencyMs: 14 },
  { id: 'auth', name: 'AUTH MONITOR', state: 'online', detail: 'SSO + local auth providers', latencyMs: 11 },
  { id: 'sandbox', name: 'MALWARE SANDBOX', state: 'ready', detail: 'Isolated detonation environment idle', latencyMs: 46 },
  { id: 'ai', name: 'AI ENGINE', state: 'ready', detail: 'Investigation model loaded', latencyMs: 21 },
  { id: 'intel', name: 'INTEL SYNC', state: 'online', detail: '5 feeds · last sync 2m ago', latencyMs: 132 },
  { id: 'db', name: 'DATABASE', state: 'online', detail: 'Primary + 1 read replica', latencyMs: 4 },
];

export const SYSTEM_HEALTH: SystemHealth = {
  overall: 'operational',
  subsystems: SUBSYSTEMS,
  engineVersion: '3.8.2',
  rulesetVersion: '2026.09.4',
  lastRuleSync: minutesAgo(2),
  database: { host: 'pg-primary.internal', status: 'connected', records: 12_840_117, replicationLagMs: 140 },
};

export const BASELINE_METRICS: SystemMetrics = {
  cpu: 42,
  mem: 61,
  netMbps: 18.2,
  eventsPerSecond: 7.1,
  latencyMs: 21,
  totalEvents: 428,
  uptimeSeconds: 384_210,
};

export const BOOT_LINES = [
  { label: 'Initializing interface', state: 'OK' as const },
  { label: 'Loading threat engine', state: 'OK' as const },
  { label: 'Loading network monitor', state: 'OK' as const },
  { label: 'Loading intelligence module', state: 'OK' as const },
  { label: 'Connecting to event stream', state: 'OK' as const },
  { label: 'AI subsystem ready', state: 'OK' as const },
];

/**
 * Terminal-flavoured copy shown while a lazy route chunk loads (spec §34).
 * Keyed by route prefix; longest match wins. Presentational, served
 * synchronously through `systemApi.routeLoadingLabel()`.
 */
export const ROUTE_LOADING_LABELS: ReadonlyArray<readonly [prefix: string, label: string]> = [
  ['/threat-intelligence', 'Loading intelligence feeds'],
  ['/ai-assistant', 'Connecting AI subsystem'],
  ['/web-security', 'Loading authorized scan engine'],
  ['/authentication', 'Loading authentication telemetry'],
  ['/dashboard', 'Initializing command center'],
  ['/threats', 'Initializing threat engine'],
  ['/network', 'Connecting network monitor'],
  ['/phishing', 'Loading URL analyzer'],
  ['/malware', 'Initializing malware sandbox'],
  ['/incidents', 'Loading incident queue'],
  ['/analytics', 'Fetching security telemetry'],
  ['/reports', 'Loading report library'],
  ['/settings', 'Loading workspace configuration'],
];

export const DEFAULT_LOADING_LABEL = 'Loading workspace';
