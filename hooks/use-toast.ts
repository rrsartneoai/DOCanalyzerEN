"use client"

// This is a placeholder for shadcn/ui's useToast hook.
// In a real application, you would import `useToast` from `@/components/ui/use-toast`.
// This file is provided to satisfy imports in test files or other components.

import * as React from "react"
import { toast } from "react-toastify" // Importing toast from react-toastify

type Toast = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

type ToastAction = {
  label: string
  onClick: () => void
}

type ToastOptions = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
  action?: ToastAction
}

type ToastContextType = {
  toast: (options: ToastOptions) => { id: string }
  dismiss: (id: string) => void
  toasts: Toast[]
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toastFunction = React.useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9) // Simple ID generation
    const newToast: Toast = { id, ...options }
    setToasts((prev) => [...prev, newToast])

    const duration = options.duration ?? 5000
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)

    return { id }
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = React.useMemo(() => ({ toast: toastFunction, dismiss, toasts }), [toastFunction, dismiss, toasts])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    // This means the component is not wrapped in a ToastProvider.
    // For testing or environments where shadcn/ui's Toaster isn't fully set up,
    // we can provide a mock or a console log.
    // In a real app, you'd ensure <Toaster /> and its provider are in layout.tsx.
    console.warn("useToast must be used within a ToastProvider. Returning a no-op toast.")
    return {
      toast: (options: ToastOptions) => {
        console.log("Mock Toast:", options.title, options.description)
        return { id: "mock-id" }
      },
      dismiss: () => {},
      toasts: [],
    }
  }
  return context
}

// Re-exporting for consistency with shadcn/ui's structure
export { toast }
