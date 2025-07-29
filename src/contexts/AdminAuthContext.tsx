import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, type AdminUser } from '../lib/api'

interface AdminAuthContextType {
  user: AdminUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

interface AdminAuthProviderProps {
  children: ReactNode
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token')
    if (storedToken) {
      setToken(storedToken)
      // Verify token is still valid by fetching user info
      verifyToken(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await api.getCurrentUser(token)
      if (response.success && response.data) {
        setUser(response.data)
        setToken(token)
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('admin_token')
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('admin_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password)
      
      if (response.success && response.data) {
        const { user, token } = response.data
        
        setUser(user)
        setToken(token)
        localStorage.setItem('admin_token', token)
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await api.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('admin_token')
    }
  }

  const value: AdminAuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

// Hook for admin API calls that automatically includes auth token
export function useAdminApi() {
  const { token, logout } = useAdminAuth()

  const makeAuthenticatedRequest = async <T,>(
    apiCall: (token: string) => Promise<T>
  ): Promise<T> => {
    if (!token) {
      throw new Error('Not authenticated')
    }

    try {
      return await apiCall(token)
    } catch (error: any) {
      // If we get a 401 or 403, the token is likely expired
      if (error.message?.includes('401') || error.message?.includes('403')) {
        logout()
        throw new Error('Session expired. Please log in again.')
      }
      throw error
    }
  }

  return {
    makeAuthenticatedRequest,
    token
  }
}