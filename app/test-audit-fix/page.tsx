"use client"

import { useSafeAudit } from "@/hooks/use-safe-audit"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export default function TestAuditFixPage() {
  const { actions } = useSafeAudit()
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const testActions = async () => {
    addLog('Testing audit actions...')
    
    try {
      await actions.login()
      addLog('✅ Login action logged')
    } catch (error) {
      addLog(`❌ Login action failed: ${error}`)
    }

    try {
      await actions.navigate('Test Page')
      addLog('✅ Navigation action logged')
    } catch (error) {
      addLog(`❌ Navigation action failed: ${error}`)
    }

    try {
      await actions.custom('Test Action', 'Test Page', 'Test Details')
      addLog('✅ Custom action logged')
    } catch (error) {
      addLog(`❌ Custom action failed: ${error}`)
    }

    addLog('Test completed!')
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Audit Fix</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testActions} className="w-full">
                Test Audit Actions
              </Button>
              <Button onClick={clearLogs} variant="outline" className="w-full">
                Clear Logs
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Test Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto bg-gray-50 p-4 rounded border">
                {logs.length === 0 ? (
                  <p className="text-gray-500">No logs yet. Click "Test Audit Actions" to start.</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="text-sm mb-2 font-mono">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. This page tests the <code>useSafeAudit</code> hook</p>
              <p>2. It should work even without <code>AuditProvider</code></p>
              <p>3. If you see this page without errors, the fix is working</p>
              <p>4. Check the logs to see if audit actions are being called</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
