from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from typing import List, Optional, Tuple
from app.models import SecurityEvent
from app.enums import Severity, EventStatus


def get_events(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    severity: Optional[Severity] = None,
    event_type: Optional[str] = None,
    source: Optional[str] = None,
    target: Optional[str] = None,
    status: Optional[EventStatus] = None,
    channel: Optional[str] = None,
    sort_by: str = "timestamp",
    sort_desc: bool = True
) -> Tuple[List[SecurityEvent], int]:
    """
    Get paginated list of security events with filtering.
    
    Args:
        db: Database session
        page: Page number (1-based)
        page_size: Number of items per page
        severity: Filter by severity level
        event_type: Filter by event type
        source: Filter by source
        target: Filter by target
        status: Filter by status
        channel: Filter by channel
        sort_by: Field to sort by
        sort_desc: Whether to sort in descending order
        
    Returns:
        Tuple of (events list, total count)
    """
    query = db.query(SecurityEvent)
    
    # Apply filters
    if severity:
        query = query.filter(SecurityEvent.severity == severity)
    if event_type:
        query = query.filter(SecurityEvent.event_type.ilike(f"%{event_type}%"))
    if source:
        query = query.filter(SecurityEvent.source.ilike(f"%{source}%"))
    if target:
        query = query.filter(SecurityEvent.target.ilike(f"%{target}%"))
    if status:
        query = query.filter(SecurityEvent.status == status)
    if channel:
        query = query.filter(SecurityEvent.channel.ilike(f"%{channel}%"))
    
    # Get total count
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(SecurityEvent, sort_by, SecurityEvent.timestamp)
    if sort_desc:
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Apply pagination
    offset = (page - 1) * page_size
    events = query.offset(offset).limit(page_size).all()
    
    return events, total


def get_event_by_id(db: Session, event_id: int) -> Optional[SecurityEvent]:
    """
    Get a security event by its ID.
    
    Args:
        db: Database session
        event_id: The event ID
        
    Returns:
        SecurityEvent object or None if not found
    """
    return db.query(SecurityEvent).filter(SecurityEvent.id == event_id).first()


def get_event_by_event_id(db: Session, event_id: str) -> Optional[SecurityEvent]:
    """
    Get a security event by its event_id string.
    
    Args:
        db: Database session
        event_id: The event ID string
        
    Returns:
        SecurityEvent object or None if not found
    """
    return db.query(SecurityEvent).filter(SecurityEvent.event_id == event_id).first()


def update_event_status(db: Session, event_id: int, status: EventStatus) -> Optional[SecurityEvent]:
    """
    Update the status of a security event.
    
    Args:
        db: Database session
        event_id: The event ID
        status: New status
        
    Returns:
        Updated SecurityEvent object or None if not found
    """
    event = get_event_by_id(db, event_id)
    if event:
        event.status = status
        db.commit()
        db.refresh(event)
    return event


def update_event(db: Session, event_id: int, event_update) -> Optional[SecurityEvent]:
    """
    Update a security event.
    
    Args:
        db: Database session
        event_id: The event ID
        event_update: The update data
        
    Returns:
        Updated SecurityEvent object or None if not found
    """
    event = get_event_by_id(db, event_id)
    if event:
        update_data = event_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(event, field, value)
        db.commit()
        db.refresh(event)
    return event