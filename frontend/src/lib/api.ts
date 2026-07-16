/**
 * SwasthyaSathi AI — API Client
 * Axios-based HTTP client with JWT token attachment and error handling.
 */

import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || ""

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
})

// Request interceptor — attach JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and we haven't retried yet, try refreshing the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem("refresh_token")
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/auth/refresh`,
            null,
            { params: { refresh_token: refreshToken } }
          )

          const { access_token, refresh_token: newRefreshToken } =
            response.data.data

          localStorage.setItem("access_token", access_token)
          localStorage.setItem("refresh_token", newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return apiClient(originalRequest)
        } catch {
          // Refresh failed — clear tokens and redirect to login
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          window.location.href = "/login"
        }
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
