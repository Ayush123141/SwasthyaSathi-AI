/**
 * SwasthyaSathi AI — Patients Page
 * Patient listing with search, filters, and registration.
 */

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  Plus,
  Filter,
  Users,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import type { PatientListItem, RiskLevel } from "@/types"
import { cn } from "@/lib/utils"
import apiClient from "@/lib/api"

import { Link } from "react-router-dom"

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "">("")
  const [patients, setPatients] = useState<PatientListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [totalCount, setTotalCount] = useState(0)

  const fetchPatients = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const params: Record<string, string> = { page_size: "50" }
      if (searchQuery) params.query = searchQuery
      if (riskFilter) params.risk_level = riskFilter

      const response = await apiClient.get("/patients", { params })
      const data = response.data?.data

      setPatients(data?.items || [])
      setTotalCount(data?.total || 0)
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || "Failed to load patients")
      setPatients([])
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, riskFilter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPatients()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchPatients])

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Patients Registry
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {isLoading
              ? "Syncing patients..."
              : `Managing ${totalCount} patient profiles offline.`}
          </p>
        </div>

        <Link
          to="/patients/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold tracking-wide hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20 w-full sm:w-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          Register Patient
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 p-5 rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        {/* Search */}
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, village, or ID..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm font-medium"
          />
        </div>

        {/* Risk Filter */}
        <div className="relative min-w-[200px] group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors z-10" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as RiskLevel | "")}
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 appearance-none cursor-pointer transition-all text-sm font-medium relative"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm animate-fade-in flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-teal-500 mb-4" />
          <p className="text-sm font-medium text-slate-500">Loading patients from secure storage...</p>
        </div>
      ) : patients.length > 0 ? (
        /* Patient List */
        <div className="grid gap-4 animate-fade-in">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-slate-200/60 bg-white shadow-sm text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
            <Users className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-900 tracking-tight">
            No patients found
          </h3>
          <p className="text-sm mb-8 max-w-md text-slate-500 leading-relaxed font-medium">
            {searchQuery || riskFilter
              ? "We couldn't find any patients matching your current search or filters. Try adjusting them."
              : "Your registry is empty. Register your first patient to start using the clinical decision support model."}
          </p>
          <Link
            to="/patients/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20 active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Register New Patient
          </Link>
        </div>
      )}
    </div>
  )
}

/** Individual patient card component */
function PatientCard({ patient }: { patient: PatientListItem }) {
  const riskBadgeClass = patient.risk_level
    ? `risk-badge risk-${patient.risk_level}`
    : ""

  return (
    <Link
      to={`/patients/${patient.id}`}
      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-white transition-all duration-200 cursor-pointer group hover:shadow-md hover:border-teal-200"
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Avatar */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
            patient.gender === "female"
              ? "bg-gradient-to-br from-pink-400 to-rose-500"
              : "bg-gradient-to-br from-blue-400 to-indigo-500"
          )}
        >
          {patient.full_name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-slate-800 group-hover:text-teal-600 transition-colors truncate">
              {patient.full_name}
            </h3>
            {patient.risk_level && (
              <span className={riskBadgeClass}>
                {patient.risk_level === "high" || patient.risk_level === "emergency" ? (
                  <AlertTriangle className="w-3 h-3" />
                ) : null}
                {patient.risk_level}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {patient.age} yrs • {patient.gender} •{" "}
            {patient.village || "Unknown village"} •{" "}
            {patient.total_visits} visits
          </p>
        </div>
      </div>

      {/* Right details */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {patient.pregnancy_status === "pregnant" && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-50 text-pink-600 border border-pink-200">
            🤰 Pregnant ({patient.pregnancy_week}w)
          </span>
        )}
        {patient.pregnancy_status === "postpartum" && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-200">
            🍼 Postpartum
          </span>
        )}
      </div>
    </Link>
  )
}
