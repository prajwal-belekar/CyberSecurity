from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.ai import ChatMessageResponse, InvestigateRequest
from app.services.ai import investigate_ai

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/investigate", response_model=ChatMessageResponse)
async def investigate_endpoint(
    request: InvestigateRequest,
    db: Session = Depends(get_db)
) -> ChatMessageResponse:
    """
    AI investigation endpoint for the security terminal.
    
    Analyzes security events and provides insights based on investigation context.
    Retrieves real incident, threat, and event data when IDs are provided.
    """
    try:
        result = await investigate_ai(db, request.question, request.context.model_dump())
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Investigation failed: {str(e)}"
        )