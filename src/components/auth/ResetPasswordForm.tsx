import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { useAuth } from '../../hooks/useAuth'
import { useAuthForm } from '../../hooks/useAuthForm'
import { resetPasswordSchema, type ResetPasswordFormData } from '../../lib/validations/auth'

interface ResetPasswordFormProps {
  onBack?: () => void
}

export function ResetPasswordForm({ onBack }: ResetPasswordFormProps) {
  const { resetPassword } = useAuth()
  const { loading, error, clearError, handleAuthAction } = useAuthForm()
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    await handleAuthAction(async () => {
      await resetPassword(data.email)
      setEmailSent(true)
      reset()
    })
  }

  if (emailSent) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Email sendt</h1>
          <p className="text-muted-foreground">
            Vi har sendt en email til <strong>{getValues('email')}</strong> med instruktioner til at nulstille din adgangskode.
          </p>
        </div>

        <Alert>
          <AlertDescription>
            Tjek din indbakke og følg linket i emailen for at nulstille din adgangskode.
            Hvis du ikke kan se emailen, tjek din spam-mappe.
          </AlertDescription>
        </Alert>

        {onBack && (
          <Button variant="outline" onClick={onBack} className="w-full">
            Tilbage til login
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Nulstil adgangskode</h1>
        <p className="text-muted-foreground">
          Indtast din email adresse, så sender vi dig et link til at nulstille din adgangskode
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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sender email...' : 'Send nulstillingslink'}
        </Button>
      </form>

      {onBack && (
        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-primary hover:underline"
          >
            Tilbage til login
          </button>
        </div>
      )}
    </div>
  )
}