
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { useAuth } from '../../hooks/useAuth'
import { useAuthForm } from '../../hooks/useAuthForm'
import { signInSchema, type SignInFormData } from '../../lib/validations/auth'

interface SignInFormProps {
  onSuccess?: () => void
  onSwitchToSignUp?: () => void
  onForgotPassword?: () => void
}

export function SignInForm({ onSuccess, onSwitchToSignUp, onForgotPassword }: SignInFormProps) {
  const { signIn } = useAuth()
  const { loading, error, clearError, handleAuthAction } = useAuthForm()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInFormData) => {
    await handleAuthAction(async () => {
      await signIn(data.email, data.password)
      reset()
      onSuccess?.()
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Log ind</h1>
        <p className="text-muted-foreground">
          Log ind på din konto for at få adgang til alle funktioner
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="din@email.dk"
            {...register('email')}
            onChange={(e) => {
              register('email').onChange(e)
              clearError()
            }}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Adgangskode</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            onChange={(e) => {
              register('password').onChange(e)
              clearError()
            }}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logger ind...' : 'Log ind'}
        </Button>
      </form>

      <div className="space-y-4">
        {onForgotPassword && (
          <div className="text-center">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-primary hover:underline"
            >
              Glemt adgangskode?
            </button>
          </div>
        )}

        {onSwitchToSignUp && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Har du ikke en konto?{' '}
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="text-primary hover:underline"
              >
                Opret konto
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}