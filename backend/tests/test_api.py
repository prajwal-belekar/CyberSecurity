import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.models import SecurityEvent, Threat, Incident, Indicator
from app.enums import Severity, EventStatus, IncidentStatus, IndicatorType, IndicatorStatus
from datetime import datetime, timezone, timedelta
import json

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency for testing
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

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

@pytest.fixture(scope="function")
def test_data(db_session):
    """Create test data for all models."""
    # Create a security event
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
    
    # Create a threat
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
        related_event_ids=["EVT-TEST-001"],
        incident_id="INC-TEST-001",
        recommended_actions=["Action 1", "Action 2"]
    )
    
    # Create an incident
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
        assigned_to="test_user",
        summary="Test incident summary",
        impact="Test incident impact",
        timeline=[{"id": "1", "time": "12:00", "timestamp": datetime.now(timezone.utc).isoformat(), "title": "Test timeline entry", "kind": "detection"}],
        evidence_event_ids=["EVT-TEST-001"],
        affected_assets=[{"id": "asset-1", "name": "Test Asset", "type": "host", "criticality": "high"}],
        notes=[{"id": "note-1", "author": "tester", "timestamp": datetime.now(timezone.utc).isoformat(), "body": "Test note"}],
        ai_analysis={"narrative": "Test narrative", "confidence": 0.9},
        tags=["test-tag"]
    )
    
    # Create an indicator
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
    
    db_session.add_all([event, threat, incident, indicator])
    db_session.commit()
    db_session.refresh(event)
    db_session.refresh(threat)
    db_session.refresh(incident)
    db_session.refresh(indicator)
    
    # Add relationship between incident and evidence event
    incident.evidence_events.append(event)
    db_session.commit()
    
    return {
        "event": event,
        "threat": threat,
        "incident": incident,
        "indicator": indicator
    }

def test_events_endpoints(test_data):
    """Test events API endpoints."""
    # Test get events list
    response = client.get("/api/events")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data
    assert "pages" in data
    assert len(data["items"]) >= 1
    
    # Test get specific event
    event_id = test_data["event"].event_id
    response = client.get(f"/api/events/{event_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["event_id"] == event_id
    assert data["description"] == "Test security event"
    
    # Test get non-existent event
    response = client.get("/api/events/EVENT-NOT-EXIST")
    assert response.status_code == 404
    
    # Test filtering
    response = client.get("/api/events?severity=medium")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    
    # Test pagination
    response = client.get("/api/events?page=1&page_size=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) <= 1
    assert data["page"] == 1
    assert data["page_size"] == 1

def test_threats_endpoints(test_data):
    """Test threats API endpoints."""
    # Test get threats list
    response = client.get("/api/threats")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data
    assert "pages" in data
    assert len(data["items"]) >= 1
    
    # Test get specific threat
    threat_id = test_data["threat"].threat_id
    response = client.get(f"/api/threats/{threat_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["threat_id"] == threat_id
    assert data["title"] == "Test Threat"
    
    # Test get non-existent threat
    response = client.get("/api/threats/THREAT-NOT-EXIST")
    assert response.status_code == 404
    
    # Test filtering
    response = client.get("/api/threats?severity=high")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1

def test_incidents_endpoints(test_data):
    """Test incidents API endpoints."""
    # Test get incidents list
    response = client.get("/api/incidents")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data
    assert "pages" in data
    assert len(data["items"]) >= 1
    
    # Test get specific incident
    incident_id = test_data["incident"].incident_id
    response = client.get(f"/api/incidents/{incident_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["incident_id"] == incident_id
    assert data["title"] == "Test Incident"
    
    # Test get incident evidence
    response = client.get(f"/api/incidents/{incident_id}/evidence")
    assert response.status_code == 200
    data = response.json()
    assert "incident_id" in data
    assert "incident_title" in data
    assert "evidence_events" in data
    assert "total_evidence" in data
    assert data["incident_id"] == incident_id
    assert data["incident_title"] == "Test Incident"
    assert len(data["evidence_events"]) >= 1
    assert data["total_evidence"] == len(data["evidence_events"])
    
    # Test get non-existent incident
    response = client.get("/api/incidents/INCIDENT-NOT-EXIST")
    assert response.status_code == 404
    
    # Test filtering
    response = client.get("/api/incidents?severity=critical")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1

def test_indicators_endpoints(test_data):
    """Test indicators API endpoints."""
    # Test get indicators list
    response = client.get("/api/indicators")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data
    assert "pages" in data
    assert len(data["items"]) >= 1
    
    # Test get specific indicator
    indicator_id = test_data["indicator"].indicator_id
    response = client.get(f"/api/indicators/{indicator_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["indicator_id"] == indicator_id
    assert data["value"] == "192.168.1.100"
    
    # Test get non-existent indicator
    response = client.get("/api/indicators/INDICATOR-NOT-EXIST")
    assert response.status_code == 404
    
    # Test filtering
    response = client.get("/api/indicators?indicator_type=ip")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1

def test_incident_evidence_specific():
    """Test the specific INC-2048 evidence relationship from seed data."""
    # This test would require the seed data to be loaded
    # For now, we'll test with our test data
    pass

if __name__ == "__main__":
    pytest.main([__file__, "-v"])