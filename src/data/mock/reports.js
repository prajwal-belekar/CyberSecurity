import { daysAgo, hoursAgo, minutesAgo } from '@/utils/dates';
export const REPORT_TYPE_META = {
    security_summary: { label: 'Security Summary', description: 'Executive overview of posture, detections and remediation progress across the reporting period.' },
    incident: { label: 'Incident Report', description: 'Per-incident chronology, evidence, affected assets, actions taken and residual risk.' },
    threat: { label: 'Threat Report', description: 'Detected threat activity grouped by type, severity, source and MITRE ATT&CK technique.' },
    network: { label: 'Network Report', description: 'Traffic posture, blocked connections, top talkers and segmentation observations.' },
    authentication: { label: 'Authentication Report', description: 'Login outcomes, MFA coverage, lockouts and anomalous access sequences.' },
};
export const REPORTS = [
    {
        id: 'RPT-0148', title: 'Weekly Security Summary — Week 38', type: 'security_summary',
        status: 'ready', generatedAt: hoursAgo(3), periodStart: daysAgo(7), periodEnd: hoursAgo(3),
        generatedBy: 'a.reyes', format: 'PDF', sizeKb: 842, classification: 'INTERNAL',
        summary: '428 events recorded, 3 critical threats, 5 active incidents. Mean time to detect held at 4 minutes with no SLA breaches.',
        relatedIncidentIds: ['INC-2048', 'INC-2047', 'INC-2045'],
        sections: [
            { heading: 'Executive summary', body: 'Detection coverage remained stable through the reporting week. The dominant activity was automated credential access against the authentication service, which was contained automatically within 7 minutes of first observation.', metrics: [{ label: 'Total events', value: '428' }, { label: 'Critical threats', value: '3' }, { label: 'Active incidents', value: '5' }, { label: 'MTTD', value: '4 min' }] },
            { heading: 'Detection performance', body: 'Automated containment handled 417 blocked connections and 4 account lockouts without analyst intervention. Two incidents required manual investigation.', metrics: [{ label: 'Blocked connections', value: '417' }, { label: 'Auto-contained', value: '2' }, { label: 'Manual review', value: '3' }] },
            { heading: 'Outstanding risk', body: 'WORKSTATION-07 remains the primary open question. An unverified 340 MB egress transfer to a known indicator was observed after the host was locked out, so the endpoint is treated as potentially compromised until flow data is reviewed.', metrics: [{ label: 'Open P1', value: '1' }, { label: 'Assets pending reimage', value: '1' }] },
            { heading: 'Recommendations', body: 'Enforce MFA re-enrollment for all accounts targeted during the credential-stuffing run, complete the segmentation review of the facilities VLAN, and add a Content-Security-Policy to the public application endpoint.' },
        ],
    },
    {
        id: 'RPT-0147', title: 'Incident Report — INC-2048 Brute Force Attempt', type: 'incident',
        status: 'ready', generatedAt: minutesAgo(24), periodStart: minutesAgo(21), periodEnd: minutesAgo(1),
        generatedBy: 'system', format: 'PDF', sizeKb: 411, classification: 'CONFIDENTIAL',
        summary: 'Full chronology of the credential-stuffing incident against AUTH-SERVICE, including correlated egress anomaly and AI-assisted analysis.',
        relatedIncidentIds: ['INC-2048'],
        sections: [
            { heading: 'Incident overview', body: 'Incident INC-2048 was raised automatically at priority P1 after the detection engine correlated 47 authentication failures across 31 usernames from 192.168.1.42 within a 15-minute window.', metrics: [{ label: 'Severity', value: 'CRITICAL' }, { label: 'Status', value: 'INVESTIGATING' }, { label: 'Assigned', value: 'a.reyes' }] },
            { heading: 'Chronology', body: '14:01 probe observed · 14:02–14:10 escalating failures · 14:10 pattern confirmed · 14:12 lockout enforced · 14:13 incident created · 14:15 egress anomaly detected.' },
            { heading: 'Evidence', body: 'Eight correlated security events, one host telemetry record and one threat-intelligence match (IOC-0921).', metrics: [{ label: 'Events', value: '8' }, { label: 'Indicators matched', value: '1' }, { label: 'Confidence', value: '0.87' }] },
            { heading: 'Residual risk', body: 'Unconfirmed data egress from the source workstation. Isolation and forensic capture are recommended before reimaging.' },
        ],
    },
    {
        id: 'RPT-0146', title: 'Threat Activity Report — 30 days', type: 'threat',
        status: 'ready', generatedAt: daysAgo(1), periodStart: daysAgo(30), periodEnd: daysAgo(1),
        generatedBy: 'k.nakamura', format: 'CSV', sizeKb: 214, classification: 'INTERNAL',
        summary: 'Threat volume by category and severity over 30 days, with MITRE ATT&CK technique mapping for all confirmed detections.',
        relatedIncidentIds: [],
        sections: [
            { heading: 'Volume', body: 'Authentication-related detections dominate at 41% of total threat volume, followed by network anomalies at 26%.', metrics: [{ label: 'Threats', value: '106' }, { label: 'Critical', value: '9' }, { label: 'High', value: '34' }] },
            { heading: 'Technique mapping', body: 'T1110.004 credential stuffing, T1046 network service discovery and T1547.001 registry Run keys account for the majority of confirmed activity.' },
        ],
    },
    {
        id: 'RPT-0145', title: 'Network Posture Report — Q3', type: 'network',
        status: 'draft', generatedAt: daysAgo(2), periodStart: daysAgo(90), periodEnd: daysAgo(2),
        generatedBy: 'm.okafor', format: 'PDF', sizeKb: 1_204, classification: 'INTERNAL',
        summary: 'Segmentation review covering 128 connected devices, blocked-connection trends and the facilities VLAN isolation work.',
        relatedIncidentIds: ['INC-2046'],
        sections: [
            { heading: 'Topology', body: '128 devices across four VLANs. The facilities segment remains the least controlled and hosts devices with default credentials.', metrics: [{ label: 'Devices', value: '128' }, { label: 'VLANs', value: '4' }, { label: 'Blocked connections', value: '417' }] },
            { heading: 'Findings', body: 'Two hosts advertise unnecessary open ports (445, 3389). One IoT device still uses factory credentials.' },
        ],
    },
    {
        id: 'RPT-0144', title: 'Authentication Review — September', type: 'authentication',
        status: 'ready', generatedAt: daysAgo(4), periodStart: daysAgo(30), periodEnd: daysAgo(4),
        generatedBy: 'j.lindqvist', format: 'PDF', sizeKb: 623, classification: 'CONFIDENTIAL',
        summary: 'Login outcomes, MFA coverage at 78%, lockout analysis and anomalous access sequences for the month.',
        relatedIncidentIds: ['INC-2047'],
        sections: [
            { heading: 'Outcomes', body: '1,284 successful and 187 failed authentications. MFA coverage stands at 78%, below the 95% target.', metrics: [{ label: 'Successful', value: '1,284' }, { label: 'Failed', value: '187' }, { label: 'MFA coverage', value: '78%' }] },
            { heading: 'Anomalies', body: 'Three access sequences required review; one was confirmed malicious, one abandoned and one resolved as legitimate user retry behaviour.' },
        ],
    },
    {
        id: 'RPT-0143', title: 'Incident Report — INC-2045 Sandbox Detonation', type: 'incident',
        status: 'ready', generatedAt: hoursAgo(30), periodStart: hoursAgo(9), periodEnd: hoursAgo(6),
        generatedBy: 'a.reyes', format: 'JSON', sizeKb: 188, classification: 'RESTRICTED',
        summary: 'Controlled detonation results for the packed loader submitted from WORKSTATION-07, including extracted IOCs and MITRE mapping.',
        relatedIncidentIds: ['INC-2045'],
        sections: [
            { heading: 'Sample', body: 'PE32 executable, packed, unsigned. Flagged by 41 of 72 engines.', metrics: [{ label: 'Detection ratio', value: '41/72' }, { label: 'Risk score', value: '93/100' }] },
            { heading: 'Behavior', body: 'Persistence via registry Run key, detached child process, time-based sandbox evasion and an HTTPS beacon to IOC-0921.' },
            { heading: 'Indicators published', body: 'Nine indicators were exported to the intelligence store and pushed to endpoint blocklists.' },
        ],
    },
];
