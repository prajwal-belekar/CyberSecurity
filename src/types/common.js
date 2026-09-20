/**
 * Shared primitives used across every CyberSentinel domain model.
 * These mirror the payload shapes the future FastAPI backend will return,
 * so switching from mock → live transport requires no UI changes.
 */
export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'];
export const EVENT_STATUSES = [
    'new',
    'investigating',
    'contained',
    'resolved',
    'false_positive',
];
export const THREAT_TYPES = [
    'brute_force',
    'phishing',
    'malware',
    'port_scan',
    'suspicious_network',
    'auth_anomaly',
    'web_security',
    'data_exfiltration',
    'privilege_escalation',
];
