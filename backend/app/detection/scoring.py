from typing import Optional
from sqlalchemy.orm import Session
from app.models import SecurityEvent, Threat, Indicator
from app.enums import Severity


SEVERITY_WEIGHTS = {
    Severity.LOW: 1,
    Severity.MEDIUM: 3,
    Severity.HIGH: 7,
    Severity.CRITICAL: 15,
}

THREAT_TYPE_WEIGHTS = {
    "credential_access": 1.5,
    "data_exfiltration": 2.0,
    "reconnaissance": 0.8,
    "defense_evasion": 1.2,
    "malware": 2.5,
    "phishing": 1.8,
    "lateral_movement": 2.0,
    "persistence": 1.5,
}

INDICATOR_RISK_WEIGHTS = {
    "active": 1.5,
    "suspicious": 1.0,
    "benign": 0.1,
    "retired": 0.0,
}


def calculate_event_risk_score(event: SecurityEvent) -> float:
    base_score = SEVERITY_WEIGHTS.get(event.severity, 0)
    
    if event.detection_rule:
        rule_bonus = {
            "AUTH-001": 1,
            "AUTH-010": 2,
            "AUTH-021": 5,
            "AUTH-044": 10,
            "AUTH-050": 7,
            "NET-031": 8,
        }
        base_score += rule_bonus.get(event.detection_rule, 0)

    if event.threat_id:
        base_score *= 1.3

    if event.incident_id:
        base_score *= 1.5

    return round(base_score, 2)


def calculate_threat_risk_score(threat: Threat) -> float:
    base_score = SEVERITY_WEIGHTS.get(threat.severity, 0)
    base_score *= THREAT_TYPE_WEIGHTS.get(threat.threat_type, 1.0)
    base_score *= (1 + (threat.occurrences * 0.1))
    base_score *= float(threat.confidence or "0.5")
    
    if threat.incident_id:
        base_score *= 2.0

    if threat.mitre:
        base_score *= 1.2

    return round(base_score, 2)


def calculate_indicator_risk_score(indicator: Indicator) -> float:
    base_score = SEVERITY_WEIGHTS.get(indicator.risk, 0)
    base_score *= INDICATOR_RISK_WEIGHTS.get(indicator.status.value if hasattr(indicator.status, 'value') else str(indicator.status).lower(), 1.0)
    base_score *= float(indicator.confidence or "0.5")
    base_score *= (1 + min(indicator.related_events / 100, 1.0))

    return round(base_score, 2)


def get_risk_level(score: float) -> str:
    if score >= 50:
        return "CRITICAL"
    elif score >= 25:
        return "HIGH"
    elif score >= 10:
        return "MEDIUM"
    elif score >= 3:
        return "LOW"
    return "INFO"


def update_all_risk_scores(db: Session) -> dict:
    events = db.query(SecurityEvent).all()
    threats = db.query(Threat).all()
    indicators = db.query(Indicator).all()

    for event in events:
        event.event_metadata = event.event_metadata or {}
        event.event_metadata["risk_score"] = calculate_event_risk_score(event)

    for threat in threats:
        threat_confidence = float(threat.confidence or "0.5")
        threat.confidence = str(round(threat_confidence * 0.9 + calculate_threat_risk_score(threat) / 100 * 0.1, 2))

    for indicator in indicators:
        indicator.confidence = str(round(float(indicator.confidence or "0.5") * 0.9 + calculate_indicator_risk_score(indicator) / 100 * 0.1, 2))

    db.commit()

    return {
        "events_updated": len(events),
        "threats_updated": len(threats),
        "indicators_updated": len(indicators),
    }