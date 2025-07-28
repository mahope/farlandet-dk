import { AuthProvider } from './contexts/PocketBaseAuthContext'
import { AppRouter } from './components/router/AppRouter'
import { ErrorBoundary } from './components/ui/error-boundary'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
