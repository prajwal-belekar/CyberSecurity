const ATTACKER = '192.168.1.42';
const AUTH = 'AUTH-SERVICE';
export const SCENARIO_SCRIPT = [
    { atSeconds: 0, channel: 'SYSTEM', severity: 'info', type: 'Telemetry heartbeat', source: 'EVENT-MONITOR', target: 'pipeline', description: 'Event pipeline healthy — 428 events ingested this minute.' },
    { atSeconds: 12, channel: 'AUTH', severity: 'info', type: 'Login successful', source: '192.168.2.88', target: 'k.nakamura', description: 'MFA challenge passed on a known workstation.' },
    { atSeconds: 24, channel: 'NET', severity: 'info', type: 'DNS query', source: '10.0.0.15', target: 'resolver', description: 'Recursive resolution completed for an internal service name.' },
    { atSeconds: 38, channel: 'WARN', severity: 'medium', type: 'Failed authentication', source: ATTACKER, target: AUTH, description: 'Invalid credentials for user_207 from an unrecognized client fingerprint.', detectionRule: 'AUTH-010 failed-login' },
    { atSeconds: 52, channel: 'WARN', severity: 'medium', type: 'Failed authentication', source: ATTACKER, target: AUTH, description: 'Invalid credentials for admin — attempt cadence is constant.', detectionRule: 'AUTH-010 failed-login' },
    { atSeconds: 66, channel: 'WARN', severity: 'high', type: 'Failed authentication', source: ATTACKER, target: AUTH, description: 'Attempt 34 of 47. Username rotation observed across 22 accounts.', detectionRule: 'AUTH-010 failed-login' },
    { atSeconds: 80, channel: 'ALERT', severity: 'high', type: 'Repeated authentication failures', source: ATTACKER, target: AUTH, description: 'Velocity threshold exceeded — 25 failures inside a 6-minute window.', detectionRule: 'AUTH-021 velocity-threshold' },
    { atSeconds: 94, channel: 'THREAT', severity: 'critical', type: 'Potential brute-force activity', source: ATTACKER, target: AUTH, description: 'Correlated 47 failures across 31 usernames from a single source.', detectionRule: 'AUTH-044 brute-force-pattern', threatId: 'THR-1042' },
    { atSeconds: 106, channel: 'AUTH', severity: 'high', type: 'Account lockout enforced', source: AUTH, target: 'admin', description: 'Automatic lockout applied; source added to the temporary deny list.', detectionRule: 'AUTH-050 lockout-enforced', threatId: 'THR-1042' },
    { atSeconds: 118, channel: 'INCIDENT', severity: 'critical', type: 'Incident created', source: 'DETECTION-ENGINE', target: 'INC-2048', description: 'INC-2048 raised at priority P1 and routed to the on-call queue.', detectionRule: 'SOC-100 auto-incident', threatId: 'THR-1042', incidentId: 'INC-2048' },
    { atSeconds: 132, channel: 'NET', severity: 'high', type: 'Outbound transfer anomaly', source: ATTACKER, target: '203.0.113.87', description: '340 MB egress to a host matched by intelligence indicator IOC-0921.', detectionRule: 'NET-031 egress-anomaly', threatId: 'THR-1044', incidentId: 'INC-2048' },
    { atSeconds: 146, channel: 'INTEL', severity: 'medium', type: 'Indicator match', source: 'INTEL-SYNC', target: 'IOC-0921', description: 'Destination correlated with campaign "Autumn Relay" (UNC-2214).' },
    { atSeconds: 160, channel: 'AI', severity: 'info', type: 'Investigation summary ready', source: 'AI-ENGINE', target: 'INC-2048', description: 'Confidence 0.87 — automated credential stuffing with unverified egress.' },
    { atSeconds: 174, channel: 'SCAN', severity: 'info', type: 'Scheduled asset sweep complete', source: 'NETWORK-MONITOR', target: '4 VLANs', description: '128 hosts enumerated. 1 device with default credentials flagged.' },
    { atSeconds: 188, channel: 'SYSTEM', severity: 'info', type: 'Ruleset synchronized', source: 'INTEL-SYNC', target: 'ruleset 2026.09.4', description: '12 rules updated, 3 retired.' },
];
/** Total scripted loop length in seconds. */
export const SCENARIO_LENGTH_SECONDS = 200;
let scriptCounter = 0;
/** Materialises one scripted step into a full SecurityEvent. */
export function instantiateScriptEvent(step, now = Date.now()) {
    scriptCounter += 1;
    return {
        id: `EVT-LIVE-${String(scriptCounter).padStart(4, '0')}`,
        type: step.type,
        channel: step.channel,
        severity: step.severity,
        source: step.source,
        target: step.target,
        timestamp: new Date(now).toISOString(),
        status: step.severity === 'info' ? 'new' : 'investigating',
        description: step.description,
        detectionRule: step.detectionRule,
        threatId: step.threatId,
        incidentId: step.incidentId,
    };
}
