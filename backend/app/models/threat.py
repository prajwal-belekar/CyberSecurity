from sqlalchemy import Column, String, DateTime, Integer, Text, JSON, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.enums import Severity, EventStatus
from app.database import Base


class Threat(Base):
    __tablename__ = "threats"

    id = Column(Integer, primary_key=True, index=True)
    threat_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    threat_type = Column(String, nullable=False)
    severity = Column(Enum(Severity), nullable=False)
    status = Column(Enum(EventStatus), nullable=False)
    source = Column(String, nullable=False)
    target = Column(String, nullable=False)
    first_seen = Column(DateTime(timezone=True), nullable=False)
    last_seen = Column(DateTime(timezone=True), nullable=False)
    occurrences = Column(Integer, nullable=False)
    confidence = Column(String, nullable=True)  # Storing as string to match mock data format
    detection_rule = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    mitre = Column(JSON, nullable=True)
    indicators = Column(JSON, nullable=True)  # Storing as JSON array
    related_event_ids = Column(JSON, nullable=True)  # Storing as JSON array
    incident_id = Column(String, ForeignKey("incidents.incident_id"), nullable=True)
    recommended_actions = Column(JSON, nullable=True)  # Storing as JSON array
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    incident = relationship("Incident", foreign_keys=[incident_id])