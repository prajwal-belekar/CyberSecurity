from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.common import SuccessResponse
from app.enums import EventStatus, Severity


router = APIRouter(prefix="/network", tags=["network"])


@router.get("/events", response_model=SuccessResponse)
def read_network_events(
    db: Session = Depends(get_db),
    severity: Optional[Severity] = Query(None, description="Filter by severity"),
    status: Optional[EventStatus] = Query(None, description="Filter by status"),
    source: Optional[str] = Query(None, description="Filter by source IP"),
    target: Optional[str] = Query(None, description="Filter by destination IP"),
    sort_by: str = Query("timestamp", description="Sort by field"),
    sort_desc: bool = Query(True, description="Sort descending"),
):
    """Get network security events."""
    from app.models import SecurityEvent
    from app.enums import EventStatus
    
    query = db.query(SecurityEvent).filter(SecurityEvent.channel == "NET")
    
    if severity:
        query = query.filter(SecurityEvent.severity == severity)
    if status:
        query = query.filter(SecurityEvent.status == status)
    if source:
        query = query.filter(SecurityEvent.source.ilike(f"%{source}%"))
    if target:
        query = query.filter(SecurityEvent.target.ilike(f"%{target}%"))
    
    events = query.order_by(SecurityEvent.timestamp.desc() if sort_desc else SecurityEvent.timestamp.asc()).all()
    
    return SuccessResponse(
        success=True,
        data={"events": events, "total": len(events)}
    )


@router.get("/topology", response_model=SuccessResponse)
def read_network_topology(
    db: Session = Depends(get_db)
):
    """Get network topology data."""
    from app.models import SecurityEvent, Threat, Indicator
    
    # Get unique source/target pairs for network graph
    nodes = set()
    edges = []
    
    events = db.query(SecurityEvent).filter(SecurityEvent.channel == "NET").limit(100).all()
    for event in events:
        if event.source:
            nodes.add(event.source)
        if event.target:
            nodes.add(event.target)
            edges.append({"source": event.source, "target": event.target, "value": 1})
    
    # Get threats as additional nodes
    threats = db.query(Threat).limit(50).all()
    for threat in threats:
        if threat.source:
            nodes.add(threat.source)
        if threat.target:
            nodes.add(threat.target)
            edges.append({"source": threat.source, "target": threat.target, "value": 2})
    
    return SuccessResponse(
        success=True,
        data={"nodes": list(nodes), "edges": edges}
    )


@router.get("/summary", response_model=SuccessResponse)
def read_network_summary(
    db: Session = Depends(get_db)
):
    """Get network security summary."""
    from app.models import SecurityEvent
    
    total_events = db.query(SecurityEvent).filter(SecurityEvent.channel == "NET").count()
    high_events = db.query(SecurityEvent).filter(
        SecurityEvent.channel == "NET",
        SecurityEvent.severity == Severity.HIGH
    ).count()
    critical_events = db.query(SecurityEvent).filter(
        SecurityEvent.channel == "NET",
        SecurityEvent.severity == Severity.CRITICAL
    ).count()
    
    # Top talkers
    top_sources = db.query(SecurityEvent.source, func.count(SecurityEvent.source).label('count'))\
        .filter(SecurityEvent.channel == "NET")\
        .group_by(SecurityEvent.source)\
        .order_by(func.count(SecurityEvent.source).desc())\
        .limit(5).all()
    
    top_targets = db.query(SecurityEvent.target, func.count(SecurityEvent.target).label('count'))\
        .filter(SecurityEvent.channel == "NET", SecurityEvent.target.isnot(None))\
        .group_by(SecurityEvent.target)\
        .order_by(func.count(SecurityEvent.target).desc())\
        .limit(5).all()
    
    return SuccessResponse(
        success=True,
        data={
            "totalEvents": total_events,
            "highSeverity": high_events,
            "criticalSeverity": critical_events,
            "topSources": [{"ip": s, "count": c} for s, c in top_sources],
            "topTargets": [{"ip": t, "count": c} for t, c in top_targets]
        }
    )