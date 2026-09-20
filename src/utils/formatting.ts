/** Presentation helpers for the dense, technical metadata the SOC UI displays. */

export function padNumber(value: number, width = 2): string {
  return String(Math.max(0, Math.round(value))).padStart(width, '0');
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : decimals)} ${units[i]}`;
}

export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/** a82f19c4…d7e3b91c — truncation for hashes and long identifiers. */
export function truncateMiddle(value: string, head = 12, tail = 8): string {
  if (!value) return '';
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function maskIp(ip: string, visibleOctets = 2): string {
  const parts = ip.split('.');
  if (parts.length !== 4) return ip;
  return parts.map((p, i) => (i < visibleOctets ? p : 'x')).join('.');
}

/** ████████░░ 80% — HUD style block meter. */
export function blockMeter(percent: number, width = 10): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * width);
  return `${'█'.repeat(filled)}${'░'.repeat(Math.max(0, width - filled))}`;
}

export function formatDelta(delta: number): string {
  if (delta === 0) return '±0%';
  return `${delta > 0 ? '↑' : '↓'} ${Math.abs(delta)}%`;
}

export function titleCase(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initials(value: string): string {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}
