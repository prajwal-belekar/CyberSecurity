from sqlalchemy import Column, String, DateTime, Integer, Text, JSON, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.enums import Severity, IncidentStatus
from app.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    severity = Column(Enum(Severity), nullable=False)
    priority = Column(String, nullable=False)  # p1, p2, p3, p4
    status = Column(Enum(IncidentStatus), nullable=False)
    threat_type = Column(String, nullable=False)
    source = Column(String, nullable=False)
    target = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    assigned_to = Column(String, nullable=True)
    summary = Column(Text, nullable=False)
    impact = Column(Text, nullable=True)
    timeline = Column(JSON, nullable=True)  # Storing as JSON array
    evidence_event_ids = Column(JSON, nullable=True)  # Storing as JSON array
    affected_assets = Column(JSON, nullable=True)  # Storing as JSON array
    notes = Column(JSON, nullable=True)  # Storing as JSON array
    ai_analysis = Column(JSON, nullable=True)
    tags = Column(JSON, nullable=True)  # Storing as JSON array
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    evidence_events = relationship("SecurityEvent", secondary="incident_evidence", back_populates="incidents")
    threats = relationship("Threat", foreign_keys="Threat.incident_id", back_populates="incident")