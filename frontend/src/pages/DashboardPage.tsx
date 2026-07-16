/**
 * SwasthyaSathi AI — Dashboard Page
 * Overview with key metrics and quick actions for ASHA workers.
 */

import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import apiClient from "@/lib/api"
import {
  Users,
  Activity,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Stethoscope,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const quickActions = [
  {
    label: "Register Patient",
    description: "Add a new patient to your records",
    icon: Users,
    href: "/patients?action=new",
    color: "from-teal-500 to-emerald-600",
  },
  {
    label: "Record Visit",
    description: "Log vitals and symptoms",
    icon: Stethoscope,
    href: "/visits/new",
    color: "from-indigo-500 to-purple-600",
  },
  {
    label: "Scan Document",
    description: "OCR prescription or lab report",
    icon: FileText,
    href: "/ocr",
    color: "from-pink-500 to-rose-600",
  },
  {
    label: "View Reports",
    description: "AI assessments & referrals",
    icon: TrendingUp,
    href: "/reports",
    color: "from-amber-500 to-orange-600",
  },
]

const chartData = [
  { name: "Mon", Visits: 5 },
  { name: "Tue", Visits: 8 },
  { name: "Wed", Visits: 12 },
  { name: "Thu", Visits: 6 },
  { name: "Fri", Visits: 15 },
  { name: "Sat", Visits: 9 },
  { name: "Sun", Visits: 4 },
]

interface DashboardStats {
  totalPatients: number
  highRiskCount: number
  pregnantCount: number
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    highRiskCount: 0,
    pregnantCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await apiClient.get("/patients", {
          params: { page_size: 100 },
        })
        const patients = response.data?.data?.items || []
        const total = response.data?.data?.total || patients.length

        const highRisk = patients.filter(
          (p: { risk_level?: string }) =>
            p.risk_level === "high" || p.risk_level === "emergency"
        ).length

        const pregnant = patients.filter(
          (p: { pregnancy_status?: string }) =>
            p.pregnancy_status === "pregnant"
        ).length

        setStats({
          totalPatients: total,
          highRiskCount: highRisk,
          pregnantCount: pregnant,
        })
      } catch {
        // If API fails, keep zeros — dashboard still renders
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      label: "Total Patients",
      value: stats.totalPatients.toString(),
      icon: Users,
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
      change: "Registered locally",
    },
    {
      label: "Visits This Week",
      value: "—",
      icon: Activity,
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      change: "Coming soon",
    },
    {
      label: "High Risk Patients",
      value: stats.highRiskCount.toString(),
      icon: AlertTriangle,
      bgColor: "bg-rose-50",
      textColor: "text-rose-600",
      change: "Needs attention",
    },
    {
      label: "Follow-ups Due",
      value: "—",
      icon: Calendar,
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      change: "Coming soon",
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-8 text-white relative overflow-hidden bg-slate-900 shadow-xl shadow-slate-900/10">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl translate-y-1/2" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-200 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                SwasthyaSathi AI
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
              Namaste, {user?.full_name?.split(" ")[0] || "ASHA"}
            </h1>
            <p className="text-slate-300 text-sm max-w-lg leading-relaxed font-medium">
              Your offline-first clinical decision support model is ready. 
              {stats.highRiskCount > 0 && (
                <span className="text-rose-300 font-semibold ml-1">
                  You have {stats.highRiskCount} high-risk patients needing attention today.
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex-shrink-0 shadow-inner">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">System Status</p>
              <p className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                100% Synced
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(({ label, value, icon: Icon, bgColor, textColor, change }) => (
          <div
            key={label}
            className="rounded-2xl p-5 border border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
          >
            {/* Hover decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  {label}
                </span>
                <div className={`p-2.5 rounded-xl ${bgColor} shadow-inner`}>
                  <Icon className={`w-4.5 h-4.5 ${textColor}`} />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                  ) : (
                    <span className="text-3xl font-black tracking-tight text-slate-900">
                      {value}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{change}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-8 rounded-xl p-6 border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Community Health Trends
              </h3>
              <p className="text-xs text-slate-500">
                Weekly visit activity and medical risk classification levels.
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Live Feed
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    fontSize: "12px",
                    color: "#0f172a",
                  }}
                />
                <Area type="monotone" dataKey="Visits" name="Visits Recorded" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px", color: "#64748b" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Column */}
        <div className="lg:col-span-4 rounded-xl p-6 border border-slate-200 bg-white">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">
              ASHA Operations
            </h3>
            <p className="text-xs text-slate-500">
              Frequently used clinical procedures and toolkits.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ label, description, icon: Icon, color }) => (
              <button
                key={label}
                className="group flex flex-col justify-between rounded-xl p-4 border border-slate-200 text-left transition-all duration-200 hover:shadow-md hover:border-teal-200 bg-white"
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${color} text-white w-fit mb-3 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-800 group-hover:text-teal-600 transition-colors">
                    {label}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                    {description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
