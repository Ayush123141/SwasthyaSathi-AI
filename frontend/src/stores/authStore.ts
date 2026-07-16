/**
 * SwasthyaSathi AI — Auth Store (Zustand)
 * Manages authentication state, login, logout, and session persistence.
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types"
import apiClient from "@/lib/api"

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  setLoading: (loading: boolean) => void
  checkAuth: () => void
}

interface RegisterData {
  email: string
  password: string
  full_name: string
  role: string
  phone?: string
  phc_name?: string
  district?: string
  village?: string
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await apiClient.post("/auth/login", {
            email,
            password,
          })

          const { access_token, refresh_token, user } = response.data.data

          localStorage.setItem("access_token", access_token)
          localStorage.setItem("refresh_token", refresh_token)

          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: unknown) {
          set({ isLoading: false })
          const err = error as { response?: { data?: { detail?: string } } }
          throw new Error(
            err.response?.data?.detail || "Login failed"
          )
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true })
        try {
          await apiClient.post("/auth/register", data)
          set({ isLoading: false })
        } catch (error: unknown) {
          set({ isLoading: false })
          const err = error as { response?: { data?: { detail?: string } } }
          throw new Error(
            err.response?.data?.detail || "Registration failed"
          )
        }
      },

      logout: () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      checkAuth: () => {
        const token = localStorage.getItem("access_token")
        if (!token) {
          set({ isAuthenticated: false, user: null })
        }
      },
    }),
    {
      name: "swasthyasathi-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
