from typing import List, Optional, Union, Dict, Any
from pydantic import BaseModel
from datetime import datetime


class ChatCitation(BaseModel):
    id: str
    label: str
    type: str
    href: Optional[str] = None


class ChatBlock(BaseModel):
    kind: str
    rows: Union[List[List[str]], Dict[str, str]]


class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str
    blocks: Optional[List[ChatBlock]] = None
    citations: Optional[List[ChatCitation]] = None
    confidence: Optional[float] = None
    status: Optional[str] = None
    error: Optional[str] = None


class InvestigationContext(BaseModel):
    incidentId: Optional[str] = None
    incidentTitle: Optional[str] = None
    severity: Optional[str] = None
    threatId: Optional[str] = None
    source: Optional[str] = None
    target: Optional[str] = None
    attachedEventIds: List[str] = []
    timeWindow: str = ""


class InvestigateRequest(BaseModel):
    question: str
    context: InvestigationContext