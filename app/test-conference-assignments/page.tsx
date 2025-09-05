"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

export default function TestConferenceAssignmentsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const testAPI = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('User:', user)
        console.log('Is authenticated:', isAuthenticated)
        
        const response = await apiClient.getUserConferenceAssignments({
          page: 1,
          limit: 10
        })
        
        console.log('API Response:', response)
        setData(response)
      } catch (err: any) {
        console.error('API Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    testAPI()
  }, [user, isAuthenticated])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Conference Assignments API</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Conference Assignments API</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">User Info:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify({ user, isAuthenticated }, null, 2)}
        </pre>
      </div>

      {error && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2 text-red-600">Error:</h2>
          <div className="bg-red-100 p-4 rounded text-red-800">
            {error}
          </div>
        </div>
      )}

      {data && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">API Response:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4">
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Test
        </button>
      </div>
    </div>
  )
}


