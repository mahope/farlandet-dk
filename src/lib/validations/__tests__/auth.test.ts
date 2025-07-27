import { describe, it, expect } from 'vitest'
import {
  signUpSchema,
  signInSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema,
} from '../auth'

describe('Auth Validation Schemas', () => {
  describe('signUpSchema', () => {
    it('should validate valid sign up data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        username: 'testuser',
      }

      const result = signUpSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate sign up data without username', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        username: '',
      }

      const result = signUpSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123',
        confirmPassword: 'Password123',
        username: 'testuser',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Ugyldig email adresse')
      }
    })

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        username: 'testuser',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('mindst 8 tegn')
        )).toBe(true)
      }
    })

    it('should reject password without uppercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        username: 'testuser',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('stort bogstav')
        )).toBe(true)
      }
    })

    it('should reject password without lowercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'PASSWORD123',
        confirmPassword: 'PASSWORD123',
        username: 'testuser',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('lille bogstav')
        )).toBe(true)
      }
    })

    it('should reject password without number', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password',
        confirmPassword: 'Password',
        username: 'testuser',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('tal')
        )).toBe(true)
      }
    })

    it('should reject mismatched passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
        username: 'testuser',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('matcher ikke')
        )).toBe(true)
      }
    })

    it('should reject invalid username characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        username: 'invalid username!',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('bogstaver, tal, _ og -')
        )).toBe(true)
      }
    })

    it('should reject username that is too short', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        username: 'ab',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('mindst 3 tegn')
        )).toBe(true)
      }
    })
  })

  describe('signInSchema', () => {
    it('should validate valid sign in data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const result = signInSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'password123',
      }

      const result = signInSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email er påkrævet')
      }
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      }

      const result = signInSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Adgangskode er påkrævet')
      }
    })
  })

  describe('resetPasswordSchema', () => {
    it('should validate valid email', () => {
      const validData = {
        email: 'test@example.com',
      }

      const result = resetPasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
      }

      const result = resetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Ugyldig email adresse')
      }
    })
  })

  describe('updatePasswordSchema', () => {
    it('should validate valid password update data', () => {
      const validData = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123',
      }

      const result = updatePasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject mismatched new passwords', () => {
      const invalidData = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword123',
        confirmNewPassword: 'DifferentPassword123',
      }

      const result = updatePasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('matcher ikke')
        )).toBe(true)
      }
    })
  })

  describe('updateProfileSchema', () => {
    it('should validate valid username', () => {
      const validData = {
        username: 'newusername',
      }

      const result = updateProfileSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate empty username', () => {
      const validData = {
        username: '',
      }

      const result = updateProfileSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid username', () => {
      const invalidData = {
        username: 'invalid username!',
      }

      const result = updateProfileSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.message.includes('bogstaver, tal, _ og -')
        )).toBe(true)
      }
    })
  })
})