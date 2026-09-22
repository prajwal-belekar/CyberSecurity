from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.enums import IndicatorType, Severity, IndicatorStatus


class IndicatorBase(BaseModel):
    indicator_id: str
    value: str
    indicator_type: IndicatorType
    risk: Severity
    status: IndicatorStatus
    first_seen: datetime
    last_seen: datetime
    source: str
    confidence: Optional[str] = None
    related_events: int
    tags: Optional[List[str]] = None
    threat_actor: Optional[str] = None
    campaign: Optional[str] = None
    country: Optional[str] = None
    description: str
    whois: Optional[dict] = None
    references: Optional[List[str]] = None


class IndicatorCreate(IndicatorBase):
    pass


class IndicatorUpdate(BaseModel):
    status: Optional[IndicatorStatus] = None
    confidence: Optional[str] = None
    related_events: Optional[int] = None
    tags: Optional[List[str]] = None
    threat_actor: Optional[str] = None
    campaign: Optional[str] = None
    country: Optional[str] = None
    description: Optional[str] = None
    whois: Optional[dict] = None
    references: Optional[List[str]] = None


class IndicatorResponse(IndicatorBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class IndicatorListResponse(BaseModel):
    items: List[IndicatorResponse]
    total: int
    page: int
    page_size: int
    pages: int