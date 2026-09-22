from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.events import (
    SecurityEventResponse, 
    SecurityEventListResponse,
    SecurityEventUpdate
)
from app.services.events import (
    get_events,
    get_event_by_id,
    get_event_by_event_id,
    update_event_status,
    update_event
)
from app.enums import Severity, EventStatus


router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=SecurityEventListResponse)
def read_events(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    severity: Optional[Severity] = Query(None, description="Filter by severity"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    source: Optional[str] = Query(None, description="Filter by source"),
    target: Optional[str] = Query(None, description="Filter by target"),
    status: Optional[EventStatus] = Query(None, description="Filter by status"),
    channel: Optional[str] = Query(None, description="Filter by channel"),
    sort_by: str = Query("timestamp", description="Sort by field"),
    sort_desc: bool = Query(True, description="Sort descending"),
    db: Session = Depends(get_db)
):
    """
    Get a paginated list of security events with optional filtering.
    
    - **page**: Page number (starts at 1)
    - **page_size**: Number of items per page (max 100)
    - **severity**: Filter by severity level
    - **event_type**: Filter by event type (partial match)
    - **source**: Filter by source (partial match)
    - **target**: Filter by target (partial match)
    - **status**: Filter by status
    - **channel**: Filter by channel (partial match)
    - **sort_by**: Field to sort by
    - **sort_desc**: Whether to sort in descending order
    """
    events, total = get_events(
        db=db,
        page=page,
        page_size=page_size,
        severity=severity,
        event_type=event_type,
        source=source,
        target=target,
        status=status,
        channel=channel,
        sort_by=sort_by,
        sort_desc=sort_desc
    )
    
    pages = (total + page_size - 1) // page_size
    
    return SecurityEventListResponse(
        items=events,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages
    )


@router.get("/{event_id}", response_model=SecurityEventResponse)
def read_event(
    event_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific security event by its event_id.
    
    - **event_id**: The unique event identifier
    """
    event = get_event_by_event_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID {event_id} not found"
        )
    return event


@router.patch("/{event_id}/status", response_model=SecurityEventResponse)
def update_event_status_endpoint(
    event_id: str,
    status: EventStatus,
    db: Session = Depends(get_db)
):
    """
    Update the status of a security event.
    
    - **event_id**: The unique event identifier
    - **status**: The new status
    """
    event = get_event_by_event_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID {event_id} not found"
        )
    
    updated_event = update_event_status(db, event.id, status)
    if not updated_event:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update event status"
        )
    
    return updated_event