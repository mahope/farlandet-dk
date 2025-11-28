import { Layout } from '@/components/layout/Layout'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { AdminLoginForm } from '../components/admin/AdminLoginForm'
import { AdminDashboard } from '../components/admin/AdminDashboard'
import { Loader2 } from 'lucide-react'

export function AdminPage() {
  const { isAuthenticated, loading } = useAdminAuth()

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    )
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <AdminLoginForm />
      </Layout>
    )
  }

  return (
    <Layout>
      <AdminDashboard />
    </Layout>
  )
}