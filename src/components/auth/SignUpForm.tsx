
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { useAuth } from '../../hooks/useAuth'
import { useAuthForm } from '../../hooks/useAuthForm'
import { signUpSchema, type SignUpFormData } from '../../lib/validations/auth'

interface SignUpFormProps {
  onSuccess?: () => void
  onSwitchToSignIn?: () => void
}

export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const { signUp } = useAuth()
  const { loading, error, clearError, handleAuthAction } = useAuthForm()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpFormData) => {
    await handleAuthAction(async () => {
      await signUp(data.email, data.password, data.username || undefined)
      reset()
      onSuccess?.()
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Opret konto</h1>
        <p className="text-muted-foreground">
          Opret en konto for at dele og stemme på ressourcer
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
          <Label htmlFor="username">Brugernavn (valgfrit)</Label>
          <Input
            id="username"
            type="text"
            placeholder="ditbrugernavn"
            {...register('username')}
            onChange={(e) => {
              register('username').onChange(e)
              clearError()
            }}
          />
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username.message}</p>
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Bekræft adgangskode</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            onChange={(e) => {
              register('confirmPassword').onChange(e)
              clearError()
            }}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Opretter konto...' : 'Opret konto'}
        </Button>
      </form>

      {onSwitchToSignIn && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Har du allerede en konto?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-primary hover:underline"
            >
              Log ind
            </button>
          </p>
        </div>
      )}
    </div>
  )
}