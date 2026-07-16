"""
SwasthyaSathi AI - Reports API

Handles generation and downloading of PDF reports for patient visits.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from supabase import Client
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.pdf_service import generate_referral_pdf

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/pdf/{visit_id}")
async def get_visit_pdf(
    visit_id: str,
    # current_user: dict = Depends(get_current_user), # Disabled for hackathon demo ease of access
    db: Client = Depends(get_db)
):
    """
    Generates and downloads a PDF referral report for a specific visit.
    """
    try:
        # Fetch the visit
        visit_result = (
            db.table("visits")
            .select("*")
            .eq("id", visit_id)
            .single()
            .execute()
        )
        if not visit_result.data:
            raise HTTPException(status_code=404, detail="Visit not found")
        visit_data = visit_result.data
        
        # Fetch the patient
        patient_result = (
            db.table("patients")
            .select("*")
            .eq("id", visit_data["patient_id"])
            .single()
            .execute()
        )
        patient_data = patient_result.data or {}

        # Generate PDF buffer
        pdf_buffer = generate_referral_pdf(visit_data, patient_data)
        
        headers = {
            "Content-Disposition": f'attachment; filename="SwasthyaSathi_Referral_{patient_data.get("full_name", "Unknown").replace(" ", "_")}.pdf"'
        }
        
        return StreamingResponse(
            pdf_buffer, 
            media_type="application/pdf", 
            headers=headers
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(e)}",
        )
