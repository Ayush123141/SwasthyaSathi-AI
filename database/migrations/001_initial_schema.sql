-- ============================================
-- SwasthyaSathi AI — Initial Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (extends Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'asha_worker' CHECK (role IN ('asha_worker', 'supervisor', 'admin')),
    phone TEXT,
    phc_name TEXT,
    district TEXT,
    village TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asha_worker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 120),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    date_of_birth DATE,
    phone TEXT,
    address TEXT,
    village TEXT,
    district TEXT,
    father_or_husband_name TEXT,
    family_size INTEGER CHECK (family_size >= 1 AND family_size <= 30),
    pregnancy_status TEXT DEFAULT 'not_pregnant' CHECK (pregnancy_status IN ('not_pregnant', 'pregnant', 'postpartum')),
    pregnancy_week INTEGER CHECK (pregnancy_week >= 1 AND pregnancy_week <= 42),
    chronic_diseases JSONB DEFAULT '[]'::jsonb,
    allergies JSONB DEFAULT '[]'::jsonb,
    current_medications JSONB DEFAULT '[]'::jsonb,
    vaccination_history JSONB DEFAULT '[]'::jsonb,
    blood_group TEXT CHECK (blood_group ~ '^(A|B|AB|O)[+-]$'),
    emergency_contacts JSONB DEFAULT '[]'::jsonb,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'emergency')),
    last_visit_date TIMESTAMPTZ,
    total_visits INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. VISITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    asha_worker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    visit_type TEXT DEFAULT 'routine' CHECK (visit_type IN ('routine', 'follow_up', 'emergency', 'anc', 'pnc', 'immunization')),
    visit_location TEXT CHECK (visit_location IN ('home', 'phc', 'sub_center', 'chc', 'hospital')),

    -- Vital Signs (stored as JSONB for flexibility)
    vitals JSONB DEFAULT '{}'::jsonb,

    -- Clinical Data
    symptoms JSONB DEFAULT '[]'::jsonb,
    symptom_details TEXT,
    observations TEXT,
    medications_given JSONB DEFAULT '[]'::jsonb,
    lifestyle_notes TEXT,

    -- Voice Input
    voice_transcript TEXT,
    voice_language TEXT,

    -- AI Assessment Results
    ai_risk_level TEXT CHECK (ai_risk_level IN ('low', 'medium', 'high', 'emergency')),
    ml_confidence_score REAL CHECK (ml_confidence_score >= 0 AND ml_confidence_score <= 1),
    emergency_flags JSONB DEFAULT '[]'::jsonb,
    ai_recommendation TEXT,
    ai_explanation TEXT,
    referral_needed BOOLEAN DEFAULT false,
    referral_type TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. MEDICAL REPORTS TABLE (OCR Documents)
