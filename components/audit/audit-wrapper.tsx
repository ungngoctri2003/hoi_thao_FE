"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useFrontendAudit } from "@/hooks/use-frontend-audit"

interface AuditWrapperProps {
  children: React.ReactNode
}

// Wrapper component that automatically logs page navigation
export function AuditWrapper({ children }: AuditWrapperProps) {
  const pathname = usePathname()
  const { actions } = useFrontendAudit()

  useEffect(() => {
    // Log page navigation when pathname changes
    if (pathname) {
      actions.navigate(pathname)
    }
  }, [pathname, actions])

  return <>{children}</>
}
