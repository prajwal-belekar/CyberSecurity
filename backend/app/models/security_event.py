from sqlalchemy import Column, String, DateTime, Integer, Text, JSON, Enum, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.enums import Severity, EventStatus
from app.database import Base

# Import the association table
from app.models.incident_evidence import incident_evidence


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    event_type = Column(String, nullable=False)
    channel = Column(String, nullable=False)
    severity = Column(Enum(Severity), nullable=False)
    source = Column(String, nullable=False)
    target = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    status = Column(Enum(EventStatus), nullable=False)
    detection_rule = Column(String, nullable=True)
    threat_id = Column(String, nullable=True)
    incident_id = Column(String, nullable=True)
    event_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    incidents = relationship("Incident", secondary=incident_evidence, back_populates="evidence_events")