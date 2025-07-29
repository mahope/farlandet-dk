import { AuthProvider } from './contexts/PocketBaseAuthContext'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import { AppRouter } from './components/router/AppRouter'
import { ErrorBoundary } from './components/ui/error-boundary'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AdminAuthProvider>
          <AppRouter />
        </AdminAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
