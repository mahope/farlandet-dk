import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/button'
import { SignInForm } from './SignInForm'
import { SignUpForm } from './SignUpForm'
import { ResetPasswordForm } from './ResetPasswordForm'
import { SocialLogin } from './SocialLogin'

type AuthMode = 'signin' | 'signup' | 'reset'

interface AuthModalProps {
  initialMode?: AuthMode
  onSuccess?: () => void
  onClose?: () => void
}

export function AuthModal({ initialMode = 'signin', onSuccess, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)

  const handleSuccess = () => {
    onSuccess?.()
    onClose?.()
  }

  const renderContent = () => {
    switch (mode) {
      case 'signup':
        return (
          <div className="space-y-6">
            <SignUpForm
              onSuccess={handleSuccess}
              onSwitchToSignIn={() => setMode('signin')}
            />
            <SocialLogin onSuccess={handleSuccess} />
          </div>
        )
      case 'reset':
        return (
          <ResetPasswordForm
            onBack={() => setMode('signin')}
          />
        )
      default:
        return (
          <div className="space-y-6">
            <SignInForm
              onSuccess={handleSuccess}
              onSwitchToSignUp={() => setMode('signup')}
              onForgotPassword={() => setMode('reset')}
            />
            <SocialLogin onSuccess={handleSuccess} />
          </div>
        )
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 relative">
      {/* Close button in top right corner */}
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 h-auto w-auto hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      {renderContent()}
    </div>
  )
}