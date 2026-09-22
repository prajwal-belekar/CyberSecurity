from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from typing import List, Optional, Tuple
from app.models import Incident, SecurityEvent
from app.enums import Severity, IncidentStatus


def get_incidents(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    severity: Optional[Severity] = None,
    status: Optional[IncidentStatus] = None,
    threat_type: Optional[str] = None,
    source: Optional[str] = None,
    target: Optional[str] = None,
    assigned_to: Optional[str] = None,
    sort_by: str = "updated_at",
    sort_desc: bool = True
) -> Tuple[List[Incident], int]:
    """
    Get paginated list of incidents with filtering.
    
    Args:
        db: Database session
        page: Page number (1-based)
        page_size: Number of items per page
        severity: Filter by severity level
        status: Filter by status
        threat_type: Filter by threat type
        source: Filter by source
        target: Filter by target
        assigned_to: Filter by assigned analyst
        sort_by: Field to sort by
        sort_desc: Whether to sort in descending order
        
    Returns:
        Tuple of (incidents list, total count)
    """
    query = db.query(Incident)
    
    # Apply filters
    if severity:
        query = query.filter(Incident.severity == severity)
    if status:
        query = query.filter(Incident.status == status)
    if threat_type:
        query = query.filter(Incident.threat_type.ilike(f"%{threat_type}%"))
    if source:
        query = query.filter(Incident.source.ilike(f"%{source}%"))
    if target:
        query = query.filter(Incident.target.ilike(f"%{target}%"))
    if assigned_to:
        query = query.filter(Incident.assigned_to.ilike(f"%{assigned_to}%"))
    
    # Get total count
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(Incident, sort_by, Incident.updated_at)
    if sort_desc:
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Apply pagination
    offset = (page - 1) * page_size
    incidents = query.offset(offset).limit(page_size).all()
    
    return incidents, total


def get_incident_by_id(db: Session, incident_id: int) -> Optional[Incident]:
    """
    Get an incident by its ID.
    
    Args:
        db: Database session
        incident_id: The incident ID
        
    Returns:
        Incident object or None if not found
    """
    return db.query(Incident).filter(Incident.id == incident_id).first()


def get_incident_by_incident_id(db: Session, incident_id: str) -> Optional[Incident]:
    """
    Get an incident by its incident_id string.
    
    Args:
        db: Database session
        incident_id: The incident ID string
        
    Returns:
        Incident object or None if not found
    """
    return db.query(Incident).filter(Incident.incident_id == incident_id).first()


def get_incident_evidence(db: Session, incident_id: int) -> Tuple[Optional[Incident], List[SecurityEvent]]:
    """
    Get an incident and its associated evidence events.
    
    Args:
        db: Database session
        incident_id: The incident ID
        
    Returns:
        Tuple of (incident object, list of evidence events)
    """
    incident = get_incident_by_id(db, incident_id)
    if not incident:
        return None, []
    
    # Get evidence events through the relationship
    evidence_events = incident.evidence_events
    
    return incident, evidence_events


def update_incident_status(db: Session, incident_id: int, status: IncidentStatus) -> Optional[Incident]:
    """
    Update the status of an incident.
    
    Args:
        db: Database session
        incident_id: The incident ID
        status: New status
        
    Returns:
        Updated Incident object or None if not found
    """
    incident = get_incident_by_id(db, incident_id)
    if incident:
        incident.status = status
        db.commit()
        db.refresh(incident)
    return incident


def update_incident(db: Session, incident_id: int, incident_update) -> Optional[Incident]:
    """
    Update an incident.
    
    Args:
        db: Database session
        incident_id: The incident ID
        incident_update: The update data
        
    Returns:
        Updated Incident object or None if not found
    """
    incident = get_incident_by_id(db, incident_id)
    if incident:
        update_data = incident_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(incident, field, value)
        db.commit()
        db.refresh(incident)
    return incident