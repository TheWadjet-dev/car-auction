import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para formatear el tiempo restante
export function formatTimeLeft(endDateStr: string): string {
  const endDate = new Date(endDateStr)
  const now = new Date()

  const diffMs = endDate.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffMs < 0) {
    return "Finalizada"
  }

  if (diffDays > 0) {
    return `${diffDays} ${diffDays === 1 ? "día" : "días"}`
  }

  if (diffHours > 0) {
    return `${diffHours} ${diffHours === 1 ? "hora" : "horas"}`
  }

  return `${diffMinutes} ${diffMinutes === 1 ? "minuto" : "minutos"}`
}

// Función para formatear fecha
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

// Función para formatear precio
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
