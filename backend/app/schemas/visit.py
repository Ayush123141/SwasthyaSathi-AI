"""
SwasthyaSathi AI - Visit Schemas

Pydantic models for visit recording, vitals entry,
and visit history views.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.schemas.common import RiskLevel


class VitalSigns(BaseModel):
    """Patient vital signs recorded during a visit."""

    systolic_bp: Optional[int] = Field(
        None, ge=50, le=300, description="Systolic blood pressure (mmHg)"
    )
    diastolic_bp: Optional[int] = Field(
        None, ge=30, le=200, description="Diastolic blood pressure (mmHg)"
    )
    pulse_rate: Optional[int] = Field(
        None, ge=20, le=250, description="Pulse rate (bpm)"
    )
    temperature: Optional[float] = Field(
        None, ge=90.0, le=110.0, description="Body temperature (°F)"
    )
    spo2: Optional[float] = Field(
        None, ge=0, le=100, description="Oxygen saturation (%)"
    )
    blood_sugar: Optional[float] = Field(
        None, ge=20, le=600, description="Blood sugar (mg/dL)"
    )
    weight: Optional[float] = Field(
        None, ge=0.5, le=300, description="Weight (kg)"
    )
    height: Optional[float] = Field(
        None, ge=20, le=250, description="Height (cm)"
    )
    bmi: Optional[float] = Field(None, ge=5, le=80, description="BMI")

    @field_validator("bmi", mode="before")
    @classmethod
    def calculate_bmi(cls, v, info):
        """Auto-calculate BMI if weight and height are provided."""
        if v is not None:
            return v
        data = info.data
        weight = data.get("weight")
        height = data.get("height")
        if weight and height and height > 0:
            height_m = height / 100.0
            return round(weight / (height_m ** 2), 1)
        return None


class VisitCreate(BaseModel):
    """Request schema for recording a new patient visit."""

    patient_id: str = Field(..., description="Patient ID")

    # Vitals
    vitals: Optional[VitalSigns] = Field(
        None, description="Vital signs recorded during visit"
    )

    # Clinical observations
    symptoms: Optional[List[str]] = Field(
        default_factory=list, description="List of reported symptoms"
    )
    symptom_details: Optional[str] = Field(
        None, max_length=2000, description="Detailed symptom description"
    )
    observations: Optional[str] = Field(
        None, max_length=2000, description="ASHA worker observations"
    )
    medications_given: Optional[List[str]] = Field(
        default_factory=list, description="Medications administered"
    )
    lifestyle_notes: Optional[str] = Field(
        None, max_length=1000, description="Diet, exercise, habits"
    )

    # Voice input
    voice_transcript: Optional[str] = Field(
        None, max_length=5000, description="Voice transcription text"
    )
    voice_language: Optional[str] = Field(
        None, description="Detected language of voice input"
    )

    # Visit metadata
    visit_type: Optional[str] = Field(
        default="routine",
        description="Visit type: routine, follow_up, emergency, anc",
    )
    visit_location: Optional[str] = Field(
        None, description="Location: home, phc, sub_center"
    )


class VisitResponse(BaseModel):
    """Response schema for visit data."""

    id: str
    patient_id: str
    asha_worker_id: str
    visit_date: datetime
    vitals: Optional[VitalSigns] = None
    symptoms: List[str] = []
    symptom_details: Optional[str] = None
    observations: Optional[str] = None
    medications_given: List[str] = []
    lifestyle_notes: Optional[str] = None
    voice_transcript: Optional[str] = None
    voice_language: Optional[str] = None
    visit_type: Optional[str] = None
    visit_location: Optional[str] = None

    # AI Assessment results (populated after AI processing)
    ai_risk_level: Optional[RiskLevel] = None
    ml_confidence_score: Optional[float] = None
    emergency_flags: Optional[List[str]] = None
    ai_recommendation: Optional[str] = None
    referral_needed: bool = False
    referral_type: Optional[str] = None

    created_at: Optional[datetime] = None


class VisitTimelineItem(BaseModel):
    """Simplified visit data for timeline view."""

    id: str
    visit_date: datetime
    visit_type: Optional[str] = None
    ai_risk_level: Optional[RiskLevel] = None
    key_vitals: Optional[dict] = None
    symptoms_count: int = 0
    has_referral: bool = False
