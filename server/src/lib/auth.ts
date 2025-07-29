import { betterAuth } from "better-auth"
import { pool } from "../config/database"
import bcrypt from "bcrypt"

// Custom PostgreSQL adapter for better-auth
const postgresAdapter = {
  async createUser(user: any) {
    const client = await pool.connect()
    try {
      const result = await client.query(`
        INSERT INTO admin_users (email, password_hash, name, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id, email, name, created_at
      `, [user.email, user.password, user.name])
      
      return {
        id: result.rows[0].id.toString(),
        email: result.rows[0].email,
        name: result.rows[0].name,
        createdAt: result.rows[0].created_at,
      }
    } finally {
      client.release()
    }
  },

  async getUserByEmail(email: string) {
    const client = await pool.connect()
    try {
      const result = await client.query(`
        SELECT id, email, password_hash, name, created_at, last_login
        FROM admin_users 
        WHERE email = $1
      `, [email])
      
      if (result.rows.length === 0) return null
      
      const user = result.rows[0]
      return {
        id: user.id.toString(),
        email: user.email,
        password: user.password_hash,
        name: user.name,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      }
    } finally {
      client.release()
    }
  },

  async getUserById(id: string) {
    const client = await pool.connect()
    try {
      const result = await client.query(`
        SELECT id, email, name, created_at, last_login
        FROM admin_users 
        WHERE id = $1
      `, [parseInt(id)])
      
      if (result.rows.length === 0) return null
      
      const user = result.rows[0]
      return {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      }
    } finally {
      client.release()
    }
  },

  async updateUser(id: string, data: any) {
    const client = await pool.connect()
    try {
      const fields = []
      const values = []
      let paramIndex = 1

      if (data.name !== undefined) {
        fields.push(`name = $${paramIndex++}`)
        values.push(data.name)
      }
      if (data.email !== undefined) {
        fields.push(`email = $${paramIndex++}`)
        values.push(data.email)
      }
      if (data.password !== undefined) {
        fields.push(`password_hash = $${paramIndex++}`)
        values.push(data.password)
      }
      
      // Always update last_login when updating user
      fields.push(`last_login = NOW()`)
      
      values.push(parseInt(id))

      const result = await client.query(`
        UPDATE admin_users 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, email, name, created_at, last_login
      `, values)
      
      if (result.rows.length === 0) return null
      
      const user = result.rows[0]
      return {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      }
    } finally {
      client.release()
    }
  },

  async createSession(session: any) {
    // For simplicity, we'll use JWT tokens instead of database sessions
    // This could be extended to store sessions in database if needed
    return session
  },

  async getSession(sessionId: string) {
    // JWT-based sessions don't need database lookup
    return null
  },

  async updateSession(sessionId: string, data: any) {
    // JWT-based sessions are stateless
    return null
  },

  async deleteSession(sessionId: string) {
    // JWT-based sessions don't need database cleanup
    return true
  }
}

export const auth = betterAuth({
  database: {
    provider: "custom",
    adapter: postgresAdapter,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disable for admin-only system
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  baseURL: process.env.API_BASE_URL || "http://localhost:3001",
  logger: {
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
  },
  plugins: [],
})

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Helper function to verify passwords
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Custom login function that works with our existing admin_users table
export async function loginAdmin(email: string, password: string) {
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT id, email, password_hash, name, created_at
      FROM admin_users 
      WHERE email = $1
    `, [email])
    
    if (result.rows.length === 0) {
      throw new Error('Invalid email or password')
    }
    
    const user = result.rows[0]
    const isValidPassword = await verifyPassword(password, user.password_hash)
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }
    
    // Update last login
    await client.query(`
      UPDATE admin_users 
      SET last_login = NOW() 
      WHERE id = $1
    `, [user.id])
    
    return {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    }
  } finally {
    client.release()
  }
}

export type AdminUser = {
  id: string
  email: string
  name: string
  createdAt: Date
}