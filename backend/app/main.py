"""
SwasthyaSathi AI — FastAPI Application Entry Point

AI-powered Clinical Decision Support System for ASHA Workers.
This is the main application module that configures CORS,
mounts API routers, and defines lifespan events.
"""

import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.v1 import auth, patients, visits


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup (model loading) and shutdown (cleanup).
    """
    settings = get_settings()

    # Create upload and reports directories
    os.makedirs(settings.upload_dir, exist_ok=True)
    os.makedirs(settings.reports_dir, exist_ok=True)

    print(f"🏥 {settings.app_name} v{settings.app_version} starting...")
    print(f"📡 CORS origins: {settings.cors_origins_list}")
    print(f"🔧 Debug mode: {settings.debug}")

    # Future: Load ML models, initialize OCR, etc. during startup
    # These will be added in later phases

    yield

    # Cleanup on shutdown
    print(f"🏥 {settings.app_name} shutting down...")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        description=(
            "AI-powered Clinical Decision Support System for ASHA workers. "
            "Combines Rule Engine, XGBoost ML, PaddleOCR, Whisper Voice AI, "
            "and Gemini LLM for comprehensive patient assessment."
        ),
        version=settings.app_version,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS middleware — allows frontend to call backend APIs
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check endpoint
    @app.get("/health", tags=["System"])
    async def health_check():
        """System health check — used by monitoring and Vercel."""
        return {
            "status": "healthy",
            "version": settings.app_version,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "app": settings.app_name,
        }

    # Mount API v1 routers
    app.include_router(auth.router, prefix="/api/v1")
    app.include_router(patients.router, prefix="/api/v1")
    app.include_router(visits.router, prefix="/api/v1")

    return app


# Create the app instance
app = create_app()
