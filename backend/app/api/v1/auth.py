"""
SwasthyaSathi AI - Authentication Routes

Handles user registration, login, token refresh, and profile retrieval.
Uses Supabase Auth for all authentication operations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    UserProfile,
)
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=ApiResponse, status_code=201)
async def register(request: RegisterRequest, db: Client = Depends(get_db)):
    """
    Register a new ASHA worker or supervisor account.
    Creates both a Supabase Auth user and a profile in the users table.
    """
    try:
        # Create user in Supabase Auth
        auth_response = db.auth.sign_up(
            {
                "email": request.email,
                "password": request.password,
                "options": {
                    "data": {
                        "full_name": request.full_name,
                        "role": request.role.value,
                    }
                },
            }
        )

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user account",
            )

        user_id = str(auth_response.user.id)

        # Create user profile in our users table
        profile_data = {
            "id": user_id,
            "email": request.email,
            "full_name": request.full_name,
            "role": request.role.value,
            "phone": request.phone,
            "phc_name": request.phc_name,
            "district": request.district,
            "village": request.village,
        }

        db.table("users").insert(profile_data).execute()

        return ApiResponse(
            success=True,
            message="Account created successfully. Please verify your email.",
            data={"user_id": user_id, "email": request.email},
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}",
        )


@router.post("/login", response_model=ApiResponse)
async def login(request: LoginRequest, db: Client = Depends(get_db)):
    """
    Authenticate a user with email and password.
    Returns access token and user profile.
    """
    try:
        auth_response = db.auth.sign_in_with_password(
            {"email": request.email, "password": request.password}
        )

        if not auth_response.user or not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        user_id = str(auth_response.user.id)

        # Fetch full profile from users table
        profile = (
            db.table("users")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )

        return ApiResponse(
            success=True,
            message="Login successful",
            data={
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token,
                "token_type": "bearer",
                "expires_in": auth_response.session.expires_in,
                "user": profile.data if profile.data else {
                    "id": user_id,
                    "email": request.email,
                    "role": "asha_worker",
                },
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {str(e)}",
        )


@router.get("/me", response_model=ApiResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return ApiResponse(
        success=True,
        message="Profile retrieved",
        data=current_user.get("profile", current_user),
    )


@router.post("/refresh", response_model=ApiResponse)
async def refresh_token(refresh_token: str, db: Client = Depends(get_db)):
    """Refresh an expired access token using a refresh token."""
    try:
        auth_response = db.auth.refresh_session(refresh_token)

        if not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        return ApiResponse(
            success=True,
            message="Token refreshed",
            data={
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token,
                "expires_in": auth_response.session.expires_in,
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token refresh failed: {str(e)}",
        )


@router.post("/logout", response_model=ApiResponse)
async def logout(current_user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    """Sign out the current user."""
    try:
        db.auth.sign_out()
        return ApiResponse(success=True, message="Logged out successfully")
    except Exception as e:
        return ApiResponse(success=True, message="Logged out")
