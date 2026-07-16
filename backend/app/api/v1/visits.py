"""
SwasthyaSathi AI - Visit Routes

Endpoints for recording patient visits with vitals,
symptoms, and clinical observations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.visit import VisitCreate, VisitResponse
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/visits", tags=["Visits"])


@router.post("/", response_model=ApiResponse, status_code=201)
async def create_visit(
    visit: VisitCreate,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """
    Record a new patient visit with vitals, symptoms, and observations.
    Triggers AI assessment pipeline after creation.
    """
    try:
        # Verify patient exists
        patient = (
            db.table("patients")
            .select("id, full_name")
            .eq("id", visit.patient_id)
            .single()
            .execute()
        )

        if not patient.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found",
            )

        visit_data = {
            "patient_id": visit.patient_id,
            "asha_worker_id": current_user["id"],
            "visit_date": datetime.now(timezone.utc).isoformat(),
            "vitals": visit.vitals.model_dump() if visit.vitals else None,
            "symptoms": visit.symptoms or [],
            "symptom_details": visit.symptom_details,
            "observations": visit.observations,
            "medications_given": visit.medications_given or [],
            "lifestyle_notes": visit.lifestyle_notes,
            "voice_transcript": visit.voice_transcript,
            "voice_language": visit.voice_language,
            "visit_type": visit.visit_type,
            "visit_location": visit.visit_location,
        }

        result = db.table("visits").insert(visit_data).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create visit record",
            )

        visit_record = result.data[0]

        # Update patient's last visit date and visit count
        db.table("patients").update(
            {
                "last_visit_date": visit_data["visit_date"],
                "total_visits": patient.data.get("total_visits", 0) + 1
                if "total_visits" in (patient.data or {})
                else 1,
            }
        ).eq("id", visit.patient_id).execute()

        return ApiResponse(
            success=True,
            message="Visit recorded successfully",
            data=visit_record,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to record visit: {str(e)}",
        )


@router.get("/{visit_id}", response_model=ApiResponse)
async def get_visit(
    visit_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """Get detailed visit information including AI assessment."""
    try:
        result = (
            db.table("visits")
            .select("*")
            .eq("id", visit_id)
            .single()
            .execute()
        )

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Visit not found",
            )

        return ApiResponse(
            success=True,
            message="Visit details retrieved",
            data=result.data,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve visit: {str(e)}",
        )


@router.get("/patient/{patient_id}", response_model=ApiResponse)
async def get_patient_visits(
    patient_id: str,
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """Get all visits for a specific patient, ordered by most recent."""
    try:
        result = (
            db.table("visits")
            .select("*")
            .eq("patient_id", patient_id)
            .order("visit_date", desc=True)
            .limit(limit)
            .execute()
        )

        return ApiResponse(
            success=True,
            message="Patient visits retrieved",
            data=result.data or [],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve visits: {str(e)}",
        )
