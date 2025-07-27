import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface AuthCallbackProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function AuthCallback({ onSuccess, onError }: AuthCallbackProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        if (data.session) {
          onSuccess?.()
        } else {
          throw new Error('No session found')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
        setError(errorMessage)
        onError?.(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [onSuccess, onError])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Færdiggør login...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold text-destructive">Login fejlede</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="text-primary hover:underline"
          >
            Gå til forsiden
          </button>
        </div>
      </div>
    )
  }

  return null
}