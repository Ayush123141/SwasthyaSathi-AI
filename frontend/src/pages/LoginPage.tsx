/**
 * SwasthyaSathi AI — Login Page
 * Premium glassmorphism login with gradient background.
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import {
  Heart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Stethoscope,
  Shield,
  WifiOff,
  Loader2,
  AlertTriangle,
} from "lucide-react"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || "Login failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 bg-slate-950">
      {/* Left panel: Brand and Features (hidden on mobile, shown on md and up) */}
      <div className="hidden md:flex md:col-span-6 lg:col-span-7 relative flex-col justify-between p-12 overflow-hidden gradient-hero">
        {/* Glowing visual overlay */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-teal-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[100px]" />

        {/* Logo and Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-teal-300" />
          </div>
          <span className="font-semibold text-lg text-white tracking-wide">SwasthyaSathi AI</span>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-auto max-w-xl pr-6">
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Clinical Decision Support <br />
            <span className="bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent font-bold">
              Empowering ASHA Workers
            </span>
          </h2>
          <p className="text-slate-300 text-base mb-8 leading-relaxed">
            An intelligent, offline-first health assistant that combines Machine Learning, OCR, and AI clinical reasoning to support patient screening and referrals in rural communities.
          </p>

          {/* Features Checklist */}
          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 flex-shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white">AI Health Assessment</h4>
                <p className="text-xs text-slate-300 mt-1">Instant red-flag alerts and dynamic risk evaluation based on patient vital signs.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 flex-shrink-0">
                <WifiOff className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white">Offline-First Technology</h4>
                <p className="text-xs text-slate-300 mt-1">Works seamlessly without active internet connections, syncing details when online.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white">Secure Patient Records</h4>
                <p className="text-xs text-slate-300 mt-1">Role-based authentication ensures that health data remains secure and private.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info inside hero */}
        <div className="relative z-10 flex justify-between items-center text-slate-400 text-xs pt-4 border-t border-white/10">
          <span>SwasthyaSathi Platform v1.0.0</span>
          <span>NxtWave Hackathon</span>
        </div>
      </div>

      {/* Right panel: Login Form */}
      <div className="col-span-1 md:col-span-6 lg:col-span-5 flex flex-col justify-center px-8 py-16 sm:px-14 md:px-16 lg:px-24 bg-white border-l border-slate-100 relative">
        <div className="w-full max-w-[400px] mx-auto relative z-10">
          {/* Header */}
          <div className="mb-12">
            {/* Logo for mobile view */}
            <div className="md:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-600/20">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-800">SwasthyaSathi AI</span>
            </div>

            <h3 className="text-4xl font-black text-slate-900 tracking-tight">
              Welcome Back
            </h3>
            <p className="text-base text-slate-500 mt-3 leading-relaxed">
              Sign in to access your clinical decision support dashboard.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm animate-fade-in flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-7">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-3"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="asha@phc.gov.in"
                  className="w-full py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm font-medium"
                  style={{ paddingLeft: "3.25rem" }}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-widest"
                >
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm font-medium"
                  style={{ paddingLeft: "3.25rem", paddingRight: "3.25rem" }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold tracking-wide hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20 text-sm mt-4"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400 leading-relaxed">
              ASHA workers can contact their PHC supervisor to manage account credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
