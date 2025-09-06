"use client"

import { useAudit } from "@/components/audit/audit-provider"

// Safe hook that doesn't throw error if AuditProvider is not available
export function useSafeAudit() {
  try {
    return useAudit()
  } catch (error) {
    // Return mock actions if AuditProvider is not available
    return {
      logAction: async () => {},
      actions: {
        navigate: async () => {},
        login: async () => {},
        logout: async () => {},
        create: async () => {},
        read: async () => {},
        update: async () => {},
        delete: async () => {},
        register: async () => {},
        unregister: async () => {},
        checkin: async () => {},
        checkout: async () => {},
        export: async () => {},
        import: async () => {},
        search: async () => {},
        filter: async () => {},
        settingsChange: async () => {},
        profileUpdate: async () => {},
        upload: async () => {},
        download: async () => {},
        custom: async () => {}
      }
    }
  }
}
