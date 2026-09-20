export const SEVERITY_META = {
    critical: {
        key: 'critical', label: 'CRITICAL', short: 'CRIT', rank: 5,
        text: 'text-critical', bg: 'bg-critical', soft: 'bg-critical/10',
        border: 'border-critical/40', hex: '#de6375', glyph: '✖',
    },
    high: {
        key: 'high', label: 'HIGH', short: 'HIGH', rank: 4,
        text: 'text-high', bg: 'bg-high', soft: 'bg-high/10',
        border: 'border-high/40', hex: '#dd8a52', glyph: '▲',
    },
    medium: {
        key: 'medium', label: 'MEDIUM', short: 'MED', rank: 3,
        text: 'text-medium', bg: 'bg-medium', soft: 'bg-medium/10',
        border: 'border-medium/40', hex: '#d0a94f', glyph: '◆',
    },
    low: {
        key: 'low', label: 'LOW', short: 'LOW', rank: 2,
        text: 'text-low', bg: 'bg-low', soft: 'bg-low/10',
        border: 'border-low/40', hex: '#5fae7a', glyph: '▽',
    },
    info: {
        key: 'info', label: 'INFO', short: 'INFO', rank: 1,
        text: 'text-info', bg: 'bg-info', soft: 'bg-info/10',
        border: 'border-info/40', hex: '#4f9ac4', glyph: 'ℹ',
    },
};
export const severityMeta = (severity) => SEVERITY_META[severity] ?? SEVERITY_META.info;
export const severityRank = (severity) => severityMeta(severity).rank;
/** Stable ordering: most severe first, newest first as tiebreak. */
export function compareBySeverity(a, b) {
    return severityRank(b) - severityRank(a);
}
export const STATUS_META = {
    new: { label: 'NEW', className: 'text-cyber border-cyber/35 bg-cyber/10' },
    investigating: { label: 'INVESTIGATING', className: 'text-medium border-medium/35 bg-medium/10' },
    contained: { label: 'CONTAINED', className: 'text-volt border-volt/35 bg-volt/10' },
    resolved: { label: 'RESOLVED', className: 'text-term border-term/35 bg-term/10' },
    false_positive: { label: 'FALSE POSITIVE', className: 'text-ink-3 border-line-3 bg-raised' },
};
export const INCIDENT_STATUS_META = {
    open: { label: 'OPEN', className: 'text-high border-high/35 bg-high/10' },
    investigating: { label: 'INVESTIGATING', className: 'text-medium border-medium/35 bg-medium/10' },
    contained: { label: 'CONTAINED', className: 'text-volt border-volt/35 bg-volt/10' },
    resolved: { label: 'RESOLVED', className: 'text-term border-term/35 bg-term/10' },
    false_positive: { label: 'FALSE POSITIVE', className: 'text-ink-3 border-line-3 bg-raised' },
};
export const statusMeta = (status) => STATUS_META[status] ?? STATUS_META.new;
export const THREAT_TYPE_LABELS = {
    brute_force: 'Brute Force',
    phishing: 'Phishing',
    malware: 'Malware',
    port_scan: 'Port Scan',
    suspicious_network: 'Suspicious Network Activity',
    auth_anomaly: 'Authentication Anomaly',
    web_security: 'Web Security',
    data_exfiltration: 'Data Exfiltration',
    privilege_escalation: 'Privilege Escalation',
};
export const threatTypeLabel = (type) => THREAT_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
