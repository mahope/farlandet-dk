import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setupGlobalErrorHandling, logger } from './utils/logger'

// Setup global error handling for production
setupGlobalErrorHandling()

// Log app startup
logger.info('Farlandet.dk application starting', {
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.MODE,
  timestamp: new Date().toISOString(),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
