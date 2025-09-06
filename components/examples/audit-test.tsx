"use client"

import { useSafeAudit } from "@/hooks/use-safe-audit"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AuditTest() {
  const { actions } = useSafeAudit()

  const testActions = [
    {
      label: "Test Login",
      action: () => actions.login(),
      description: "Log a login action"
    },
    {
      label: "Test Logout", 
      action: () => actions.logout(),
      description: "Log a logout action"
    },
    {
      label: "Test Navigation",
      action: () => actions.navigate("Test Page"),
      description: "Log a navigation action"
    },
    {
      label: "Test Create",
      action: () => actions.create("Test Item", "Test Page"),
      description: "Log a create action"
    },
    {
      label: "Test Read",
      action: () => actions.read("Test Item", "Test Page"),
      description: "Log a read action"
    },
    {
      label: "Test Update",
      action: () => actions.update("Test Item", "Test Page"),
      description: "Log an update action"
    },
    {
      label: "Test Delete",
      action: () => actions.delete("Test Item", "Test Page"),
      description: "Log a delete action"
    },
    {
      label: "Test Search",
      action: () => actions.search("test query", "Test Page"),
      description: "Log a search action"
    },
    {
      label: "Test Custom",
      action: () => actions.custom("Custom Action", "Test Page", "Custom details"),
      description: "Log a custom action"
    }
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Audit System Test</CardTitle>
        <p className="text-sm text-muted-foreground">
          Test the audit logging system by clicking the buttons below. 
          Check the browser console and database for logged actions.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {testActions.map((test, index) => (
            <div key={index} className="space-y-2">
              <Button 
                onClick={test.action}
                variant="outline"
                className="w-full"
              >
                {test.label}
              </Button>
              <p className="text-xs text-muted-foreground">
                {test.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
