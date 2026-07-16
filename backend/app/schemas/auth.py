"""
SwasthyaSathi AI - Auth Schemas

Pydantic models for authentication request/response validation.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from app.schemas.common import UserRole


class LoginRequest(BaseModel):
    """Login request payload."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(
        ..., min_length=6, max_length=128, description="User password"
    )


class RegisterRequest(BaseModel):
    """Registration request payload for new ASHA worker or supervisor."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(
        ..., min_length=6, max_length=128, description="User password"
    )
    full_name: str = Field(
        ..., min_length=2, max_length=100, description="Full name"
    )
    role: UserRole = Field(
        default=UserRole.ASHA_WORKER, description="User role"
    )
    phone: Optional[str] = Field(
        None, pattern=r"^\+?[0-9]{10,13}$", description="Phone number"
    )
    phc_name: Optional[str] = Field(
        None, max_length=200, description="Primary Health Centre name"
    )
    district: Optional[str] = Field(
        None, max_length=100, description="District name"
    )
    village: Optional[str] = Field(
        None, max_length=100, description="Village name"
    )


class AuthResponse(BaseModel):
    """Authentication response with token and user info."""

    access_token: str
    token_type: str = "bearer"
    user: "UserProfile"


class UserProfile(BaseModel):
    """User profile data."""

    id: str
    email: str
    full_name: str
    role: UserRole
    phone: Optional[str] = None
    phc_name: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    avatar_url: Optional[str] = None


class TokenRefreshRequest(BaseModel):
    """Token refresh request."""

    refresh_token: str = Field(..., description="Refresh token")


# Rebuild model to resolve forward references
AuthResponse.model_rebuild()
