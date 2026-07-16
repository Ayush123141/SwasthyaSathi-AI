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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
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
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          Register Patient
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Search */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, village, or ID..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>

        {/* Risk Filter */}
        <div className="relative min-w-[200px] group">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as RiskLevel | "")}
            className="w-full pl-9 pr-10 py-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-all text-sm"
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
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Table / Empty State */}
      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-sm font-medium text-slate-500">Loading patients from secure storage...</p>
          </div>
        ) : patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Patient</th>
                  <th className="px-6 py-4 font-semibold">Demographics</th>
                  <th className="px-6 py-4 font-semibold">Village</th>
                  <th className="px-6 py-4 font-semibold">Risk Level</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold border border-slate-200">
                          {patient.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-semibold text-sm text-slate-900">
                          {patient.full_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {patient.age} yrs • <span className="capitalize">{patient.gender}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {patient.village || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.risk_level ? (
                        <span className={`risk-badge risk-${patient.risk_level}`}>
                          {patient.risk_level === "high" || patient.risk_level === "emergency" ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : null}
                          {patient.risk_level}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {patient.pregnancy_status === "pregnant" && (
                          <span className="px-2 py-1 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            Pregnant ({patient.pregnancy_week}w)
                          </span>
                        )}
                        {patient.pregnancy_status === "postpartum" && (
                          <span className="px-2 py-1 rounded text-[10px] font-semibold bg-pink-50 text-pink-700 border border-pink-200">
                            Postpartum
                          </span>
                        )}
                        {!patient.pregnancy_status && <span className="text-sm text-slate-400">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/patients/${patient.id}`}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-200">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold mb-1 text-slate-900 tracking-tight">
              No patients found
            </h3>
            <p className="text-sm mb-6 max-w-sm text-slate-500 font-medium">
              {searchQuery || riskFilter
                ? "We couldn't find any patients matching your current search or filters."
                : "Your registry is empty. Register your first patient to start using the system."}
            </p>
            <Link
              to="/patients/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Register Patient
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
