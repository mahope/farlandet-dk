import { AuthProvider } from './contexts/PocketBaseAuthContext'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AppRouter } from './components/router/AppRouter'
import { ErrorBoundary } from './components/ui/error-boundary'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <AdminAuthProvider>
            <AppRouter />
          </AdminAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
