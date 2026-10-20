from dataclasses import dataclass
from typing import Callable, Optional
from app.models import SecurityEvent
from app.enums import Severity, EventStatus


@dataclass
class DetectionRule:
    rule_id: str
    name: str
    description: str
    severity: Severity
    condition: Callable[[SecurityEvent], bool]
    threat_type: str
    mitre_id: Optional[str] = None
    mitre_technique: Optional[str] = None
    mitre_tactic: Optional[str] = None


def auth_001_unusual_client(event: SecurityEvent) -> bool:
    return (
        event.event_type == "Authentication probe"
        and event.channel == "AUTH"
        and "unrecognized client fingerprint" in (event.description or "").lower()
    )


def auth_010_failed_login(event: SecurityEvent) -> bool:
    return (
        event.event_type == "Failed login"
        and event.channel == "WARN"
        and event.severity in [Severity.MEDIUM, Severity.HIGH]
    )


def auth_021_velocity_threshold(event: SecurityEvent) -> bool:
    return (
        event.event_type == "Repeated authentication failures"
        and event.channel == "ALERT"
        and event.severity == Severity.HIGH
        and "velocity threshold exceeded" in (event.description or "").lower()
    )


def auth_044_brute_force_pattern(event: SecurityEvent) -> bool:
    return (
        event.event_type == "Potential brute-force activity"
        and event.channel == "THREAT"
        and event.severity == Severity.CRITICAL
        and "credential stuffing" in (event.description or "").lower()
    )


def auth_050_lockout_enforced(event: SecurityEvent) -> bool:
    return (
        event.event_type == "Account lockout enforced"
        and event.channel == "AUTH"
        and event.severity == Severity.HIGH
        and "lockout" in (event.description or "").lower()
    )


def net_031_egress_anomaly(event: SecurityEvent) -> bool:
    return (
        event.event_type == "Outbound data transfer anomaly"
        and event.channel == "NET"
        and event.severity in [Severity.HIGH, Severity.CRITICAL]
        and "egress" in (event.description or "").lower()
    )


DETECTION_RULES: list[DetectionRule] = [
    DetectionRule(
        rule_id="AUTH-001",
        name="Unusual Client Fingerprint",
        description="Single credential validation request from an unrecognized client fingerprint",
        severity=Severity.LOW,
        condition=auth_001_unusual_client,
        threat_type="reconnaissance",
        mitre_id="T1590.005",
        mitre_technique="Active Scanning: Credential Stuffing",
        mitre_tactic="Reconnaissance",
    ),
    DetectionRule(
        rule_id="AUTH-010",
        name="Failed Login",
        description="Failed password authentication attempt",
        severity=Severity.MEDIUM,
        condition=auth_010_failed_login,
        threat_type="credential_access",
        mitre_id="T1110",
        mitre_technique="Brute Force",
        mitre_tactic="Credential Access",
    ),
    DetectionRule(
        rule_id="AUTH-021",
        name="Velocity Threshold Exceeded",
        description="High frequency of failed authentication attempts from single source",
        severity=Severity.HIGH,
        condition=auth_021_velocity_threshold,
        threat_type="credential_access",
        mitre_id="T1110.004",
        mitre_technique="Brute Force: Credential Stuffing",
        mitre_tactic="Credential Access",
    ),
    DetectionRule(
        rule_id="AUTH-044",
        name="Brute Force Pattern Confirmed",
        description="Correlated credential stuffing pattern across multiple usernames",
        severity=Severity.CRITICAL,
        condition=auth_044_brute_force_pattern,
        threat_type="credential_access",
        mitre_id="T1110.004",
        mitre_technique="Brute Force: Credential Stuffing",
        mitre_tactic="Credential Access",
    ),
    DetectionRule(
        rule_id="AUTH-050",
        name="Account Lockout Enforced",
        description="Automatic account lockout after threshold breach",
        severity=Severity.HIGH,
        condition=auth_050_lockout_enforced,
        threat_type="defense_evasion",
        mitre_id="T1562.001",
        mitre_technique="Impair Defenses: Disable or Modify Tools",
        mitre_tactic="Defense Evasion",
    ),
    DetectionRule(
        rule_id="NET-031",
        name="Egress Data Anomaly",
        description="Unusual outbound data transfer to known malicious destination",
        severity=Severity.HIGH,
        condition=net_031_egress_anomaly,
        threat_type="data_exfiltration",
        mitre_id="T1048",
        mitre_technique="Exfiltration Over Alternative Protocol",
        mitre_tactic="Exfiltration",
    ),
]


def get_applicable_rules(event: SecurityEvent) -> list[DetectionRule]:
    return [rule for rule in DETECTION_RULES if rule.condition(event)]


def evaluate_event(event: SecurityEvent) -> list[DetectionRule]:
    return get_applicable_rules(event)