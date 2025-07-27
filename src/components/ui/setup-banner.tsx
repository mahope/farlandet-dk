import { useState, useEffect } from 'react'
import { AlertTriangle, X, ExternalLink } from 'lucide-react'
import { Button } from './button'

export function SetupBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if Supabase is properly configured
    const hasSupabaseConfig = 
      import.meta.env.VITE_SUPABASE_URL && 
      import.meta.env.VITE_SUPABASE_ANON_KEY &&
      import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url_here' &&
      import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here'

    // Check if user has dismissed banner
    const dismissed = localStorage.getItem('setup-banner-dismissed') === 'true'

    // Show banner if in development, not configured, and not dismissed
    if (import.meta.env.DEV && !hasSupabaseConfig && !dismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('setup-banner-dismissed', 'true')
    setIsDismissed(true)
    setIsVisible(false)
  }

  if (!isVisible || isDismissed) return null

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
          <div>
            <p className="text-sm text-yellow-800 font-medium">
              🚀 Supabase Database ikke konfigureret
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Konfigurer miljøvariabler i .env filen for at teste alle funktioner
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <a 
            href="/supabase/setup.md" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-yellow-700 hover:text-yellow-900 flex items-center"
          >
            Setup Guide <ExternalLink className="h-3 w-3 ml-1" />
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-yellow-600 hover:text-yellow-800 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}