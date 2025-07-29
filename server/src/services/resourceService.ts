import { pool } from '../config/database'
import type { Resource, ResourceWithDetails, CreateResourceRequest, UpdateResourceRequest } from '../types'

export class ResourceService {
  
  async getAllResources(status?: string, limit = 50, offset = 0): Promise<ResourceWithDetails[]> {
    const client = await pool.connect()
    
    try {
      let query = `
        SELECT 
          r.*,
          c.name as category_name,
          c.description as category_description,
          COALESCE(
            json_agg(
              CASE WHEN t.id IS NOT NULL 
              THEN json_build_object('id', t.id, 'name', t.name)
              ELSE NULL END
            ) FILTER (WHERE t.id IS NOT NULL), 
            '[]'::json
          ) as tags
        FROM resources r
        LEFT JOIN categories c ON r.category_id = c.id
        LEFT JOIN resource_tags rt ON r.id = rt.resource_id
        LEFT JOIN tags t ON rt.tag_id = t.id
      `
      
      const params: any[] = []
      
      if (status) {
        query += ` WHERE r.status = $1`
        params.push(status)
      }
      
      query += `
        GROUP BY r.id, c.id, c.name, c.description
        ORDER BY r.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `
      
      params.push(limit, offset)
      
      const result = await client.query(query, params)
      
      return result.rows.map(row => ({
        ...row,
        category: row.category_name ? {
          id: row.category_id,
          name: row.category_name,
          description: row.category_description,
          created_at: row.created_at
        } : null,
        tags: row.tags || []
      }))
      
    } finally {
      client.release()
    }
  }
  
  async getResourceById(id: number): Promise<ResourceWithDetails | null> {
    const client = await pool.connect()
    
    try {
      const query = `
        SELECT 
          r.*,
          c.name as category_name,
          c.description as category_description,
          COALESCE(
            json_agg(
              CASE WHEN t.id IS NOT NULL 
              THEN json_build_object('id', t.id, 'name', t.name)
              ELSE NULL END
            ) FILTER (WHERE t.id IS NOT NULL), 
            '[]'::json
          ) as tags
        FROM resources r
        LEFT JOIN categories c ON r.category_id = c.id
        LEFT JOIN resource_tags rt ON r.id = rt.resource_id
        LEFT JOIN tags t ON rt.tag_id = t.id
        WHERE r.id = $1
        GROUP BY r.id, c.id, c.name, c.description
      `
      
      const result = await client.query(query, [id])
      
      if (result.rows.length === 0) {
        return null
      }
      
      const row = result.rows[0]
      return {
        ...row,
        category: row.category_name ? {
          id: row.category_id,
          name: row.category_name,
          description: row.category_description,
          created_at: row.created_at
        } : null,
        tags: row.tags || []
      }
      
    } finally {
      client.release()
    }
  }
  
  async createResource(data: CreateResourceRequest): Promise<Resource> {
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      
      // Insert resource
      const insertQuery = `
        INSERT INTO resources (title, description, url, type, category_id, submitted_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `
      
      const result = await client.query(insertQuery, [
        data.title,
        data.description,
        data.url,
        data.type || 'link',
        data.category_id,
        data.submitted_by
      ])
      
      const resource = result.rows[0]
      
      // Add tags if provided
      if (data.tags && data.tags.length > 0) {
        await this.addTagsToResource(client, resource.id, data.tags)
      }
      
      await client.query('COMMIT')
      return resource
      
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
  
  async updateResource(id: number, data: UpdateResourceRequest): Promise<Resource | null> {
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      
      // Build dynamic update query
      const fields = []
      const values = []
      let paramIndex = 1
      
      if (data.title !== undefined) {
        fields.push(`title = $${paramIndex++}`)
        values.push(data.title)
      }
      if (data.description !== undefined) {
        fields.push(`description = $${paramIndex++}`)
        values.push(data.description)
      }
      if (data.url !== undefined) {
        fields.push(`url = $${paramIndex++}`)
        values.push(data.url)
      }
      if (data.type !== undefined) {
        fields.push(`type = $${paramIndex++}`)
        values.push(data.type)
      }
      if (data.category_id !== undefined) {
        fields.push(`category_id = $${paramIndex++}`)
        values.push(data.category_id)
      }
      if (data.status !== undefined) {
        fields.push(`status = $${paramIndex++}`)
        values.push(data.status)
        
        if (data.status === 'approved') {
          fields.push(`approved_at = NOW()`)
        }
      }
      
      if (fields.length === 0) {
        await client.query('ROLLBACK')
        return null
      }
      
      values.push(id)
      
      const query = `
        UPDATE resources 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `
      
      const result = await client.query(query, values)
      
      if (result.rows.length === 0) {
        await client.query('ROLLBACK')
        return null
      }
      
      // Update tags if provided
      if (data.tags !== undefined) {
        // Remove existing tags
        await client.query('DELETE FROM resource_tags WHERE resource_id = $1', [id])
        
        // Add new tags
        if (data.tags.length > 0) {
          await this.addTagsToResource(client, id, data.tags)
        }
      }
      
      await client.query('COMMIT')
      return result.rows[0]
      
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
  
  async deleteResource(id: number): Promise<boolean> {
    const client = await pool.connect()
    
    try {
      const result = await client.query('DELETE FROM resources WHERE id = $1', [id])
      return result.rowCount > 0
    } finally {
      client.release()
    }
  }
  
  async voteResource(id: number, increment: number): Promise<Resource | null> {
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        UPDATE resources 
        SET votes = votes + $1 
        WHERE id = $2 AND status = 'approved'
        RETURNING *
      `, [increment, id])
      
      return result.rows.length > 0 ? result.rows[0] : null
    } finally {
      client.release()
    }
  }
  
  private async addTagsToResource(client: any, resourceId: number, tagNames: string[]) {
    for (const tagName of tagNames) {
      // Insert tag if it doesn't exist
      await client.query(`
        INSERT INTO tags (name) 
        VALUES ($1) 
        ON CONFLICT (name) DO NOTHING
      `, [tagName.toLowerCase().trim()])
      
      // Get tag ID
      const tagResult = await client.query('SELECT id FROM tags WHERE name = $1', [tagName.toLowerCase().trim()])
      const tagId = tagResult.rows[0].id
      
      // Link resource to tag
      await client.query(`
        INSERT INTO resource_tags (resource_id, tag_id) 
        VALUES ($1, $2) 
        ON CONFLICT (resource_id, tag_id) DO NOTHING
      `, [resourceId, tagId])
    }
  }
}