#!/usr/bin/env python
"""Development seed script for Phase 2 database models."""

from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.models import SecurityEvent, Threat, Incident, Indicator
from app.enums import Severity, EventStatus, IncidentStatus, IndicatorType, IndicatorStatus


def seed_data():
    db = SessionLocal()
    try:
        # Create Security Events
        events = [
            SecurityEvent(
                event_id="EVT-8841",
                timestamp=datetime.now(timezone.utc) - timedelta(minutes=21),
                event_type="Authentication probe",
                channel="AUTH",
                severity=Severity.LOW,
                source="192.168.1.42",
                target="AUTH-SERVICE",
                description="Single credential validation request from an unrecognized client fingerprint.",
                status=EventStatus.RESOLVED,
                detection_rule="AUTH-001 unusual-client",
                event_metadata={}
            ),
            SecurityEvent(
                event_id="EVT-8842",
                timestamp=datetime.now(timezone.utc) - timedelta(minutes=19),
                event_type="Failed login",
                channel="WARN",
                severity=Severity.MEDIUM,
                source="192.168.1.42",
                target="AUTH-SERVICE",
                description="Failed password authentication for user \"admin\".",
                status=EventStatus.INVESTIGATING,
                detection_rule="AUTH-010 failed-login",
                event_metadata={"threat_id": "THR-1042", "incident_id": "INC-2048"}
            ),
            SecurityEvent(
                event_id="EVT-8843",
                timestamp=datetime.now(timezone.utc) - timedelta(minutes=18),
                event_type="Failed login",
                channel="WARN",
                severity=Severity.MEDIUM,
                source="192.168.1.42",
                target="AUTH-SERVICE",
                description="Repeated failure - attempt 12 of 47 within 15 minutes.",
                status=EventStatus.INVESTIGATING,
                detection_rule="AUTH-010 failed-login",
                event_metadata={"threat_id": "THR-1042", "incident_id": "INC-2048"}
            ),
            SecurityEvent(
                event_id="EVT-8844",
                timestamp=datetime.now(timezone.utc) - timedelta(minutes=14),
                event_type="Repeated authentication failures",
                channel="ALERT",
                severity=Severity.HIGH,
                source="192.168.1.42",
                target="AUTH-SERVICE",
                description="Velocity threshold exceeded: 25 failures in under 6 minutes from a single source.",
                status=EventStatus.INVESTIGATING,
                detection_rule="AUTH-021 velocity-threshold",
                event_metadata={"threat_id": "THR-1042", "incident_id": "INC-2048"}
            ),
            SecurityEvent(
                event_id="EVT-8845",
                timestamp=datetime.now(timezone.utc) - timedelta(minutes=9),
                event_type="Potential brute-force activity",
                channel="THREAT",
                severity=Severity.CRITICAL,
                source="192.168.1.42",
                target="AUTH-SERVICE",
                description="Detection engine correlated 47 failures across 31 distinct usernames from one source.",
                status=EventStatus.INVESTIGATING,
                detection_rule="AUTH-044 brute-force-pattern",
                event_metadata={"threat_id": "THR-1042", "incident_id": "INC-2048"}
            ),
            SecurityEvent(
                event_id="EVT-8846",
                timestamp=datetime.now(timezone.utc) - timedelta(minutes=7),
                event_type="Account lockout enforced",
                channel="AUTH",
                severity=Severity.HIGH,
                source="AUTH-SERVICE",
                target="admin",
                description="Automatic lockout applied after threshold breach. Source added to temporary deny list.",
                status=EventStatus.CONTAINED,
                detection_rule="AUTH-050 lockout-enforced",
                event_metadata={"threat_id": "THR-1042", "incident_id": "INC-2048"}
            ),
            SecurityEvent(
                event_id="EVT-8847",
                timestamp=datetime.now(timezone.utc) - timedelta(minutes=6),
                event_type="Incident created",
                channel="INCIDENT",
                severity=Severity.CRITICAL,
                source="DETECTION-ENGINE",
                target="INC-2048",
                description="Incident INC-2048 raised and routed to the on-call analyst queue.",
                status=EventStatus.INVESTIGATING,
                detection_rule="SOC-100 auto-incident",
                event_metadata={"threat_id": "THR-1042", "incident_id": "INC-2048"}
            ),
            SecurityEvent(
                event_id="EVT-8848",
                timestamp=datetime.now(timezone.utc) - timedelta(minutes=4),
                event_type="Outbound data transfer anomaly",
                channel="NET",
                severity=Severity.HIGH,
                source="192.168.1.42",
                target="203.0.113.87",
                description="Workstation-07 transferred 340 MB to an external host matched against IOC-0921.",
                status=EventStatus.NEW,
                detection_rule="NET-031 egress-anomaly",
                event_metadata={"threat_id": "THR-1044", "incident_id": "INC-2048"}
            ),
        ]

        for event in events:
            db.add(event)

        db.flush()

        # Create Threats
        threats = [
            Threat(
                threat_id="THR-1042",
                title="Brute Force Attempt",
                threat_type="brute_force",
                severity=Severity.CRITICAL,
                status=EventStatus.INVESTIGATING,
                source="192.168.1.42",
                target="AUTH-SERVICE (10.0.0.16)",
                first_seen=datetime.now(timezone.utc) - timedelta(minutes=19),
                last_seen=datetime.now(timezone.utc) - timedelta(minutes=4),
                occurrences=47,
                confidence="0.94",
                detection_rule="AUTH-044 brute-force-pattern",
                description="A single source produced 47 failed authentication attempts against 31 distinct usernames in under 15 minutes. Username rotation, constant request cadence and a scripted user agent (curl/8.4.0) indicate automated credential stuffing rather than interactive logon.",
                mitre={"id": "T1110.004", "technique": "Brute Force: Credential Stuffing", "tactic": "Credential Access"},
                indicators=["192.168.1.42", "curl/8.4.0", "IOC-0921", "user_207"],
                related_event_ids=["EVT-8841", "EVT-8842", "EVT-8843", "EVT-8844", "EVT-8845", "EVT-8846"],
                incident_id="INC-2048",
                recommended_actions=[
                    "Confirm the account lockout is still enforced on AUTH-SERVICE",
                    "Add 192.168.1.42 to the perimeter deny list for 24 hours",
                    "Audit successful logons from the same source in the previous 7 days",
                    "Force MFA re-enrollment for any account that was targeted",
                ]
            ),
            Threat(
                threat_id="THR-1044",
                title="Unusual Network Connection",
                threat_type="data_exfiltration",
                severity=Severity.HIGH,
                status=EventStatus.INVESTIGATING,
                source="WORKSTATION-07 (192.168.1.42)",
                target="203.0.113.87:443",
                first_seen=datetime.now(timezone.utc) - timedelta(minutes=38),
                last_seen=datetime.now(timezone.utc) - timedelta(minutes=4),
                occurrences=14,
                confidence="0.77",
                detection_rule="NET-031 egress-anomaly",
                description="Outbound transfer volume from WORKSTATION-07 is 9x its 30-day baseline and terminates at an external host present in threat intelligence indicator IOC-0921. Transfers occur in fixed-size chunks consistent with staged exfiltration.",
                mitre={"id": "T1048", "technique": "Exfiltration Over Alternative Protocol", "tactic": "Exfiltration"},
                indicators=["203.0.113.87", "IOC-0921", "192.168.1.42"],
                related_event_ids=["EVT-8848"],
                incident_id="INC-2048",
                recommended_actions=[
                    "Isolate WORKSTATION-07 from the production VLAN",
                    "Capture and preserve 24 hours of flow data for forensics",
                    "Verify whether the destination was reached before or after the lockout",
                ]
            ),
        ]

        for threat in threats:
            db.add(threat)

        db.flush()

        # Create Incident
        incident = Incident(
            incident_id="INC-2048",
            title="Brute Force Attempt",
            severity=Severity.CRITICAL,
            priority="p1",
            status=IncidentStatus.INVESTIGATING,
            threat_type="brute_force",
            source="192.168.1.42",
            target="AUTH-SERVICE (10.0.0.16)",
            created_at=datetime.now(timezone.utc) - timedelta(minutes=6),
            updated_at=datetime.now(timezone.utc) - timedelta(minutes=1),
            assigned_to="a.reyes",
            summary="Automated credential stuffing against the authentication service. 47 failed logins across 31 usernames from a single internal workstation within 15 minutes, followed by an anomalous 340 MB outbound transfer from the same host.",
            impact="No confirmed account compromise. The targeted \"admin\" account was locked automatically. Potential data egress from WORKSTATION-07 is unverified and treated as the primary open question.",
            timeline=[
                {"id": "tl-1", "time": "14:01", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=21)).isoformat(), "title": "Authentication probe observed", "detail": "Unrecognized client fingerprint (curl/8.4.0) validates a single credential.", "kind": "detection", "actor": "DETECTION-ENGINE"},
                {"id": "tl-2", "time": "14:02", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=19)).isoformat(), "title": "Failed login", "detail": "user_207 - invalid credentials.", "kind": "detection"},
                {"id": "tl-3", "time": "14:03", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=18)).isoformat(), "title": "Failed login", "detail": "admin - invalid credentials (attempt 12).", "kind": "detection"},
                {"id": "tl-4", "time": "14:05", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=14)).isoformat(), "title": "Velocity threshold exceeded", "detail": "25 failures inside a 6-minute window triggered rule AUTH-021.", "kind": "escalation", "actor": "DETECTION-ENGINE"},
                {"id": "tl-5", "time": "14:10", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=9)).isoformat(), "title": "Brute-force pattern confirmed", "detail": "47 failures correlated across 31 distinct usernames from one source.", "kind": "escalation", "actor": "DETECTION-ENGINE"},
                {"id": "tl-6", "time": "14:12", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=7)).isoformat(), "title": "Account lockout enforced", "detail": "admin locked; source added to the temporary deny list.", "kind": "action", "actor": "AUTH-SERVICE"},
                {"id": "tl-7", "time": "14:13", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=6)).isoformat(), "title": "Incident created", "detail": "Routed to the on-call analyst queue as priority P1.", "kind": "system", "actor": "CYBERSENTINEL"},
                {"id": "tl-8", "time": "14:15", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=4)).isoformat(), "title": "Egress anomaly detected", "detail": "340 MB transferred from WORKSTATION-07 to 203.0.113.87 (IOC-0921).", "kind": "escalation", "actor": "NETWORK-MONITOR"},
                {"id": "tl-9", "time": "14:17", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=2)).isoformat(), "title": "Assigned to a.reyes", "detail": "Analyst acknowledged the incident.", "kind": "action", "actor": "a.reyes"},
            ],
            evidence_event_ids=["EVT-8841", "EVT-8842", "EVT-8843", "EVT-8844", "EVT-8845", "EVT-8846", "EVT-8847", "EVT-8848"],
            affected_assets=[
                {"id": "asset-1", "name": "AUTH-SERVICE", "type": "service", "ip": "10.0.0.16", "owner": "platform-team", "criticality": "critical", "compromised": False},
                {"id": "asset-2", "name": "WORKSTATION-07", "type": "endpoint", "ip": "192.168.1.42", "owner": "k.nakamura", "criticality": "high", "compromised": True},
                {"id": "asset-3", "name": "admin", "type": "account", "owner": "identity-team", "criticality": "critical", "compromised": False},
                {"id": "asset-4", "name": "DATABASE-01", "type": "database", "ip": "10.0.0.20", "owner": "data-team", "criticality": "high", "compromised": False},
            ],
            notes=[
                {"id": "note-1", "author": "a.reyes", "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=2)).isoformat(), "body": "Lockout confirmed active. Pulling 7 days of successful logons from 192.168.1.42 to rule out prior access before we treat this as contained."},
            ],
            ai_analysis={
                "narrative": "The evidence is consistent with automated credential stuffing rather than a targeted interactive attack. 47 authentication failures were observed from 192.168.1.42 within a 15-minute window, spread across 31 distinct usernames, with a constant inter-request cadence and a scripted user agent (curl/8.4.0). No authentication succeeded, and the \"admin\" account was locked automatically after the threshold breach. The material open question is the 340 MB outbound transfer from the same host to 203.0.113.87 four minutes after lockout - that host matches intelligence indicator IOC-0921, so the workstation should be treated as potentially compromised until flow data is reviewed.",
                "confidence": 0.87,
                "related_events": 12,
                "probable_attack_chain": [
                    "Reconnaissance - username enumeration against AUTH-SERVICE",
                    "Credential Access - automated password guessing (T1110.004)",
                    "Defense Evasion - attempt stopped after lockout enforcement",
                    "Possible Exfiltration - unverified egress to IOC-0921 (T1048)",
                ],
                "suggested_next_steps": [
                    "Isolate WORKSTATION-07 and preserve volatile memory before any reimaging",
                    "Review 24 hours of NetFlow for 192.168.1.42 -> 203.0.113.87",
                    "Check whether the egress began before or after the first failed login",
                    "Sweep the estate for hash a82f19c4...93bc, seen on the same host 9 hours earlier",
                    "Force credential rotation for every username that appeared in the attempt list",
                ],
                "false_positive_likelihood": 0.06,
            },
            tags=["credential-access", "auth-service", "possible-exfil", "p1"]
        )

        db.add(incident)
        db.flush()

        # Create Indicators
        indicators = [
            Indicator(
                indicator_id="IOC-0921",
                value="203.0.113.87",
                indicator_type=IndicatorType.IP,
                risk=Severity.CRITICAL,
                status=IndicatorStatus.ACTIVE,
                first_seen=datetime.now(timezone.utc) - timedelta(days=9),
                last_seen=datetime.now(timezone.utc) - timedelta(minutes=4),
                source="Internal telemetry",
                confidence="0.93",
                related_events=17,
                tags=["c2", "beaconing", "exfil"],
                threat_actor="UNC-2214",
                campaign="Autumn Relay",
                country="Reserved / documentation range",
                description="Command-and-control endpoint observed receiving staged HTTPS beacons from WORKSTATION-07. Matched by three independent detection rules within a 24-hour window.",
                whois={},
                references=["INC-2048", "INC-2045", "THR-1044"]
            ),
            Indicator(
                indicator_id="IOC-0915",
                value="192.168.1.42",
                indicator_type=IndicatorType.IP,
                risk=Severity.HIGH,
                status=IndicatorStatus.SUSPICIOUS,
                first_seen=datetime.now(timezone.utc) - timedelta(minutes=21),
                last_seen=datetime.now(timezone.utc) - timedelta(minutes=4),
                source="Internal telemetry",
                confidence="0.9",
                related_events=47,
                tags=["brute-force", "internal", "compromised-host"],
                description="Internal workstation responsible for 47 failed authentication attempts and an anomalous 340 MB egress transfer. Correlates with IOC-0921 and IOC-0917.",
                whois={},
                references=["INC-2048", "THR-1042"]
            ),
            Indicator(
                indicator_id="IOC-0917",
                value="a82f19c4d7e3b91c5560f2a94b1e0c3d88f7a21e6c40b5d93f18a7e2c60493bc",
                indicator_type=IndicatorType.HASH,
                risk=Severity.CRITICAL,
                status=IndicatorStatus.ACTIVE,
                first_seen=datetime.now(timezone.utc) - timedelta(hours=9),
                last_seen=datetime.now(timezone.utc) - timedelta(hours=6),
                source="Malware analyzer",
                confidence="0.97",
                related_events=3,
                tags=["loader", "persistence", "pe32"],
                threat_actor="UNC-2214",
                description="SHA-256 of a packed PE32 loader that writes a registry Run key and beacons to IOC-0921. Flagged by 41 of 72 engines during controlled detonation.",
                whois={},
                references=["INC-2045", "THR-1039"]
            ),
        ]

        for indicator in indicators:
            db.add(indicator)

        # Add relationships between incident and evidence events
        for event in events:
            incident.evidence_events.append(event)

        db.commit()
        print("Seed data created successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()