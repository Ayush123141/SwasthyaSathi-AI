/**
 * SwasthyaSathi AI — Main App Component
 * Handles routing, auth guards, and layout structure.
 */

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "@/stores/authStore"
import LoginPage from "@/pages/LoginPage"
import DashboardPage from "@/pages/DashboardPage"
import PatientsPage from "@/pages/PatientsPage"
import PatientRegistrationPage from "@/pages/PatientRegistrationPage"
import PatientDetailsPage from "@/pages/PatientDetailsPage"
import AppLayout from "@/components/layout/AppLayout"

/**
 * Protected route wrapper — redirects to login if not authenticated.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes — wrapped in AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/new" element={<PatientRegistrationPage />} />
        <Route path="patients/:id" element={<PatientDetailsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
