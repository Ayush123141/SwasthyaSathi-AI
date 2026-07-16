"""
SwasthyaSathi AI - Shared API Dependencies

Common dependencies injected into route handlers via FastAPI's Depends system.
"""

from fastapi import Depends, Query
from supabase import Client
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user


async def get_pagination_params(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(
        default=20, ge=1, le=100, description="Items per page"
    ),
) -> dict:
    """Extract and validate pagination parameters."""
    return {
        "page": page,
        "page_size": page_size,
        "offset": (page - 1) * page_size,
    }
