import { useAdminAuth } from '../contexts/AdminAuthContext'
import { AdminLoginForm } from '../components/admin/AdminLoginForm'
import { AdminDashboard } from '../components/admin/AdminDashboard'

export function AdminPage() {
  const { isAuthenticated, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Indlæser...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLoginForm />
  }

  return <AdminDashboard />
}