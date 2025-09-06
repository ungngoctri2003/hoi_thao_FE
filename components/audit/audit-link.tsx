"use client"

import Link from "next/link"
import { ReactNode } from "react"

interface AuditLinkProps {
  href: string
  children: ReactNode
  pageName?: string
  action?: string
}

export function AuditLink({ href, children, pageName, action }: AuditLinkProps) {
  const handleClick = async () => {
    // For now, just navigate normally
    // Audit logging will be handled by the AuditProvider in MainLayout
    // when the user actually navigates to the page
  }

  return (
    <Link href={href} onClick={handleClick}>
      {children}
    </Link>
  )
}
