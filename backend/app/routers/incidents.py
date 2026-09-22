from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.incidents import (
    IncidentResponse, 
    IncidentListResponse,
    IncidentUpdate,
    IncidentEvidenceResponse
)
from app.services.incidents import (
    get_incidents,
    get_incident_by_id,
    get_incident_by_incident_id,
    get_incident_evidence,
    update_incident_status,
    update_incident
)
from app.enums import Severity, IncidentStatus


router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.get("/", response_model=IncidentListResponse)
def read_incidents(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    severity: Optional[Severity] = Query(None, description="Filter by severity"),
    status: Optional[IncidentStatus] = Query(None, description="Filter by status"),
    threat_type: Optional[str] = Query(None, description="Filter by threat type"),
    source: Optional[str] = Query(None, description="Filter by source"),
    target: Optional[str] = Query(None, description="Filter by target"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned analyst"),
    sort_by: str = Query("updated_at", description="Sort by field"),
    sort_desc: bool = Query(True, description="Sort descending"),
    db: Session = Depends(get_db)
):
    """
    Get a paginated list of incidents with optional filtering.
    
    - **page**: Page number (starts at 1)
    - **page_size**: Number of items per page (max 100)
    - **severity**: Filter by severity level
    - **status**: Filter by status
    - **threat_type**: Filter by threat type (partial match)
    - **source**: Filter by source (partial match)
    - **target**: Filter by target (partial match)
    - **assigned_to**: Filter by assigned analyst (partial match)
    - **sort_by**: Field to sort by
    - **sort_desc**: Whether to sort in descending order
    """
    incidents, total = get_incidents(
        db=db,
        page=page,
        page_size=page_size,
        severity=severity,
        status=status,
        threat_type=threat_type,
        source=source,
        target=target,
        assigned_to=assigned_to,
        sort_by=sort_by,
        sort_desc=sort_desc
    )
    
    pages = (total + page_size - 1) // page_size
    
    return IncidentListResponse(
        items=incidents,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages
    )


@router.get("/{incident_id}", response_model=IncidentResponse)
def read_incident(
    incident_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific incident by its incident_id.
    
    - **incident_id**: The unique incident identifier
    """
    incident = get_incident_by_incident_id(db, incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with ID {incident_id} not found"
        )
    return incident


@router.get("/{incident_id}/evidence", response_model=IncidentEvidenceResponse)
def read_incident_evidence(
    incident_id: str,
    db: Session = Depends(get_db)
):
    """
    Get all evidence events associated with a specific incident.
    
    - **incident_id**: The unique incident identifier
    
    Returns the incident details along with all associated evidence events.
    For INC-2048, this should return exactly 8 evidence events.
    """
    incident = get_incident_by_incident_id(db, incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with ID {incident_id} not found"
        )
    
    incident_obj, evidence_events = get_incident_evidence(db, incident.id)
    
    # Convert evidence events to dict for response
    evidence_list = []
    for event in evidence_events:
        evidence_list.append({
            "id": event.id,
            "event_id": event.event_id,
            "timestamp": event.timestamp.isoformat() if event.timestamp else None,
            "event_type": event.event_type,
            "channel": event.channel,
            "severity": event.severity.value if hasattr(event.severity, 'value') else str(event.severity),
            "source": event.source,
            "target": event.target,
            "description": event.description,
            "status": event.status.value if hasattr(event.status, 'value') else str(event.status),
            "detection_rule": event.detection_rule,
            "threat_id": event.threat_id,
            "incident_id": event.incident_id,
            "event_metadata": event.event_metadata
        })
    
    return IncidentEvidenceResponse(
        incident_id=incident.incident_id,
        incident_title=incident.title,
        evidence_events=evidence_list,
        total_evidence=len(evidence_list)
    )


@router.patch("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status_endpoint(
    incident_id: str,
    status: IncidentStatus,
    db: Session = Depends(get_db)
):
    """
    Update the status of an incident.
    
    - **incident_id**: The unique incident identifier
    - **status**: The new status
    """
    incident = get_incident_by_incident_id(db, incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with ID {incident_id} not found"
        )
    
    updated_incident = update_incident_status(db, incident.id, status)
    if not updated_incident:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update incident status"
        )
    
    return updated_incident