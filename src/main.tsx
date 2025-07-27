import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Import database test utilities in development
if (import.meta.env.DEV) {
  import('./utils/testConnection').then(({ testDatabaseConnection, testDataSetup }) => {
    // Auto-test connection when app loads
    setTimeout(async () => {
      await testDatabaseConnection()
      await testDataSetup()
    }, 1000)
  })
  
  // Import auth test utilities
  import('./utils/testAuth')
  
  // Import simple connection test
  import('./utils/simpleTest')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
