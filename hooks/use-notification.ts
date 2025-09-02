"use client"

import { useToast } from "@/hooks/use-toast"

export function useNotification() {
  const { toast } = useToast()

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "success",
      duration: 4000,
    })
  }

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
      duration: 6000,
    })
  }

  const showWarning = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "warning",
      duration: 5000,
    })
  }

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "info",
      duration: 4000,
    })
  }

  const showDefault = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
      duration: 4000,
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showDefault,
    toast, // Expose the original toast function for advanced usage
  }
}
