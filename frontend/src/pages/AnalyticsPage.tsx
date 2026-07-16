import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Activity, Users, MapPin, TrendingUp } from "lucide-react"

// Mock Data
const villageData = [
  { name: "Rampur", patients: 120 },
  { name: "Sitapur", patients: 85 },
  { name: "Kondapur", patients: 65 },
  { name: "Madhapur", patients: 40 },
]

const riskData = [
  { name: "Low Risk", value: 150, color: "#10b981" },
  { name: "Medium Risk", value: 80, color: "#f59e0b" },
  { name: "High Risk", value: 30, color: "#ef4444" },
  { name: "Emergency", value: 5, color: "#991b1b" },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Analytics & Insights
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Population health metrics across all registered villages.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Population Monitored", value: "265", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Villages Covered", value: "4", icon: MapPin, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "High Risk Cases", value: "35", icon: Activity, color: "text-red-600", bg: "bg-red-50" },
          { label: "AI Intervention Rate", value: "14%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((stat) => (
          <div key={stat.label} className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-start gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} shrink-0`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Patient Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#0f172a", fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {riskData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-semibold text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Village Demographics Bar Chart */}
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Registration by Village</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={villageData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="patients" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
