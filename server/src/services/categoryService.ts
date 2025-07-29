import { pool } from '../config/database'
import type { Category } from '../types'

export class CategoryService {
  
  async getAllCategories(): Promise<Category[]> {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT * FROM categories 
        ORDER BY name ASC
      `)
      
      return result.rows
    } finally {
      client.release()
    }
  }
  
  async getCategoryById(id: number): Promise<Category | null> {
    const client = await pool.connect()
    
    try {
      const result = await client.query('SELECT * FROM categories WHERE id = $1', [id])
      return result.rows.length > 0 ? result.rows[0] : null
    } finally {
      client.release()
    }
  }
  
  async createCategory(name: string, description?: string): Promise<Category> {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        INSERT INTO categories (name, description)
        VALUES ($1, $2)
        RETURNING *
      `, [name, description])
      
      return result.rows[0]
    } finally {
      client.release()
    }
  }
  
  async updateCategory(id: number, name?: string, description?: string): Promise<Category | null> {
    const client = await pool.connect()
    
    try {
      const fields = []
      const values = []
      let paramIndex = 1
      
      if (name !== undefined) {
        fields.push(`name = $${paramIndex++}`)
        values.push(name)
      }
      if (description !== undefined) {
        fields.push(`description = $${paramIndex++}`)
        values.push(description)
      }
      
      if (fields.length === 0) {
        return null
      }
      
      values.push(id)
      
      const query = `
        UPDATE categories 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `
      
      const result = await client.query(query, values)
      return result.rows.length > 0 ? result.rows[0] : null
    } finally {
      client.release()
    }
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    const client = await pool.connect()
    
    try {
      const result = await client.query('DELETE FROM categories WHERE id = $1', [id])
      return result.rowCount > 0
    } finally {
      client.release()
    }
  }
}