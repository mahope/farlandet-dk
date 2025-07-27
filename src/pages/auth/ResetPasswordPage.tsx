import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Alert } from '../../components/ui/alert'
import { LoadingSpinner } from '../../components/ui/loading-spinner'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useSEO } from '../../hooks/useSEO'

const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'Adgangskoden skal være mindst 6 tegn'),
  confirmPassword: z
    .string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Adgangskoderne matcher ikke',
  path: ['confirmPassword'],
})

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validatingSession, setValidatingSession] = useState(true)

  useSEO({
    title: 'Nulstil Adgangskode - Farlandet.dk',
    description: 'Nulstil din adgangskode til Farlandet.dk',
    url: 'https://farlandet.dk/auth/reset-password',
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  })

  // Check if we have a valid session for password reset
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First check URL parameters - Supabase includes access_token in URL for password reset
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')
        const type = urlParams.get('type')

        if (type === 'recovery' && accessToken && refreshToken) {
          // This is a valid password recovery link
          // Set the session using the tokens from URL
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('Error setting session:', error)
            setError('Ugyldig nulstillingslink. Anmod om et nyt link.')
            setValidatingSession(false)
            return
          }

          setValidatingSession(false)
          return
        }

        // Fallback: check current session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setError('Ugyldig session. Anmod om et nyt link til nulstilling af adgangskode.')
          setValidatingSession(false)
          return
        }

        if (!session) {
          setError('Ingen aktiv session. Anmod om et nyt link til nulstilling af adgangskode.')
          setValidatingSession(false)
          return
        }

        setValidatingSession(false)
      } catch (err) {
        console.error('Error checking session:', err)
        setError('Der opstod en fejl ved validering af session.')
        setValidatingSession(false)
      }
    }

    checkSession()
  }, [])

  const onSubmit = async (data: UpdatePasswordFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      const { error } = await supabase.auth.updateUser({
        password: data.password
      })

      if (error) {
        throw error
      }

      setSuccess(true)
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 3000)
    } catch (err: any) {
      console.error('Error updating password:', err)
      setError(err.message || 'Der opstod en fejl ved opdatering af adgangskoden.')
    } finally {
      setIsLoading(false)
    }
  }

  if (validatingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Validerer session..." />
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <h1 className="text-2xl font-bold text-green-600">Adgangskode Opdateret!</h1>
            <p className="text-muted-foreground">
              Din adgangskode er blevet opdateret med succes. Du omdirigeres til forsiden om lidt.
            </p>
            <Button onClick={() => navigate('/', { replace: true })}>
              Gå til forsiden
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center space-y-4">
            <div className="text-4xl">❌</div>
            <h1 className="text-2xl font-bold text-red-600">Session Udløbet</h1>
            <p className="text-muted-foreground mb-4">
              {error}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/login', { replace: true })}
                className="w-full"
              >
                Gå til login
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                Gå til forsiden
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Nulstil Adgangskode</h1>
            <p className="text-muted-foreground mt-2">
              Indtast din nye adgangskode nedenfor
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Ny Adgangskode</Label>
              <Input
                {...register('password')}
                type="password"
                placeholder="Mindst 6 tegn"
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bekræft Ny Adgangskode</Label>
              <Input
                {...register('confirmPassword')}
                type="password"
                placeholder="Gentag adgangskoden"
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Opdaterer...
                </>
              ) : (
                'Opdater Adgangskode'
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate('/login', { replace: true })}
              className="text-sm text-muted-foreground"
            >
              Tilbage til login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}