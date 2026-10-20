from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.common import SuccessResponse
from app.models import SecurityEvent, Indicator


router = APIRouter(prefix="/phishing", tags=["phishing"])


@router.get("/analyze", response_model=SuccessResponse)
def phishing_analyze(
    url: str = Query(..., description="URL to analyze"),
    db: Session = Depends(get_db)
):
    """Analyze a phishing URL."""
    from urllib.parse import urlparse
    
    parsed = urlparse(url)
    
    # Basic phishing indicators
    risk_score = 0
    indicators = []
    risk_level = "low"
    
    # Check domain characteristics
    domain = parsed.netloc or parsed.path
    if domain:
        # Suspicious TLDs
        suspicious_tlds = ['.xyz', '.top', '.club', '.pw', '.top']
        if any(domain.endswith(tld) for tld in suspicious_tlds):
            risk_score += 20
            indicators.append("Suspicious TLD")
        
        # Domain length
        if len(domain) > 50:
            risk_score += 10
            indicators.append("Long domain name")
        
        # IP address as domain
        try:
            import ipaddress
            ipaddress.ip_address(domain)
            risk_score += 30  # IP domain is suspicious
            indicators.append("IP address as domain")
        except ValueError:
            pass  # Not an IP, good
        
        # Suspicious keywords
        suspicious_keywords = ['login', 'signin', 'secure', 'account', 'verify', 'bank', 'paypal']
        domain_lower = domain.lower()
        for kw in suspicious_keywords:
            if kw in domain_lower:
                risk_score += 10
                if kw not in indicators:
                    indicators.append(f"Keyword: {kw}")
                break  # Only count once
    
    # Determine risk level
    if risk_score >= 70:
        risk_level = "critical"
    elif risk_score >= 50:
        risk_level = "high"
    elif risk_score >= 30:
        risk_level = "medium"
    
    return SuccessResponse(
        success=True,
        data={
            "url": url,
            "riskLevel": risk_level,
            "riskScore": risk_score,
            "indicators": indicators,
            "analysis": f"Phishing analysis completed for {url}. "
                        f"{len(indicators)} indicators found. "
                        f"Risk level: {risk_level}. "
                        f"Avoid interacting with this URL if marked as suspicious."
        }
    )


@router.get("/scans", response_model=SuccessResponse)
def phishing_scan_history(
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100, description="Number of scans to return")
):
    """Get phishing scan history."""
    from app.models import SecurityEvent
    
    events = db.query(SecurityEvent)\
        .filter(SecurityEvent.event_type.like("%phishing%"))\
        .order_by(SecurityEvent.timestamp.desc())\
        .limit(limit).all()
    
    return SuccessResponse(
        success=True,
        data={"scans": events, "total": len(events)}
    )