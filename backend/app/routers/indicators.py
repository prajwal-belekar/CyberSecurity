from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.indicators import (
    IndicatorResponse, 
    IndicatorListResponse,
    IndicatorUpdate
)
from app.services.indicators import (
    get_indicators,
    get_indicator_by_id,
    get_indicator_by_indicator_id,
    update_indicator_status,
    update_indicator
)
from app.enums import IndicatorType, Severity, IndicatorStatus


router = APIRouter(prefix="/indicators", tags=["indicators"])


@router.get("/", response_model=IndicatorListResponse)
def read_indicators(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    indicator_type: Optional[IndicatorType] = Query(None, description="Filter by indicator type"),
    risk: Optional[Severity] = Query(None, description="Filter by risk level"),
    status: Optional[IndicatorStatus] = Query(None, description="Filter by status"),
    source: Optional[str] = Query(None, description="Filter by source"),
    value: Optional[str] = Query(None, description="Search in indicator value"),
    threat_actor: Optional[str] = Query(None, description="Filter by threat actor"),
    sort_by: str = Query("last_seen", description="Sort by field"),
    sort_desc: bool = Query(True, description="Sort descending"),
    db: Session = Depends(get_db)
):
    """
    Get a paginated list of indicators with optional filtering.
    
    - **page**: Page number (starts at 1)
    - **page_size**: Number of items per page (max 100)
    - **indicator_type**: Filter by indicator type
    - **risk**: Filter by risk level
    - **status**: Filter by status
    - **source**: Filter by source (partial match)
    - **value**: Search in indicator value (partial match)
    - **threat_actor**: Filter by threat actor (partial match)
    - **sort_by**: Field to sort by
    - **sort_desc**: Whether to sort in descending order
    """
    indicators, total = get_indicators(
        db=db,
        page=page,
        page_size=page_size,
        indicator_type=indicator_type,
        risk=risk,
        status=status,
        source=source,
        value_search=value,
        threat_actor=threat_actor,
        sort_by=sort_by,
        sort_desc=sort_desc
    )
    
    pages = (total + page_size - 1) // page_size
    
    return IndicatorListResponse(
        items=indicators,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages
    )


@router.get("/{indicator_id}", response_model=IndicatorResponse)
def read_indicator(
    indicator_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific indicator by its indicator_id.
    
    - **indicator_id**: The unique indicator identifier
    """
    indicator = get_indicator_by_indicator_id(db, indicator_id)
    if not indicator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Indicator with ID {indicator_id} not found"
        )
    return indicator


@router.patch("/{indicator_id}/status", response_model=IndicatorResponse)
def update_indicator_status_endpoint(
    indicator_id: str,
    status: IndicatorStatus,
    db: Session = Depends(get_db)
):
    """
    Update the status of an indicator.
    
    - **indicator_id**: The unique indicator identifier
    - **status**: The new status
    """
    indicator = get_indicator_by_indicator_id(db, indicator_id)
    if not indicator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Indicator with ID {indicator_id} not found"
        )
    
    updated_indicator = update_indicator_status(db, indicator.id, status)
    if not updated_indicator:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update indicator status"
        )
    
    return updated_indicator