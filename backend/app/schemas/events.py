from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.enums import Severity, EventStatus


class SecurityEventBase(BaseModel):
    event_id: str
    timestamp: datetime
    event_type: str
    channel: str
    severity: Severity
    source: str
    target: Optional[str] = None
    description: str
    status: EventStatus
    detection_rule: Optional[str] = None
    threat_id: Optional[str] = None
    incident_id: Optional[str] = None
    event_metadata: Optional[dict] = None


class SecurityEventCreate(SecurityEventBase):
    pass


class SecurityEventUpdate(BaseModel):
    status: Optional[EventStatus] = None
    event_metadata: Optional[dict] = None
    threat_id: Optional[str] = None
    incident_id: Optional[str] = None


class SecurityEventResponse(SecurityEventBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SecurityEventListResponse(BaseModel):
    items: List[SecurityEventResponse]
    total: int
    page: int
    page_size: int
    pages: int