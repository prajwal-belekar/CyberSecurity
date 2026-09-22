from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.threats import (
    ThreatResponse, 
    ThreatListResponse,
    ThreatUpdate
)
from app.services.threats import (
    get_threats,
    get_threat_by_id,
    get_threat_by_threat_id,
    update_threat_status,
    update_threat
)
from app.enums import Severity, EventStatus


router = APIRouter(prefix="/threats", tags=["threats"])


@router.get("/", response_model=ThreatListResponse)
def read_threats(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    severity: Optional[Severity] = Query(None, description="Filter by severity"),
    status: Optional[EventStatus] = Query(None, description="Filter by status"),
    threat_type: Optional[str] = Query(None, description="Filter by threat type"),
    source: Optional[str] = Query(None, description="Filter by source"),
    target: Optional[str] = Query(None, description="Filter by target"),
    sort_by: str = Query("last_seen", description="Sort by field"),
    sort_desc: bool = Query(True, description="Sort descending"),
    db: Session = Depends(get_db)
):
    """
    Get a paginated list of threats with optional filtering.
    
    - **page**: Page number (starts at 1)
    - **page_size**: Number of items per page (max 100)
    - **severity**: Filter by severity level
    - **status**: Filter by status
    - **threat_type**: Filter by threat type (partial match)
    - **source**: Filter by source (partial match)
    - **target**: Filter by target (partial match)
    - **sort_by**: Field to sort by
    - **sort_desc**: Whether to sort in descending order
    """
    threats, total = get_threats(
        db=db,
        page=page,
        page_size=page_size,
        severity=severity,
        status=status,
        threat_type=threat_type,
        source=source,
        target=target,
        sort_by=sort_by,
        sort_desc=sort_desc
    )
    
    pages = (total + page_size - 1) // page_size
    
    return ThreatListResponse(
        items=threats,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages
    )


@router.get("/{threat_id}", response_model=ThreatResponse)
def read_threat(
    threat_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific threat by its threat_id.
    
    - **threat_id**: The unique threat identifier
    """
    threat = get_threat_by_threat_id(db, threat_id)
    if not threat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Threat with ID {threat_id} not found"
        )
    return threat


@router.patch("/{threat_id}/status", response_model=ThreatResponse)
def update_threat_status_endpoint(
    threat_id: str,
    status: EventStatus,
    db: Session = Depends(get_db)
):
    """
    Update the status of a threat.
    
    - **threat_id**: The unique threat identifier
    - **status**: The new status
    """
    threat = get_threat_by_threat_id(db, threat_id)
    if not threat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Threat with ID {threat_id} not found"
        )
    
    updated_threat = update_threat_status(db, threat.id, status)
    if not updated_threat:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update threat status"
        )
    
    return updated_threat