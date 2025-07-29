import { Router, Request, Response } from 'express'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { loginAdmin, verifyPassword, hashPassword } from '../lib/auth'
import { pool } from '../config/database'

const router = Router()

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
})

// POST /api/auth/login - Admin login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    
    const user = await loginAdmin(email, password)
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    )
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      }
    })
  } catch (error: any) {
    console.error('Login error:', error)
    res.status(401).json({
      success: false,
      error: error.message || 'Login failed'
    })
  }
})

// POST /api/auth/logout - Admin logout (client-side token removal)
router.post('/logout', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logout successful'
  })
})

// GET /api/auth/me - Get current admin user
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    
    const client = await pool.connect()
    const result = await client.query(`
      SELECT id, email, name, created_at, last_login
      FROM admin_users 
      WHERE id = $1
    `, [userId])
    client.release()
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    const user = result.rows[0]
    res.json({
      success: true,
      data: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get user information'
    })
  }
})

// POST /api/auth/change-password - Change admin password
router.post('/change-password', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)
    const userId = (req as any).user.userId
    
    const client = await pool.connect()
    
    // Get current password hash
    const userResult = await client.query(`
      SELECT password_hash FROM admin_users WHERE id = $1
    `, [userId])
    
    if (userResult.rows.length === 0) {
      client.release()
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    const currentHash = userResult.rows[0].password_hash
    const isCurrentPasswordValid = await verifyPassword(currentPassword, currentHash)
    
    if (!isCurrentPasswordValid) {
      client.release()
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      })
    }
    
    // Hash new password and update
    const newHash = await hashPassword(newPassword)
    await client.query(`
      UPDATE admin_users 
      SET password_hash = $1 
      WHERE id = $2
    `, [newHash, userId])
    
    client.release()
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }
    
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    })
  }
})

// Middleware to authenticate JWT token
export function authenticateToken(req: Request, res: Response, next: any) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      })
    }

    (req as any).user = user
    next()
  })
}

// Middleware to require admin role
export function requireAdmin(req: Request, res: Response, next: any) {
  const user = (req as any).user
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    })
  }
  
  next()
}

export default router