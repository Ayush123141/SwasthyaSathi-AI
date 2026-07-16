"""
SwasthyaSathi AI - Patient Routes

CRUD operations for patient management with search,
filtering, and timeline views.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.patient import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PatientListItem,
)
from app.schemas.common import ApiResponse, RiskLevel, Gender
from app.api.deps import get_pagination_params

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.post("/", response_model=ApiResponse, status_code=201)
async def create_patient(
    patient: PatientCreate,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """Register a new patient under the current ASHA worker."""
    try:
        patient_data = {
            "asha_worker_id": current_user["id"],
            "full_name": patient.full_name,
            "age": patient.age,
            "gender": patient.gender.value,
            "date_of_birth": patient.date_of_birth.isoformat()
            if patient.date_of_birth
            else None,
            "phone": patient.phone,
            "address": patient.address,
            "village": patient.village or (current_user.get("profile") or {}).get("village"),
            "district": patient.district or (current_user.get("profile") or {}).get("district"),
            "father_or_husband_name": patient.father_or_husband_name,
            "family_size": patient.family_size,
            "pregnancy_status": patient.pregnancy_status,
            "pregnancy_week": patient.pregnancy_week,
            "chronic_diseases": patient.chronic_diseases or [],
            "allergies": patient.allergies or [],
            "current_medications": patient.current_medications or [],
            "vaccination_history": patient.vaccination_history or [],
            "blood_group": patient.blood_group,
            "emergency_contacts": [
                ec.model_dump() for ec in (patient.emergency_contacts or [])
            ],
        }

        result = db.table("patients").insert(patient_data).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create patient record",
            )

        return ApiResponse(
            success=True,
            message="Patient registered successfully",
            data=result.data[0],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Patient registration failed: {str(e)}",
        )


@router.get("/", response_model=ApiResponse)
async def list_patients(
    query: Optional[str] = Query(None, description="Search by name or phone"),
    village: Optional[str] = None,
    risk_level: Optional[RiskLevel] = None,
    gender: Optional[Gender] = None,
    is_pregnant: Optional[bool] = None,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
    pagination: dict = Depends(get_pagination_params),
):
    """
    List patients with search and filters.
    ASHA workers see only their patients; supervisors see all in their district.
    """
    try:
        db_query = db.table("patients").select(
            "id, full_name, age, gender, village, pregnancy_status, "
            "risk_level, last_visit_date, total_visits, chronic_diseases",
            count="exact",
        )

        # Role-based filtering
        user_role = current_user.get("role", "asha_worker")
        if user_role == "asha_worker":
            db_query = db_query.eq("asha_worker_id", current_user["id"])
        elif user_role == "supervisor":
            user_district = current_user.get("profile", {}).get("district")
            if user_district:
                db_query = db_query.eq("district", user_district)

        # Apply search filter
        if query:
            db_query = db_query.or_(
                f"full_name.ilike.%{query}%,phone.ilike.%{query}%"
            )

        # Apply filters
        if village:
            db_query = db_query.eq("village", village)
        if risk_level:
            db_query = db_query.eq("risk_level", risk_level.value)
        if gender:
            db_query = db_query.eq("gender", gender.value)
        if is_pregnant:
            db_query = db_query.eq("pregnancy_status", "pregnant")

        # Pagination and ordering
        offset = pagination["offset"]
        page_size = pagination["page_size"]
        db_query = db_query.order("created_at", desc=True)
        db_query = db_query.range(offset, offset + page_size - 1)

        result = db_query.execute()

        total = result.count if result.count else 0
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0

        return ApiResponse(
            success=True,
            message="Patients retrieved",
            data={
                "items": result.data or [],
                "total": total,
                "page": pagination["page"],
                "page_size": page_size,
                "total_pages": total_pages,
            },
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve patients: {str(e)}",
        )


@router.get("/{patient_id}", response_model=ApiResponse)
async def get_patient(
    patient_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """Get full patient details including recent visits."""
    try:
        result = (
            db.table("patients")
            .select("*")
            .eq("id", patient_id)
            .single()
            .execute()
        )

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found",
            )

        # Fetch recent visits for this patient
        visits_result = (
            db.table("visits")
            .select("id, visit_date, visit_type, ai_risk_level, vitals, symptoms")
            .eq("patient_id", patient_id)
            .order("visit_date", desc=True)
            .limit(10)
            .execute()
        )

        patient_data = result.data
        patient_data["recent_visits"] = visits_result.data or []

        return ApiResponse(
            success=True,
            message="Patient details retrieved",
            data=patient_data,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve patient: {str(e)}",
        )


@router.put("/{patient_id}", response_model=ApiResponse)
async def update_patient(
    patient_id: str,
    patient: PatientUpdate,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """Update patient information."""
    try:
        # Build update data, excluding None values
        update_data = patient.model_dump(exclude_none=True)

        if "gender" in update_data:
            update_data["gender"] = update_data["gender"].value

        if "emergency_contacts" in update_data:
            update_data["emergency_contacts"] = [
                ec if isinstance(ec, dict) else ec.model_dump()
                for ec in update_data["emergency_contacts"]
            ]

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update",
            )

        result = (
            db.table("patients")
            .update(update_data)
            .eq("id", patient_id)
            .execute()
        )

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found",
            )

        return ApiResponse(
            success=True,
            message="Patient updated successfully",
            data=result.data[0],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Patient update failed: {str(e)}",
        )


@router.get("/{patient_id}/timeline", response_model=ApiResponse)
async def get_patient_timeline(
    patient_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db),
):
    """Get complete visit timeline for a patient."""
    try:
        result = (
            db.table("visits")
            .select("*")
            .eq("patient_id", patient_id)
            .order("visit_date", desc=True)
            .execute()
        )

        return ApiResponse(
            success=True,
            message="Timeline retrieved",
            data=result.data or [],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve timeline: {str(e)}",
        )
