"""
SwasthyaSathi AI - Common Schemas

Shared Pydantic models used across the application.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Any, Generic, TypeVar
from datetime import datetime
from enum import Enum

T = TypeVar("T")


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EMERGENCY = "emergency"


class UserRole(str, Enum):
    ASHA_WORKER = "asha_worker"
    SUPERVISOR = "supervisor"
    ADMIN = "admin"


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class ApiResponse(BaseModel):
    """Standard API response wrapper."""

    success: bool = True
    message: str = "Success"
    data: Optional[Any] = None


class PaginatedResponse(BaseModel):
    """Paginated list response."""

    items: List[Any] = []
    total: int = 0
    page: int = 1
    page_size: int = 20
    total_pages: int = 0


class ErrorResponse(BaseModel):
    """Standard error response."""

    success: bool = False
    message: str
    error_code: Optional[str] = None
    details: Optional[Any] = None


class SyncStatus(str, Enum):
    PENDING = "pending"
    SYNCED = "synced"
    CONFLICT = "conflict"
    FAILED = "failed"


class HealthCheck(BaseModel):
    """Health check response model."""

    status: str = "healthy"
    version: str
    timestamp: datetime
    services: dict = {}
