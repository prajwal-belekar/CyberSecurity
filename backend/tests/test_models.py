import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import SecurityEvent, Threat, Incident, Indicator
from app.enums import Severity, EventStatus, IncidentStatus, IndicatorType, IndicatorStatus
from datetime import datetime, timezone, timedelta
import json

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    # Create the database and tables
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def test_create_security_event(db_session):
    """Test that a SecurityEvent can be created."""
    event = SecurityEvent(
        event_id="EVT-TEST-001",
        timestamp=datetime.now(timezone.utc),
        event_type="Test Event",
        channel="TEST",
        severity=Severity.MEDIUM,
        source="192.168.1.1",
        target="192.168.1.2",
        description="Test security event",
        status=EventStatus.NEW,
        detection_rule="TEST-001",
        event_metadata={"key": "value"}
    )
    
    db_session.add(event)
    db_session.commit()
    db_session.refresh(event)
    
    assert event.id is not None
    assert event.event_id == "EVT-TEST-001"
    assert event.event_type == "Test Event"
    assert event.severity == Severity.MEDIUM
    assert event.status == EventStatus.NEW
    assert event.description == "Test security event"
    assert event.event_metadata == {"key": "value"}


def test_create_threat(db_session):
    """Test that a Threat can be created."""
    threat = Threat(
        threat_id="THR-TEST-001",
        title="Test Threat",
        threat_type="test_type",
        severity=Severity.HIGH,
        status=EventStatus.INVESTIGATING,
        source="192.168.1.100",
        target="10.0.0.1",
        first_seen=datetime.now(timezone.utc) - timedelta(hours=1),
        last_seen=datetime.now(timezone.utc),
        occurrences=5,
        confidence="0.85",
        detection_rule="TEST-THREAT-001",
        description="Test threat description",
        mitre={"id": "T1001", "technique": "Test Technique", "tactic": "Test Tactic"},
        indicators=["192.168.1.100", "test.com"],
        related_event_ids=["EVT-TEST-001", "EVT-TEST-002"],
        recommended_actions=["Action 1", "Action 2"]
    )
    
    db_session.add(threat)
    db_session.commit()
    db_session.refresh(threat)
    
    assert threat.id is not None
    assert threat.threat_id == "THR-TEST-001"
    assert threat.title == "Test Threat"
    assert threat.severity == Severity.HIGH
    assert threat.status == EventStatus.INVESTIGATING
    assert threat.description == "Test threat description"
    assert threat.mitre == {"id": "T1001", "technique": "Test Technique", "tactic": "Test Tactic"}
    assert threat.indicators == ["192.168.1.100", "test.com"]


def test_create_incident(db_session):
    """Test that an Incident can be created."""
    incident = Incident(
        incident_id="INC-TEST-001",
        title="Test Incident",
        severity=Severity.CRITICAL,
        priority="p1",
        status=IncidentStatus.OPEN,
        threat_type="test_threat",
        source="192.168.1.50",
        target="10.0.0.50",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        summary="Test incident summary",
        impact="Test incident impact",
        timeline=[{"id": "1", "time": "12:00", "timestamp": datetime.now(timezone.utc).isoformat(), "title": "Test timeline entry", "kind": "detection"}],
        evidence_event_ids=["EVT-TEST-001", "EVT-TEST-002"],
        affected_assets=[{"id": "asset-1", "name": "Test Asset", "type": "host", "criticality": "high"}],
        notes=[{"id": "note-1", "author": "tester", "timestamp": datetime.now(timezone.utc).isoformat(), "body": "Test note"}],
        ai_analysis={"narrative": "Test narrative", "confidence": 0.9},
        tags=["test-tag"]
    )
    
    db_session.add(incident)
    db_session.commit()
    db_session.refresh(incident)
    
    assert incident.id is not None
    assert incident.incident_id == "INC-TEST-001"
    assert incident.title == "Test Incident"
    assert incident.severity == Severity.CRITICAL
    assert incident.priority == "p1"
    assert incident.status == IncidentStatus.OPEN
    assert incident.summary == "Test incident summary"
    assert incident.impact == "Test incident impact"
    assert incident.tags == ["test-tag"]


