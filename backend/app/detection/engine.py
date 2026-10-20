from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.models import SecurityEvent, Threat, Incident
from app.enums import Severity, EventStatus, IncidentStatus
from app.detection.rules import evaluate_event, DETECTION_RULES
from app.websocket import notify_threat_update, notify_incident_update
import asyncio


class DetectionEngine:
    def __init__(self, db: Session):
        self.db = db

    def process_event(self, event: SecurityEvent) -> list[str]:
        matched_rules = evaluate_event(event)
        triggered_rule_ids = []

        for rule in matched_rules:
            event.detection_rule = rule.rule_id
            event.severity = rule.severity
            triggered_rule_ids.append(rule.rule_id)

            threat = self._correlate_to_threat(event, rule)
            if threat:
                self._maybe_create_incident(threat)

        if triggered_rule_ids:
            self.db.commit()

        return triggered_rule_ids

    def _correlate_to_threat(self, event: SecurityEvent, rule) -> Optional[Threat]:
        existing_threat = self.db.query(Threat).filter(
            Threat.source == event.source,
            Threat.threat_type == rule.threat_type,
            Threat.status == EventStatus.INVESTIGATING
        ).first()

        if existing_threat:
            existing_threat.occurrences += 1
            existing_threat.last_seen = event.timestamp
            if event.threat_id:
                existing_threat.threat_id = event.threat_id
            if rule.rule_id:
                existing_threat.detection_rule = rule.rule_id
            if event.event_id not in (existing_threat.related_event_ids or []):
                existing_threat.related_event_ids.append(event.event_id)
            event.threat_id = existing_threat.threat_id
            # Notify threat update
            self._notify_threat_update(existing_threat)
            return existing_threat

        new_threat = Threat(
            threat_id=f"THR-{int(datetime.now().timestamp())}",
            title=rule.name,
            threat_type=rule.threat_type,
            severity=rule.severity,
            status=EventStatus.INVESTIGATING,
            source=event.source,
            target=event.target or "Unknown",
            first_seen=event.timestamp,
            last_seen=event.timestamp,
            occurrences=1,
            confidence="0.85",
            detection_rule=rule.rule_id,
            description=rule.description,
            mitre={
                "id": rule.mitre_id,
                "technique": rule.mitre_technique,
                "tactic": rule.mitre_tactic
            } if rule.mitre_id else None,
            indicators=[event.source] + ([event.target] if event.target else []),
            related_event_ids=[event.event_id],
            incident_id=None,
            recommended_actions=self._get_recommended_actions(rule.threat_type),
        )
        self.db.add(new_threat)
        self.db.flush()
        event.threat_id = new_threat.threat_id
        # Notify new threat
        self._notify_threat_update(new_threat, is_new=True)
        return new_threat

    def _maybe_create_incident(self, threat: Threat) -> Optional[Incident]:
        if threat.severity not in [Severity.HIGH, Severity.CRITICAL]:
            return None

        existing_incident = self.db.query(Incident).filter(
            Incident.threat_type == threat.threat_type,
            Incident.source == threat.source,
            Incident.status.in_([IncidentStatus.OPEN, IncidentStatus.INVESTIGATING])
        ).first()

        if existing_incident:
            return existing_incident

        if threat.occurrences < 3 and threat.severity != Severity.CRITICAL:
            return None

        incident = Incident(
            incident_id=f"INC-{int(datetime.now().timestamp())}",
            title=threat.title,
            severity=threat.severity,
            priority="p1" if threat.severity == Severity.CRITICAL else "p2",
            status=IncidentStatus.INVESTIGATING,
            threat_type=threat.threat_type,
            source=threat.source,
            target=threat.target,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            assigned_to="auto-assigned",
            summary=f"Auto-generated incident from threat {threat.threat_id}. {threat.description}",
            impact="Under investigation.",
            timeline=[
                {
                    "id": f"tl-{int(datetime.now().timestamp())}",
                    "time": datetime.now(timezone.utc).strftime("%H:%M"),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "title": "Incident auto-created",
                    "detail": f"Detection engine correlated threat {threat.threat_id} with {threat.occurrences} occurrences",
                    "kind": "system",
                    "actor": "DETECTION-ENGINE"
                }
            ],
            evidence_event_ids=threat.related_event_ids or [],
            affected_assets=[],
            notes=[],
            ai_analysis={},
            tags=[threat.threat_type, "auto-generated"]
        )
        self.db.add(incident)
        self.db.flush()

        threat.incident_id = incident.incident_id
        self.db.commit()
        # Notify new incident
        self._notify_incident_update(incident, is_new=True)
        return incident

    def _get_recommended_actions(self, threat_type: str) -> list[str]:
        actions_map = {
            "credential_access": [
                "Confirm account lockout is enforced",
                "Add source IP to deny list",
                "Audit successful logons from source",
                "Force MFA re-enrollment for targeted accounts"
            ],
            "data_exfiltration": [
                "Isolate affected workstation",
                "Capture flow data for forensics",
                "Verify data transfer timeline"
            ],
            "reconnaissance": [
                "Monitor source for escalation",
                "Review firewall rules"
            ],
            "defense_evasion": [
                "Verify lockout persistence",
                "Check for bypass attempts"
            ]
        }
        return actions_map.get(threat_type, ["Investigate and contain"])

    def _notify_threat_update(self, threat: Threat, is_new: bool = False):
        # Handle datetime fields that might be strings from DB
        def fmt_dt(dt):
            if dt is None:
                return None
            if hasattr(dt, 'isoformat'):
                return dt.isoformat()
            return str(dt)

        threat_dict = {
            "id": threat.id,
            "threat_id": threat.threat_id,
            "title": threat.title,
            "threat_type": threat.threat_type,
            "severity": threat.severity.value if hasattr(threat.severity, 'value') else str(threat.severity),
            "status": threat.status.value if hasattr(threat.status, 'value') else str(threat.status),
            "source": threat.source,
            "target": threat.target,
            "first_seen": fmt_dt(threat.first_seen),
            "last_seen": fmt_dt(threat.last_seen),
            "occurrences": threat.occurrences,
            "confidence": threat.confidence,
            "detection_rule": threat.detection_rule,
            "description": threat.description,
            "mitre": threat.mitre,
            "indicators": threat.indicators,
            "related_event_ids": threat.related_event_ids,
            "incident_id": threat.incident_id,
            "is_new": is_new,
        }
        notify_threat_update(threat_dict)

    def _notify_incident_update(self, incident: Incident, is_new: bool = False):
        def fmt_dt(dt):
            if dt is None:
                return None
            if hasattr(dt, 'isoformat'):
                return dt.isoformat()
            return str(dt)

        incident_dict = {
            "id": incident.id,
            "incident_id": incident.incident_id,
            "title": incident.title,
            "severity": incident.severity.value if hasattr(incident.severity, 'value') else str(incident.severity),
            "priority": incident.priority,
            "status": incident.status.value if hasattr(incident.status, 'value') else str(incident.status),
            "threat_type": incident.threat_type,
            "source": incident.source,
            "target": incident.target,
            "created_at": fmt_dt(incident.created_at),
            "updated_at": fmt_dt(incident.updated_at),
            "assigned_to": incident.assigned_to,
            "summary": incident.summary,
            "is_new": is_new,
        }
        notify_incident_update(incident_dict)

    def reprocess_all_events(self) -> int:
        events = self.db.query(SecurityEvent).filter(
            SecurityEvent.detection_rule.is_(None)
        ).all()

        total_triggered = 0
        for event in events:
            triggered = self.process_event(event)
            total_triggered += len(triggered)

        return total_triggered


def run_detection_on_new_event(db: Session, event: SecurityEvent) -> list[str]:
    engine = DetectionEngine(db)
    return engine.process_event(event)