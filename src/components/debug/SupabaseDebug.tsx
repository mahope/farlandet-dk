import { useState } from 'react'
import { Button } from '../ui/button'
import { supabase, tables } from '../../lib/supabase'

export function SupabaseDebug() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    const testResults: any = {
      env: {
        url: import.meta.env.VITE_SUPABASE_URL,
        hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      }
    }

    try {
      console.log('🚀 Testing Supabase connection...')
      console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
      console.log('Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)

      // Test 1: Basic categories with timeout
      console.log('Testing categories...')
      try {
        const categoriesPromise = supabase
          .from('categories')
          .select('*')
          .limit(3)
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout after 5 seconds')), 5000)
        )

        const { data, error } = await Promise.race([categoriesPromise, timeoutPromise]) as any
        testResults.categories = { data, error, status: 'success' }
        console.log('✅ Categories response:', { data, error })
      } catch (err: any) {
        testResults.categories = { error: err.message, status: 'failed' }
        console.log('❌ Categories failed:', err.message)
      }

      // Test 2: Auth status
      console.log('Testing auth...')
      try {
        const { data: session } = await supabase.auth.getSession()
        testResults.auth = { session: !!session?.session, status: 'success' }
        console.log('✅ Auth session:', !!session?.session)
      } catch (err: any) {
        testResults.auth = { error: err.message, status: 'failed' }
        console.log('❌ Auth failed:', err.message)
      }

      // Test 3: Direct fetch to API
      console.log('Testing direct fetch...')
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/categories?select=*&limit=1`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        })
        const directData = await response.json()
        testResults.directFetch = { 
          status: response.status, 
          data: directData,
          ok: response.ok
        }
        console.log('✅ Direct fetch:', response.status, directData)
      } catch (err: any) {
        testResults.directFetch = { error: err.message, status: 'failed' }
        console.log('❌ Direct fetch failed:', err.message)
      }

      setResult(testResults)
    } catch (err: any) {
      console.error('💥 Debug error:', err)
      testResults.error = err.message
      setResult(testResults)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-4 max-w-md shadow-lg z-50">
      <h3 className="font-semibold mb-2">🐛 Supabase Debug</h3>
      <Button onClick={testConnection} disabled={loading} size="sm" className="mb-2">
        {loading ? 'Testing...' : 'Test Connection'}
      </Button>
      
      {result && (
        <div className="text-xs bg-muted p-2 rounded max-h-64 overflow-auto">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}