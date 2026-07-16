import { useState } from "react"
import {
  FileText,
  Search,
  Filter,
  Download,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"

// Mock Data for Reports
const mockReports = [
  {
    id: "REP-2026-001",
    patientName: "Aarti Devi",
    date: "2026-04-05",
    type: "AI Assessment",
    riskLevel: "HIGH",
    referralStatus: "Pending",
  },
  {
    id: "REP-2026-002",
    patientName: "Sunita Sharma",
    date: "2026-04-04",
    type: "Routine Checkup",
    riskLevel: "LOW",
    referralStatus: "Not Required",
  },
  {
    id: "REP-2026-003",
    patientName: "Priya Patel",
    date: "2026-04-02",
    type: "AI Assessment",
    riskLevel: "MEDIUM",
    referralStatus: "Completed",
  },
  {
    id: "REP-2026-004",
    patientName: "Kavita Singh",
    date: "2026-04-01",
    type: "Lab Report (OCR)",
    riskLevel: "LOW",
    referralStatus: "Not Required",
  },
]

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Generated Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            View, filter, and export clinical assessments and referral documents.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm w-full sm:w-auto">
          <Download className="w-4 h-4" />
          Export All (CSV)
        </button>
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
            placeholder="Search by patient or report ID..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>

        {/* Type Filter */}
        <div className="relative min-w-[180px] group">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
          <select className="w-full pl-9 pr-10 py-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-all text-sm">
            <option value="">All Report Types</option>
            <option value="assessment">AI Assessment</option>
            <option value="routine">Routine Checkup</option>
            <option value="lab">Lab Report (OCR)</option>
          </select>
        </div>
        
        {/* Status Filter */}
        <div className="relative min-w-[180px] group">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
          <select className="w-full pl-9 pr-10 py-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-all text-sm">
            <option value="">All Referral Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="not_required">Not Required</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Report Details</th>
                <th className="px-6 py-4 font-semibold">Patient</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Risk Level</th>
                <th className="px-6 py-4 font-semibold">Referral Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mockReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-900">
                          {report.type}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {report.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                    {report.patientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {report.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`risk-badge risk-${report.riskLevel.toLowerCase()}`}>
                      {report.riskLevel === "HIGH" && <AlertTriangle className="w-3 h-3" />}
                      {report.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {report.referralStatus === "Pending" && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                      {report.referralStatus === "Completed" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      {report.referralStatus === "Not Required" && (
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                      <span className={`text-sm font-medium ${
                        report.referralStatus === "Pending" ? "text-amber-700" :
                        report.referralStatus === "Completed" ? "text-emerald-700" :
                        "text-slate-500"
                      }`}>
                        {report.referralStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-slate-400 hover:text-blue-600 transition-colors" title="Download PDF">
                        <Download className="w-4.5 h-4.5" />
                      </button>
                      <button className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1" title="View Details">
                        View <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
