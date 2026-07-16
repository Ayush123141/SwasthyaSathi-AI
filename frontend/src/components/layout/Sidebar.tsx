/**
 * SwasthyaSathi AI — Sidebar Navigation
 * Collapsible sidebar with icons and role-based menu items.
 */

import { useState } from "react"
import { NavLink } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import {
  Heart,
  LayoutDashboard,
  Users,
  Stethoscope,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/patients", icon: Users, label: "Patients" },
  { to: "/visits", icon: Stethoscope, label: "Visits", disabled: true },
  { to: "/reports", icon: FileText, label: "Reports", disabled: true },
  { to: "/analytics", icon: BarChart3, label: "Analytics", disabled: true },
  { to: "/settings", icon: Settings, label: "Settings", disabled: true },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()

  return (
    <aside
      className={cn(
        "flex flex-col border-r transition-all duration-300 ease-in-out flex-shrink-0 relative z-20",
        collapsed ? "w-[68px]" : "w-64"
      )}
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 p-5 border-b"
        style={{ borderColor: "var(--border-color)" }}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
          <Heart className="w-4.5 h-4.5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in flex flex-col justify-center">
            <h2
              className="font-bold text-sm tracking-tight text-slate-900"
            >
              SwasthyaSathi
            </h2>
            <p
              className="text-[10px] font-medium text-teal-600 uppercase tracking-wider mt-0.5"
            >
              AI Platform
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, disabled }) => (
          <NavLink
            key={to}
            to={disabled ? "#" : to}
            onClick={(e) => disabled && e.preventDefault()}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive && !disabled
                  ? "bg-teal-500/10 text-teal-600 font-semibold"
                  : "hover:bg-black/5",
                disabled && "opacity-40 cursor-not-allowed"
              )
            }
            style={({ isActive }) =>
              isActive && !disabled
                ? undefined
                : { color: "var(--text-secondary)" }
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Collapse */}
      <div
        className="p-4 mt-auto space-y-3"
      >
        {/* User */}
        {!collapsed && user && (
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-200 bg-white/50 shadow-sm animate-fade-in transition-all hover:bg-white"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-inner">
              {user.full_name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-xs font-bold text-slate-800 truncate"
              >
                {user.full_name}
              </p>
              <p
                className="text-[10px] font-medium text-slate-500 capitalize"
              >
                {user.role?.replace("_", " ")}
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-rose-50 text-rose-600 border border-transparent hover:border-rose-100",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-1.5 rounded-lg hover:bg-black/5 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
