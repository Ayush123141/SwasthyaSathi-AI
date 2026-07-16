"""
SwasthyaSathi AI - Supabase Database Client

Provides a centralized Supabase client for all database operations
and authentication. Uses the service role key for backend operations.
"""

from supabase import create_client, Client
from functools import lru_cache
from app.core.config import get_settings


@lru_cache()
def get_supabase_client() -> Client:
    """
    Create and cache a Supabase client using the service role key.
    The service role key bypasses Row-Level Security for backend operations.
    """
    settings = get_settings()

    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env"
        )

    return create_client(
        settings.supabase_url,
        settings.supabase_service_role_key,
    )


def get_db() -> Client:
    """
    Dependency injection helper for FastAPI routes.
    Returns the cached Supabase client.
    """
    return get_supabase_client()
