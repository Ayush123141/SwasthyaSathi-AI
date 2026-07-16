import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind classes with clsx for conditional class handling.
 * This is the standard utility used by shadcn/ui components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date for display.
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/**
 * Format a date with time.
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Get risk level color class.
 */
export function getRiskColor(level: string | undefined | null): string {
  switch (level) {
    case "low":
      return "risk-low"
    case "medium":
      return "risk-medium"
    case "high":
      return "risk-high"
    case "emergency":
      return "risk-emergency"
    default:
      return ""
  }
}

/**
 * Calculate BMI from weight (kg) and height (cm).
 */
export function calculateBMI(weight: number, height: number): number {
  if (height <= 0) return 0
  const heightM = height / 100
  return Math.round((weight / (heightM * heightM)) * 10) / 10
}
