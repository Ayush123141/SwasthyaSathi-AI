/**
 * SwasthyaSathi AI — TypeScript Type Definitions
 */

// ============================================
// User & Auth Types
// ============================================
export type UserRole = "asha_worker" | "supervisor" | "admin"

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone?: string
  phc_name?: string
  district?: string
  village?: string
  avatar_url?: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ============================================
// Patient Types
// ============================================
export type Gender = "male" | "female" | "other"
export type RiskLevel = "low" | "medium" | "high" | "emergency"
export type PregnancyStatus = "not_pregnant" | "pregnant" | "postpartum"

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface Patient {
  id: string
  asha_worker_id: string
  full_name: string
  age: number
  gender: Gender
  date_of_birth?: string
  phone?: string
  address?: string
  village?: string
  district?: string
  father_or_husband_name?: string
  family_size?: number
  pregnancy_status?: PregnancyStatus
  pregnancy_week?: number
  chronic_diseases: string[]
  allergies: string[]
  current_medications: string[]
  vaccination_history: string[]
  blood_group?: string
  emergency_contacts: EmergencyContact[]
  risk_level?: RiskLevel
  last_visit_date?: string
  total_visits: number
  created_at?: string
  updated_at?: string
  recent_visits?: Visit[]
}

export interface PatientListItem {
  id: string
  full_name: string
  age: number
  gender: Gender
  village?: string
  district?: string
  pregnancy_status?: PregnancyStatus
  pregnancy_week?: number
  risk_level?: RiskLevel
  last_visit_date?: string
  total_visits: number
  chronic_diseases?: string[]
}

// ============================================
// Visit & Vitals Types
// ============================================
export interface VitalSigns {
  systolic_bp?: number
  diastolic_bp?: number
  pulse_rate?: number
  temperature?: number
  spo2?: number
  blood_sugar?: number
  weight?: number
  height?: number
  bmi?: number
}

export interface Visit {
  id: string
  patient_id: string
  asha_worker_id: string
  visit_date: string
  visit_type?: string
  visit_location?: string
  vitals?: VitalSigns
  symptoms: string[]
  symptom_details?: string
  observations?: string
  medications_given: string[]
  lifestyle_notes?: string
  voice_transcript?: string
  voice_language?: string
  ai_risk_level?: RiskLevel
  ml_confidence_score?: number
  emergency_flags?: string[]
  ai_recommendation?: string
  referral_needed: boolean
  referral_type?: string
  created_at?: string
}

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// ============================================
// UI State Types
// ============================================
export type ThemeMode = "light" | "dark"

export interface SyncStatus {
  isOnline: boolean
  pendingSync: number
  lastSyncTime?: string
  isSyncing: boolean
}
