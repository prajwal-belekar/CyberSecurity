from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from typing import List, Optional, Tuple
from app.models import Indicator
from app.enums import IndicatorType, Severity, IndicatorStatus


def get_indicators(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    indicator_type: Optional[IndicatorType] = None,
    risk: Optional[Severity] = None,
    status: Optional[IndicatorStatus] = None,
    source: Optional[str] = None,
    value_search: Optional[str] = None,
    threat_actor: Optional[str] = None,
    sort_by: str = "last_seen",
    sort_desc: bool = True
) -> Tuple[List[Indicator], int]:
    """
    Get paginated list of indicators with filtering.
    
    Args:
        db: Database session
        page: Page number (1-based)
        page_size: Number of items per page
        indicator_type: Filter by indicator type
        risk: Filter by risk level
        status: Filter by status
        source: Filter by source
        value_search: Search in indicator value
        threat_actor: Filter by threat actor
        sort_by: Field to sort by to sort by
        sort_desc: Whether to sort in descending order
        
    Returns:
        Tuple of (indicators list, total count)
    """
    query = db.query(Indicator)
    
    # Apply filters
    if indicator_type:
        query = query.filter(Indicator.indicator_type == indicator_type)
    if risk:
        query = query.filter(Indicator.risk == risk)
    if status:
        query = query.filter(Indicator.status == status)
    if source:
        query = query.filter(Indicator.source.ilike(f"%{source}%"))
    if value_search:
        query = query.filter(Indicator.value.ilike(f"%{value_search}%"))
    if threat_actor:
        query = query.filter(Indicator.threat_actor.ilike(f"%{threat_actor}%"))
    
    # Get total count
    total = query.count()
    
    # Apply sorting
    sort_column = getattr(Indicator, sort_by, Indicator.last_seen)
    if sort_desc:
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    # Apply pagination
    offset = (page - 1) * page_size
    indicators = query.offset(offset).limit(page_size).all()
    
    return indicators, total


def get_indicator_by_id(db: Session, indicator_id: int) -> Optional[Indicator]:
    """
    Get an indicator by its ID.
    
    Args:
        db: Database session
        indicator_id: The indicator ID
        
    Returns:
        Indicator object or None if not found
    """
    return db.query(Indicator).filter(Indicator.id == indicator_id).first()


def get_indicator_by_indicator_id(db: Session, indicator_id: str) -> Optional[Indicator]:
    """
    Get an indicator by its indicator_id string.
    
    Args:
        db: Database session
        indicator_id: The indicator ID string
        
    Returns:
        Indicator object or None if not found
    """
    return db.query(Indicator).filter(Indicator.indicator_id == indicator_id).first()


def update_indicator_status(db: Session, indicator_id: int, status: IndicatorStatus) -> Optional[Indicator]:
    """
    Update the status of an indicator.
    
    Args:
        db: Database session
        indicator_id: The indicator ID
        status: New status
        
    Returns:
        Updated Indicator object or None if not found
    """
    indicator = get_indicator_by_id(db, indicator_id)
    if indicator:
        indicator.status = status
        db.commit()
        db.refresh(indicator)
    return indicator


def update_indicator(db: Session, indicator_id: int, indicator_update) -> Optional[Indicator]:
    """
    Update an indicator.
    
    Args:
        db: Database session
        indicator_id: The indicator ID
        indicator_update: The update data
        
    Returns:
        Updated Indicator object or None if not found
    """
    indicator = get_indicator_by_id(db, indicator_id)
    if indicator:
        update_data = indicator_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(indicator, field, value)
        db.commit()
        db.refresh(indicator)
    return indicator