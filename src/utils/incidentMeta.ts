import type { IncidentPriority, IncidentStatus } from '@/types/incident';

export interface PriorityMeta {
  label: string;
  className: string;
  rank: number;
  responseTargetMinutes: number;
}

const PRIORITY_META: Record<IncidentPriority, PriorityMeta> = {
  p1: { label: 'P1', className: 'border-critical/40 bg-critical/10 text-critical', rank: 1, responseTargetMinutes: 15 },
  p2: { label: 'P2', className: 'border-high/40 bg-high/10 text-high', rank: 2, responseTargetMinutes: 30 },
  p3: { label: 'P3', className: 'border-medium/40 bg-medium/10 text-medium', rank: 3, responseTargetMinutes: 120 },
  p4: { label: 'P4', className: 'border-low/40 bg-low/10 text-low', rank: 4, responseTargetMinutes: 480 },
};

export interface IncidentStatusMeta {
  label: string;
  text: string;
  className: string;
  accent: string;
  rank: number;
  terminal: boolean;
}

const STATUS_META: Record<IncidentStatus, IncidentStatusMeta> = {
  open: { label: 'OPEN', text: 'text-critical', className: 'border-critical/40 bg-critical/10 text-critical', accent: 'var(--color-critical)', rank: 1, terminal: false },
  investigating: { label: 'INVESTIGATING', text: 'text-high', className: 'border-high/40 bg-high/10 text-high', accent: 'var(--color-high)', rank: 2, terminal: false },
  contained: { label: 'CONTAINED', text: 'text-medium', className: 'border-medium/40 bg-medium/10 text-medium', accent: 'var(--color-medium)', rank: 3, terminal: false },
  resolved: { label: 'RESOLVED', text: 'text-term', className: 'border-term/40 bg-term/10 text-term', accent: 'var(--color-term)', rank: 4, terminal: true },
  false_positive: { label: 'FALSE POSITIVE', text: 'text-info', className: 'border-info/40 bg-info/10 text-info', accent: 'var(--color-info)', rank: 5, terminal: true },
};

/** Board column order — active work first. */
export const INCIDENT_STATUS_ORDER: IncidentStatus[] = ['open', 'investigating', 'contained', 'resolved', 'false_positive'];

export const priorityMeta = (priority: IncidentPriority): PriorityMeta => PRIORITY_META[priority];
export const statusMetaFor = (status: IncidentStatus): IncidentStatusMeta => STATUS_META[status];

/** SLA position: 'ok' | 'warning' | 'breached' for the elapsed clock. */
export function slaState(createdAt: string, priority: IncidentPriority, status: IncidentStatus, now = Date.now()): { label: string; tone: 'term' | 'medium' | 'critical'; elapsedMinutes: number } {
  const elapsedMinutes = Math.max(0, Math.round((now - +new Date(createdAt)) / 60000));
  const target = PRIORITY_META[priority].responseTargetMinutes;
  if (STATUS_META[status].terminal) return { label: 'CLOCK STOPPED', tone: 'term', elapsedMinutes };
  if (elapsedMinutes > target) return { label: `SLA BREACHED · ${elapsedMinutes}m / ${target}m`, tone: 'critical', elapsedMinutes };
  if (elapsedMinutes > target * 0.7) return { label: `AT RISK · ${elapsedMinutes}m / ${target}m`, tone: 'medium', elapsedMinutes };
  return { label: `WITHIN SLA · ${elapsedMinutes}m / ${target}m`, tone: 'term', elapsedMinutes };
}
