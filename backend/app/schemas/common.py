from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


class SuccessResponse(BaseModel):
    success: bool = Field(..., description="Indicates if the operation was successful")
    message: Optional[str] = Field(None, description="Optional message")
    data: Optional[Any] = Field(None, description="Response data")


class ErrorResponse(BaseModel):
    success: bool = Field(False, description="Indicates if the operation failed")
    message: str = Field(..., description="Error message")
    errorCode: Optional[str] = Field(None, description="Error code")


class PaginationParams(BaseModel):
    page: int = Field(1, ge=1, description="Page number")
    pageSize: int = Field(20, ge=1, le=100, description="Items per page")


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class EventStatus(str, Enum):
    NEW = "new"
    INVESTIGATING = "investigating"
    CONTAINED = "contained"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"