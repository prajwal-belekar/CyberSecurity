from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.enums import Severity, IncidentStatus


class IncidentBase(BaseModel):
    incident_id: str
    title: str
    severity: Severity
    priority: str  # p1, p2, p3, p4
    status: IncidentStatus
    threat_type: str
    source: str
    target: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    assigned_to: Optional[str] = None
    summary: str
    impact: Optional[str] = None
    timeline: Optional[List[dict]] = None
    evidence_event_ids: Optional[List[str]] = None
    affected_assets: Optional[List[dict]] = None
    notes: Optional[List[dict]] = None
    ai_analysis: Optional[dict] = None
    tags: Optional[List[str]] = None


class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    status: Optional[IncidentStatus] = None
    assigned_to: Optional[str] = None
    summary: Optional[str] = None
    impact: Optional[str] = None
    timeline: Optional[List[dict]] = None
    evidence_event_ids: Optional[List[str]] = None
    affected_assets: Optional[List[dict]] = None
    notes: Optional[List[dict]] = None
    ai_analysis: Optional[dict] = None
    tags: Optional[List[str]] = None


class IncidentResponse(IncidentBase):
    id: int

    class Config:
        from_attributes = True


class IncidentListResponse(BaseModel):
    items: List[IncidentResponse]
    total: int
    page: int
    page_size: int
    pages: int


class IncidentEvidenceResponse(BaseModel):
    incident_id: str
    incident_title: str
    evidence_events: List[dict]
    total_evidence: int