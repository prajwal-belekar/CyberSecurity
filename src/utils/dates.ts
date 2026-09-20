/** Date/time helpers — the platform displays UTC-style operational timestamps. */

export const ISO = (d: Date | string | number): string => new Date(d).toISOString();

/** 2026-09-19 17:42:09 */
export function formatTimestamp(value: string | number | Date): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes(),
  )}:${p(d.getSeconds())}`;
}

/** 17:42:09 */
export function formatClock(value: string | number | Date): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '--:--:--';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** 17:42 */
export function formatClockShort(value: string | number | Date): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '--:--';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Sep 14 */
export function formatDay(value: string | number | Date): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** "2m ago" / "3h ago" / "4d ago" */
export function formatRelative(value: string | number | Date, now: number = Date.now()): string {
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return '—';
  const diff = Math.max(0, now - t);
  const s = Math.floor(diff / 1000);
  if (s < 10) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** Milliseconds covered by a TimeRange token. */
export const TIME_RANGE_MS: Record<string, number> = {
  '1H': 3_600_000,
  '6H': 21_600_000,
  '24H': 86_400_000,
  '7D': 604_800_000,
  '30D': 2_592_000_000,
  '90D': 7_776_000_000,
};

export function isWithinRange(timestamp: string, range: string, now = Date.now()): boolean {
  const window = TIME_RANGE_MS[range];
  if (!window) return true;
  return now - new Date(timestamp).getTime() <= window;
}

export function minutesAgo(minutes: number, from = Date.now()): string {
  return new Date(from - minutes * 60_000).toISOString();
}

export function hoursAgo(hours: number, from = Date.now()): string {
  return new Date(from - hours * 3_600_000).toISOString();
}

export function daysAgo(days: number, from = Date.now()): string {
  return new Date(from - days * 86_400_000).toISOString();
}
