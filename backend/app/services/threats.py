from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from typing import List, Optional, Tuple
from app.models import Threat
from app.enums import Severity, EventStatus


def get_threats(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    severity: Optional[Severity] = None,
    status: Optional[EventStatus] = None,
    threat_type: Optional[str] = None,
    source: Optional[str] = None,
    target: Optional[str] = None,
    sort_by: str = "last_seen",
    sort_desc: bool = True
) -> Tuple[List[Threat], int]:
    """
    Get paginated list of threats with filtering.
    
    Args:
        db: Database session
        page: Page number (1-based)
        page_size: Number of items per page
        severity: Filter by severity level
        status: Filter by status
        threat_type: Filter by threat type
        source: Filter by source
        target: Filter by target
        sort_by: Field to sort by
        sort_desc: Whether to sort in descending order
        
    Returns:
        Tuple of (threats list, total count)
    """
    query = db.query(Threat)
    
    # Apply filters
    if severity:
        query = query.filter(Threat.severity == severity)
    if status:
        query = query.filter(Threat.status == status)
    if threat_type:
        query = query.filter(Threat.threat_type.ilike(f"%{threat_type}%"))
    if source:
        query = query.filter(Threat.source.ilike(f"%{source}%"))
    if target:
        query = query.filter(Threat.target.ilike(f"%{target}%"))
    
    # Get total count
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(Threat, sort_by, Threat.last_seen)
    if sort_desc:
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Apply pagination
    offset = (page - 1) * page_size
    threats = query.offset(offset).limit(page_size).all()
    
    return threats, total


def get_threat_by_id(db: Session, threat_id: int) -> Optional[Threat]:
    """
    Get a threat by its ID.
    
    Args:
        db: Database session
        threat_id: The threat ID
        
    Returns:
        Threat object or None if not found
    """
    return db.query(Threat).filter(Threat.id == threat_id).first()


def get_threat_by_threat_id(db: Session, threat_id: str) -> Optional[Threat]:
    """
    Get a threat by its threat_id string.
    
    Args:
        db: Database session
        threat_id: The threat ID string
        
    Returns:
        Threat object or None if not found
    """
    return db.query(Threat).filter(Threat.threat_id == threat_id).first()


def update_threat_status(db: Session, threat_id: int, status: EventStatus) -> Optional[Threat]:
    """
    Update the status of a threat.
    
    Args:
        db: Database session
        threat_id: The threat ID
        status: New status
        
    Returns:
        Updated Threat object or None if not found
    """
    threat = get_threat_by_id(db, threat_id)
    if threat:
        threat.status = status
        db.commit()
        db.refresh(threat)
    return threat


def update_threat(db: Session, threat_id: int, threat_update) -> Optional[Threat]:
    """
    Update a threat.
    
    Args:
        db: Database session
        threat_id: The threat ID
        threat_update: The update data
        
    Returns:
        Updated Threat object or None if not found
    """
    threat = get_threat_by_id(db, threat_id)
    if threat:
        update_data = threat_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(threat, field, value)
        db.commit()
        db.refresh(threat)
    return threat