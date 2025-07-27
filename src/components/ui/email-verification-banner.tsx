import { useState, useEffect } from 'react'
import { Mail, X, RefreshCw } from 'lucide-react'
import { Button } from './button'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export function EmailVerificationBanner() {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (!user) {
      setIsVisible(false)
      return
    }

    // Check if email is already confirmed
    if (user.email_confirmed_at) {
      setIsVisible(false)
      return
    }

    // Check if user has dismissed banner
    const dismissed = localStorage.getItem(`email-banner-dismissed-${user.id}`) === 'true'
    if (dismissed) {
      setIsVisible(false)
      return
    }

    // Show banner for unconfirmed users after 24 hours
    const signupTime = new Date(user.created_at)
    const now = new Date()
    const hoursSinceSignup = (now.getTime() - signupTime.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceSignup >= 24) {
      setIsVisible(true)
    }
  }, [user])

  const handleResendEmail = async () => {
    if (!user?.email) return
    
    setIsResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      })
      
      if (error) {
        console.error('Failed to resend email:', error)
      } else {
        console.log('Email resent successfully')
        // Show success message or toast
      }
    } catch (error) {
      console.error('Error resending email:', error)
    } finally {
      setIsResending(false)
    }
  }

  const handleDismiss = () => {
    if (user) {
      localStorage.setItem(`email-banner-dismissed-${user.id}`, 'true')
    }
    setIsDismissed(true)
    setIsVisible(false)
  }

  if (!isVisible || isDismissed || !user) return null

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 fixed top-0 left-0 right-0 z-40 shadow-sm">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-blue-400 mr-3" />
          <div>
            <p className="text-sm text-blue-800 font-medium">
              📧 Bekræft din email adresse
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Tjek din indbakke og klik på bekræftelseslinket for at sikre din konto
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResendEmail}
            disabled={isResending}
            className="text-xs text-blue-700 hover:text-blue-900 flex items-center"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isResending ? 'animate-spin' : ''}`} />
            {isResending ? 'Sender...' : 'Send igen'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-blue-600 hover:text-blue-800 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}