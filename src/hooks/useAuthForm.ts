import { useState } from 'react'

interface UseAuthFormReturn {
  loading: boolean
  error: string | null
  clearError: () => void
  handleAuthAction: (action: () => Promise<void>) => Promise<void>
}

export function useAuthForm(): UseAuthFormReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  const handleAuthAction = async (action: () => Promise<void>) => {
    try {
      setLoading(true)
      setError(null)
      await action()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    clearError,
    handleAuthAction,
  }
}