def test_create_indicator(db_session):
    """Test that an Indicator can be created."""
    indicator = Indicator(
        indicator_id="IOC-TEST-001",
        value="192.168.1.100",
        indicator_type=IndicatorType.IP,
        risk=Severity.HIGH,
        status=IndicatorStatus.ACTIVE,
        first_seen=datetime.now(timezone.utc) - timedelta(days=1),
        last_seen=datetime.now(timezone.utc),
        source="Test Source",
        confidence="0.95",
        related_events=10,
        tags=["test", "indicator"],
        threat_actor="Test Actor",
        campaign="Test Campaign",
        country="Test Country",
        description="Test indicator description",
        whois={"registrar": "Test Registrar"},
        references=["REF-TEST-001"]
    )
    
    db_session.add(indicator)
    db_session.commit()
    db_session.refresh(indicator)
    
    assert indicator.id is not None
    assert indicator.indicator_id == "IOC-TEST-001"
    assert indicator.value == "192.168.1.100"
    assert indicator.indicator_type == IndicatorType.IP
    assert indicator.risk == Severity.HIGH
    assert indicator.status == IndicatorStatus.ACTIVE
    assert indicator.confidence == "0.95"
    assert indicator.related_events == 10
    assert indicator.tags == ["test", "indicator"]
    assert indicator.description == "Test indicator description"


def test_evidence_relationship(db_session):
    """Test that the evidence relationship between incidents and security events works."""
    # Create security events
    event1 = SecurityEvent(
        event_id="EVT-REL-001",
        timestamp=datetime.now(timezone.utc),
        event_type="Test Event 1",
        channel="TEST",
        severity=Severity.LOW,
        source="192.168.1.1",
        target="192.168.1.2",
        description="Test security event 1",
        status=EventStatus.NEW,
        event_metadata={}
    )
    
    event2 = SecurityEvent(
        event_id="EVT-REL-002",
        timestamp=datetime.now(timezone.utc),
        event_type="Test Event 2",
        channel="TEST",
        severity=Severity.MEDIUM,
        source="192.168.1.3",
        target="192.168.1.4",
        description="Test security event 2",
        status=EventStatus.NEW,
        event_metadata={}
    )
    
    # Create incident
    incident = Incident(
        incident_id="INC-REL-001",
        title="Test Incident for Relationship",
        severity=Severity.MEDIUM,
        priority="p2",
        status=IncidentStatus.OPEN,
        threat_type="test",
        source="192.168.1.100",
        target="10.0.0.100",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        summary="Test incident for relationship testing",
        impact="Test impact",
        evidence_event_ids=["EVT-REL-001", "EVT-REL-002"]
    )
    
    # Add relationships
    incident.evidence_events.append(event1)
    incident.evidence_events.append(event2)
    
    db_session.add_all([event1, event2, incident])
    db_session.commit()
    db_session.refresh(incident)
    db_session.refresh(event1)
    db_session.refresh(event2)
    
    # Test that incident has the evidence events
    assert len(incident.evidence_events) == 2
    event_ids = [e.event_id for e in incident.evidence_events]
    assert "EVT-REL-001" in event_ids
    assert "EVT-REL-002" in event_ids
    
    # Test that events have the incident
    assert len(event1.incidents) == 1
    assert len(event2.incidents) == 1
    assert event1.incidents[0].incident_id == "INC-REL-001"
    assert event2.incidents[0].incident_id == "INC-REL-001"


def test_duplicate_event_id_rejected(db_session):
    """Test that duplicate event_id is rejected."""
    event1 = SecurityEvent(
        event_id="EVT-DUP-001",
        timestamp=datetime.now(timezone.utc),
        event_type="Test Event 1",
        channel="TEST",
        severity=Severity.LOW,
        source="192.168.1.1",
        target="192.168.1.2",
        description="Test security event 1",
        status=EventStatus.NEW
    )
    
    event2 = SecurityEvent(
        event_id="EVT-DUP-001",  # Same event_id
        timestamp=datetime.now(timezone.utc),
        event_type="Test Event 2",
        channel="TEST",
        severity=Severity.MEDIUM,
        source="192.168.1.3",
        target="192.168.1.4",
        description="Test security event 2",
        status=EventStatus.NEW
    )
    
    db_session.add(event1)
    db_session.commit()
    
    db_session.add(event2)
    with pytest.raises(Exception):
        db_session.commit()


def test_duplicate_incident_id_rejected(db_session):
    """Test that duplicate incident_id is rejected."""
    incident1 = Incident(
        incident_id="INC-DUP-001",
        title="Test Incident 1",
        severity=Severity.LOW,
        priority="p2",
        status=IncidentStatus.OPEN,
        threat_type="test",
        source="192.168.1.100",
        target="10.0.0.100",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        summary="Test incident 1",
        impact="Test impact 1"
    )
    
    incident2 = Incident(
        incident_id="INC-DUP-001",  # Same incident_id
        title="Test Incident 2",
        severity=Severity.MEDIUM,
        priority="p1",
        status=IncidentStatus.INVESTIGATING,
        threat_type="test2",
        source="192.168.1.200",
        target="10.0.0.200",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        summary="Test incident 2",
        impact="Test impact 2"
    )
    
    db_session.add(incident1)
    db_session.commit()
    
    db_session.add(incident2)
    with pytest.raises(Exception):
        db_session.commit()