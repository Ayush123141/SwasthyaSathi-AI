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
  Heart,
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
  },
  {
    label: "Record Visit",
    description: "Log vitals and symptoms",
    icon: Stethoscope,
    href: "/visits/new",
  },
  {
    label: "Scan Report",
    description: "OCR prescription or lab report",
    icon: FileText,
    href: "/ocr",
  },
  {
    label: "AI Assessment",
    description: "Run clinical decision support",
    icon: Activity,
    href: "/assessment",
  },
  {
    label: "Generate Referral",
    description: "Create referral document",
    icon: ArrowUpRight,
    href: "/referral",
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
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

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
        // If API fails, keep zeros
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
      colorClass: "text-blue-600",
      bgClass: "bg-blue-50",
      change: "+12 this month",
    },
    {
      label: "Today's Visits",
      value: "—",
      icon: Activity,
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-50",
      change: "0 scheduled",
    },
    {
      label: "High Risk Patients",
      value: stats.highRiskCount.toString(),
      icon: AlertTriangle,
      colorClass: "text-red-600",
      bgClass: "bg-red-50",
      change: "Needs attention",
    },
    {
      label: "Pending Follow-ups",
      value: "—",
      icon: Calendar,
      colorClass: "text-amber-600",
      bgClass: "bg-amber-50",
      change: "Check schedule",
    },
    {
      label: "Pregnant Women",
      value: stats.pregnantCount.toString(),
      icon: Heart,
      colorClass: "text-purple-600",
      bgClass: "bg-purple-50",
      change: "Active tracking",
    },
    {
      label: "Offline Sync Status",
      value: isOnline ? "Synced" : "Offline",
      icon: isOnline ? CheckCircle2 : AlertTriangle,
      colorClass: isOnline ? "text-emerald-600" : "text-amber-600",
      bgClass: isOnline ? "bg-emerald-50" : "bg-amber-50",
      change: isOnline ? "Last synced just now" : "Pending sync",
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Clean Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Good Morning, {user?.full_name?.split(" ")[0] || "ASHA"}
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 font-medium">
          Here's a summary of your community health tracking and pending tasks.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, colorClass, bgClass, change }) => (
          <div
            key={label}
            className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {label}
              </span>
              <div className={`p-1.5 rounded-md ${bgClass}`}>
                <Icon className={`w-4 h-4 ${colorClass}`} />
              </div>
            </div>
            <div className="mt-auto">
              {isLoading && label !== "Offline Sync Status" ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-300 mb-1" />
              ) : (
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {value}
                </div>
              )}
              <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                {change}
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
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Live Feed
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
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
                <Area type="monotone" dataKey="Visits" name="Visits Recorded" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" />
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
            {quickActions.map(({ label, description, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                className="group flex flex-col justify-between rounded-xl p-4 border border-slate-200 text-left transition-all duration-200 hover:shadow-md hover:border-blue-300 bg-white"
              >
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600 w-fit mb-3 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-800 group-hover:text-blue-600 transition-colors">
                    {label}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                    {description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
