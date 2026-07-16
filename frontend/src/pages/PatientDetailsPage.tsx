import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  Activity,
  Calendar,
  FileText,
  AlertTriangle,
  Heart,
  Clock,
  ChevronRight,
  FileSearch,
  Stethoscope,
  Plus,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import apiClient from "@/lib/api"
import type { PatientListItem } from "@/types"

const mockVitalsData = [
  { date: "Jan 10", bpSys: 120, bpDia: 80, pulse: 72 },
  { date: "Feb 14", bpSys: 125, bpDia: 82, pulse: 75 },
  { date: "Mar 22", bpSys: 135, bpDia: 88, pulse: 80 },
  { date: "Apr 05", bpSys: 140, bpDia: 90, pulse: 85 }, // High risk spike
]

const mockTimeline = [
  {
    id: 1,
    type: "visit",
    title: "Routine Checkup",
    date: "April 5, 2026",
    description: "Patient reported mild headaches and fatigue.",
  },
  {
    id: 2,
    type: "alert",
    title: "AI Risk Assessment Triggered",
    date: "April 5, 2026",
    description: "High blood pressure detected. Pregnancy risk elevated to HIGH.",
  },
  {
    id: 3,
    type: "report",
    title: "Blood Test Results Uploaded",
    date: "March 22, 2026",
    description: "Hemoglobin slightly low. Iron supplements recommended.",
  },
]

export default function PatientDetailsPage() {
  const { id } = useParams()
  const [patient, setPatient] = useState<PatientListItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPatient() {
      try {
        const response = await apiClient.get(`/patients/${id}`)
        setPatient(response.data?.data)
      } catch (err) {
        // Fallback for UI demonstration if API fails or isn't fully implemented
        setPatient({
          id: id || "1",
          full_name: "Aarti Devi",
          gender: "female",
          age: 28,
          risk_level: "high",
          village: "Rampur",
          pregnancy_status: "pregnant",
          pregnancy_week: 24,
          total_visits: 4,
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchPatient()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading patient record...</p>
      </div>
    )
  }

  if (!patient) return null

  const isHighRisk = patient.risk_level === "high" || patient.risk_level === "emergency"

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            to="/patients"
            className="p-2 -ml-2 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {patient.full_name}
              </h1>
              {patient.risk_level && (
                <span className={`risk-badge risk-${patient.risk_level}`}>
                  {isHighRisk && <AlertTriangle className="w-3 h-3" />}
                  {patient.risk_level} Risk
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {patient.age} yrs
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="capitalize">{patient.gender}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{patient.village || "Unknown Village"}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>ID: {patient.id.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/referral?patientId=${patient.id}`}
            className="px-4 py-2 rounded-md bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            Generate Referral
          </Link>
          <Link
            to={`/visits/new?patientId=${patient.id}`}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Record Visit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Conditions / Pregnancy Status */}
          {patient.pregnancy_status === "pregnant" && (
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50 flex items-start gap-4">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">Active Pregnancy Tracking</h3>
                <p className="text-sm text-purple-700 mt-1">
                  Patient is in week {patient.pregnancy_week} of pregnancy. Last antenatal checkup was 14 days ago.
                </p>
              </div>
            </div>
          )}

          {/* Vitals Graph */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" /> Blood Pressure Trends
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockVitalsData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Area type="monotone" dataKey="bpSys" name="Systolic" stroke="#dc2626" strokeWidth={2} fillOpacity={1} fill="url(#colorSys)" />
                  <Area type="monotone" dataKey="bpDia" name="Diastolic" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorDia)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Patient History
            </h3>
            <div className="space-y-6">
              {mockTimeline.map((item, index) => (
                <div key={item.id} className="flex gap-4 relative">
                  {index !== mockTimeline.length - 1 && (
                    <div className="absolute left-[15px] top-[30px] bottom-[-24px] w-px bg-slate-200" />
                  )}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                    item.type === "alert" ? "bg-red-100 text-red-600" :
                    item.type === "report" ? "bg-blue-100 text-blue-600" :
                    "bg-emerald-100 text-emerald-600"
                  }`}>
                    {item.type === "alert" ? <AlertTriangle className="w-3.5 h-3.5" /> :
                     item.type === "report" ? <FileSearch className="w-3.5 h-3.5" /> :
                     <Stethoscope className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">{item.title}</h4>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">{item.date}</p>
                    <p className="text-sm text-slate-600 mt-1.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          
          {/* AI Recommendation Card */}
          <div className="p-5 rounded-xl border border-red-200 bg-white shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold">AI Clinical Alert</h3>
            </div>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              Based on recent vitals (BP 140/90), the patient shows signs of Gestational Hypertension.
            </p>
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
              <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide">Recommended Action</h4>
              <p className="text-sm text-red-700 mt-1">Immediate referral to CHC (Community Health Center) for pre-eclampsia screening.</p>
            </div>
          </div>

          {/* OCR Reports */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Scanned Reports
              </h3>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">View All</button>
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">Lab Results (Blood)</p>
                      <p className="text-xs text-slate-500">March 22, 2026</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