-- ============================================
CREATE TABLE IF NOT EXISTS public.medical_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
    report_type TEXT NOT NULL CHECK (report_type IN ('prescription', 'lab_report', 'discharge_summary', 'imaging', 'other')),
    document_url TEXT,
    ocr_raw_text TEXT,
    extracted_data JSONB DEFAULT '{}'::jsonb,
    ai_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. REFERRALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
    referred_by UUID NOT NULL REFERENCES public.users(id),
    hospital_name TEXT,
    referral_type TEXT CHECK (referral_type IN ('phc', 'chc', 'district_hospital', 'emergency', 'specialist')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'emergency')),
    reason TEXT,
    ai_assessment_summary TEXT,
    ambulance_needed BOOLEAN DEFAULT false,
    outcome TEXT,
    outcome_date TIMESTAMPTZ,
    pdf_report_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. FOLLOW-UPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    follow_up_type TEXT DEFAULT 'general',
    reason TEXT,
    medicine_adherence_check BOOLEAN DEFAULT false,
    vaccination_reminder BOOLEAN DEFAULT false,
    pending_actions JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'rescheduled')),
    completed_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. MEDICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    start_date DATE,
    end_date DATE,
    prescribed_by TEXT,
    adherence_score REAL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. VACCINATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    vaccine_name TEXT NOT NULL,
    dose_number INTEGER DEFAULT 1,
    scheduled_date DATE,
    administered_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'delayed')),
    administered_by TEXT,
    batch_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. PREGNANCY MONITORING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pregnancy_monitoring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
    gestational_week INTEGER CHECK (gestational_week >= 1 AND gestational_week <= 42),
    anc_visit_number INTEGER,
    weight REAL,
    blood_pressure TEXT,
    hemoglobin REAL,
    fetal_heart_rate INTEGER,
    fundal_height REAL,
    complications JSONB DEFAULT '[]'::jsonb,
    risk_factors JSONB DEFAULT '[]'::jsonb,
    delivery_date DATE,
    delivery_type TEXT,
    delivery_outcome TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. CHILD GROWTH RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.child_growth_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
    age_months INTEGER NOT NULL CHECK (age_months >= 0 AND age_months <= 72),
    weight REAL,
    height REAL,
    head_circumference REAL,
    muac REAL,
    weight_for_age_z REAL,
    height_for_age_z REAL,
    weight_for_height_z REAL,
    bmi_for_age_z REAL,
    nutrition_status TEXT CHECK (nutrition_status IN ('normal', 'moderate_malnutrition', 'severe_malnutrition', 'overweight')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. RISK PREDICTIONS TABLE (ML outputs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.risk_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
    model_version TEXT,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'emergency')),
    confidence_score REAL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    feature_importance JSONB DEFAULT '{}'::jsonb,
    risk_factors JSONB DEFAULT '[]'::jsonb,
    trend_analysis JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 12. GUIDELINE REFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.guideline_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
    guideline_source TEXT NOT NULL,
    guideline_title TEXT NOT NULL,
    guideline_text TEXT NOT NULL,
    relevance_score REAL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT DEFAULT 'info' CHECK (notification_type IN ('info', 'warning', 'emergency', 'reminder', 'follow_up')),
    is_read BOOLEAN DEFAULT false,
    related_patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 14. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_patients_asha_worker ON public.patients(asha_worker_id);
CREATE INDEX IF NOT EXISTS idx_patients_village ON public.patients(village);
CREATE INDEX IF NOT EXISTS idx_patients_district ON public.patients(district);
CREATE INDEX IF NOT EXISTS idx_patients_risk_level ON public.patients(risk_level);
CREATE INDEX IF NOT EXISTS idx_patients_pregnancy ON public.patients(pregnancy_status) WHERE pregnancy_status = 'pregnant';
CREATE INDEX IF NOT EXISTS idx_patients_name_search ON public.patients USING gin(to_tsvector('english', full_name));

CREATE INDEX IF NOT EXISTS idx_visits_patient ON public.visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON public.visits(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_visits_asha_worker ON public.visits(asha_worker_id);
CREATE INDEX IF NOT EXISTS idx_visits_risk_level ON public.visits(ai_risk_level);

CREATE INDEX IF NOT EXISTS idx_referrals_patient ON public.referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_follow_ups_patient ON public.follow_ups(patient_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_date ON public.follow_ups(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON public.follow_ups(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancy_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_growth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users: can read own profile, admins can read all
CREATE POLICY users_select_own ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON public.users FOR UPDATE USING (auth.uid() = id);

-- Patients: ASHA workers see their own patients, supervisors see district
CREATE POLICY patients_select ON public.patients FOR SELECT USING (
    asha_worker_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('supervisor', 'admin')
    )
);
CREATE POLICY patients_insert ON public.patients FOR INSERT WITH CHECK (asha_worker_id = auth.uid());
CREATE POLICY patients_update ON public.patients FOR UPDATE USING (asha_worker_id = auth.uid());

-- Visits: same access as patients
CREATE POLICY visits_select ON public.visits FOR SELECT USING (
    asha_worker_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('supervisor', 'admin')
    )
);
CREATE POLICY visits_insert ON public.visits FOR INSERT WITH CHECK (asha_worker_id = auth.uid());

-- Notifications: users see only their own
CREATE POLICY notifications_select ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_update ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON public.visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
