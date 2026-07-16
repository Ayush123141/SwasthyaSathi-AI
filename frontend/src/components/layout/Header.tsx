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
    <header
      className="flex items-center justify-between px-6 py-3 border-b"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search patients, visits..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/50 transition-all"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3 ml-4">
        {/* Sync Status */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
            isOnline
              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
              : "bg-amber-50 text-amber-600 border-amber-200"
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

        {/* Sync Button */}
        <button
          className="p-2 rounded-lg hover:bg-black/5 transition-colors"
          style={{ color: "var(--text-muted)" }}
          title="Sync data"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-black/5 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer shadow-sm">
          {user?.full_name?.charAt(0)?.toUpperCase() || "A"}
        </div>
      </div>
    </header>
  )
}
