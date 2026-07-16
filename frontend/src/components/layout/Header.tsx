/**
 * SwasthyaSathi AI — Header
 * Top bar with search, sync status, and notifications.
 */

import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import {
  Search,
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react"

export default function Header() {
  const { user } = useAuthStore()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [searchQuery, setSearchQuery] = useState("")

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

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search patients, visits..."
          className="w-full pl-9 pr-4 py-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3 ml-4">
        {/* Sync Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase border ${
            isOnline
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>Synced</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline</span>
            </>
          )}
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1" /> {/* Divider */}

        {/* Sync Button */}
        <button
          className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          title="Sync data"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" /> {/* Divider */}

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer shadow-sm ml-1 hover:bg-blue-700 transition-colors">
          {user?.full_name?.charAt(0)?.toUpperCase() || "A"}
        </div>
      </div>
    </header>
  )
}
