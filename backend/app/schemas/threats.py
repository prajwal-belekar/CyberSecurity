from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.enums import Severity, EventStatus


class ThreatBase(BaseModel):
    threat_id: str
    title: str
    threat_type: str
    severity: Severity
    status: EventStatus
    source: str
    target: str
    first_seen: datetime
    last_seen: datetime
    occurrences: int
    confidence: Optional[str] = None
    detection_rule: Optional[str] = None
    description: str
    mitre: Optional[dict] = None
    indicators: Optional[List[str]] = None
    related_event_ids: Optional[List[str]] = None
    incident_id: Optional[str] = None
    recommended_actions: Optional[List[str]] = None


class ThreatCreate(ThreatBase):
    pass


class ThreatUpdate(BaseModel):
    status: Optional[EventStatus] = None
    confidence: Optional[str] = None
    description: Optional[str] = None
    mitre: Optional[dict] = None
    indicators: Optional[List[str]] = None
    related_event_ids: Optional[List[str]] = None
    incident_id: Optional[str] = None
    recommended_actions: Optional[List[str]] = None


class ThreatResponse(ThreatBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ThreatListResponse(BaseModel):
    items: List[ThreatResponse]
    total: int
    page: int
    page_size: int
    pages: int