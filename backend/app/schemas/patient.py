"""
SwasthyaSathi AI - Patient Schemas

Pydantic models for patient registration, listing, and detail views.
Includes comprehensive medical data validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from app.schemas.common import Gender, RiskLevel


class EmergencyContact(BaseModel):
    """Emergency contact details for a patient."""

    name: str = Field(..., min_length=2, max_length=100)
    relationship: str = Field(..., max_length=50)
    phone: str = Field(..., pattern=r"^\+?[0-9]{10,13}$")


class PatientCreate(BaseModel):
    """Request schema for registering a new patient."""

    # Demographics
    full_name: str = Field(
        ..., min_length=2, max_length=100, description="Patient full name"
    )
    age: int = Field(..., ge=0, le=120, description="Patient age in years")
    gender: Gender = Field(..., description="Patient gender")
    date_of_birth: Optional[date] = Field(None, description="Date of birth")
    phone: Optional[str] = Field(
        None, pattern=r"^\+?[0-9]{10,13}$", description="Phone number"
    )
    address: Optional[str] = Field(None, max_length=500, description="Address")
    village: Optional[str] = Field(
        None, max_length=100, description="Village name"
    )
    district: Optional[str] = Field(
        None, max_length=100, description="District"
    )

    # Family
    father_or_husband_name: Optional[str] = Field(
        None, max_length=100, description="Father/Husband name"
    )
    family_size: Optional[int] = Field(
        None, ge=1, le=30, description="Number of family members"
    )

    # Medical Background
    pregnancy_status: Optional[str] = Field(
        None,
        description="Pregnancy status: not_pregnant, pregnant, postpartum",
    )
    pregnancy_week: Optional[int] = Field(
        None, ge=1, le=42, description="Current pregnancy week"
    )
    chronic_diseases: Optional[List[str]] = Field(
        default_factory=list,
        description="List of chronic diseases (diabetes, hypertension, etc.)",
    )
    allergies: Optional[List[str]] = Field(
        default_factory=list, description="Known allergies"
    )
    current_medications: Optional[List[str]] = Field(
        default_factory=list, description="Current medications"
    )
    vaccination_history: Optional[List[str]] = Field(
        default_factory=list, description="Completed vaccinations"
    )
    blood_group: Optional[str] = Field(
        None,
        pattern=r"^(A|B|AB|O)[+-]$",
        description="Blood group (e.g., A+, B-, O+)",
    )

    # Emergency
    emergency_contacts: Optional[List[EmergencyContact]] = Field(
        default_factory=list, description="Emergency contact details"
    )


class PatientUpdate(BaseModel):
    """Request schema for updating patient information."""

    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[Gender] = None
    phone: Optional[str] = Field(None, pattern=r"^\+?[0-9]{10,13}$")
    address: Optional[str] = Field(None, max_length=500)
    village: Optional[str] = Field(None, max_length=100)
    pregnancy_status: Optional[str] = None
    pregnancy_week: Optional[int] = Field(None, ge=1, le=42)
    chronic_diseases: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    current_medications: Optional[List[str]] = None
    vaccination_history: Optional[List[str]] = None
    blood_group: Optional[str] = Field(None, pattern=r"^(A|B|AB|O)[+-]$")
    emergency_contacts: Optional[List[EmergencyContact]] = None


class PatientResponse(BaseModel):
    """Response schema for patient data."""

    id: str
    asha_worker_id: str
    full_name: str
    age: int
    gender: Gender
    date_of_birth: Optional[date] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    father_or_husband_name: Optional[str] = None
    family_size: Optional[int] = None
    pregnancy_status: Optional[str] = None
    pregnancy_week: Optional[int] = None
    chronic_diseases: List[str] = []
    allergies: List[str] = []
    current_medications: List[str] = []
    vaccination_history: List[str] = []
    blood_group: Optional[str] = None
    emergency_contacts: List[EmergencyContact] = []
    risk_level: Optional[RiskLevel] = None
    last_visit_date: Optional[datetime] = None
    total_visits: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PatientListItem(BaseModel):
    """Simplified patient data for list views."""

    id: str
    full_name: str
    age: int
    gender: Gender
    village: Optional[str] = None
    pregnancy_status: Optional[str] = None
    risk_level: Optional[RiskLevel] = None
    last_visit_date: Optional[datetime] = None
    total_visits: int = 0
    chronic_diseases: List[str] = []


class PatientSearchParams(BaseModel):
    """Query parameters for patient search and filtering."""

    query: Optional[str] = Field(None, description="Search by name or phone")
    village: Optional[str] = None
    risk_level: Optional[RiskLevel] = None
    gender: Optional[Gender] = None
    has_chronic_disease: Optional[bool] = None
    is_pregnant: Optional[bool] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
