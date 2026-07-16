"""
SwasthyaSathi AI - Security & Authentication

Handles JWT token verification via Supabase Auth,
extracts current user from requests, and provides
role-based access control.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from typing import Optional
from app.core.database import get_db
from app.core.config import get_settings

security_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Client = Depends(get_db),
) -> dict:
    """
    Extract and verify the current user from the JWT token.
    Returns user data from Supabase Auth.

    Raises HTTPException 401 if token is invalid or expired.
    """
    token = credentials.credentials

    try:
        # Verify the JWT token with Supabase
        user_response = db.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = user_response.user

        # Fetch user profile from our users table
        profile_response = (
            db.table("users")
            .select("*")
            .eq("id", str(user.id))
            .single()
            .execute()
        )

        return {
            "id": str(user.id),
            "email": user.email,
            "role": profile_response.data.get("role", "asha_worker")
            if profile_response.data
            else "asha_worker",
            "profile": profile_response.data,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(required_role: str):
    """
    Dependency factory for role-based access control.

    Usage:
        @router.get("/admin", dependencies=[Depends(require_role("supervisor"))])
        async def admin_endpoint():
            ...
    """

    async def role_checker(
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        user_role = current_user.get("role", "")

        if user_role != required_role and user_role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role}",
            )

        return current_user

    return role_checker
