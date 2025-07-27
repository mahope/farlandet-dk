import { z } from 'zod'

// Sign up validation schema
export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email er påkrævet')
    .email('Ugyldig email adresse'),
  password: z
    .string()
    .min(8, 'Adgangskode skal være mindst 8 tegn')
    .regex(/[A-Z]/, 'Adgangskode skal indeholde mindst ét stort bogstav')
    .regex(/[a-z]/, 'Adgangskode skal indeholde mindst ét lille bogstav')
    .regex(/[0-9]/, 'Adgangskode skal indeholde mindst ét tal'),
  confirmPassword: z.string().min(1, 'Bekræft adgangskode er påkrævet'),
  username: z
    .string()
    .refine((val) => !val || val === '' || val.length >= 3, {
      message: 'Brugernavn skal være mindst 3 tegn'
    })
    .refine((val) => !val || val === '' || val.length <= 30, {
      message: 'Brugernavn må ikke være længere end 30 tegn'
    })
    .refine((val) => !val || val === '' || /^[a-zA-Z0-9_-]+$/.test(val), {
      message: 'Brugernavn må kun indeholde bogstaver, tal, _ og -'
    })
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Adgangskoder matcher ikke',
  path: ['confirmPassword'],
})

// Sign in validation schema
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email er påkrævet')
    .email('Ugyldig email adresse'),
  password: z
    .string()
    .min(1, 'Adgangskode er påkrævet'),
})

// Reset password validation schema
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email er påkrævet')
    .email('Ugyldig email adresse'),
})

// Update password validation schema
export const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Nuværende adgangskode er påkrævet'),
  newPassword: z
    .string()
    .min(8, 'Ny adgangskode skal være mindst 8 tegn')
    .regex(/[A-Z]/, 'Ny adgangskode skal indeholde mindst ét stort bogstav')
    .regex(/[a-z]/, 'Ny adgangskode skal indeholde mindst ét lille bogstav')
    .regex(/[0-9]/, 'Ny adgangskode skal indeholde mindst ét tal'),
  confirmNewPassword: z.string().min(1, 'Bekræft ny adgangskode er påkrævet'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Nye adgangskoder matcher ikke',
  path: ['confirmNewPassword'],
})

// Profile update validation schema
export const updateProfileSchema = z.object({
  username: z
    .string()
    .refine((val) => !val || val === '' || val.length >= 3, {
      message: 'Brugernavn skal være mindst 3 tegn'
    })
    .refine((val) => !val || val === '' || val.length <= 30, {
      message: 'Brugernavn må ikke være længere end 30 tegn'
    })
    .refine((val) => !val || val === '' || /^[a-zA-Z0-9_-]+$/.test(val), {
      message: 'Brugernavn må kun indeholde bogstaver, tal, _ og -'
    })
    .optional(),
})

// Type exports
export type SignUpFormData = z.infer<typeof signUpSchema>
export type SignInFormData = z.infer<typeof signInSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>