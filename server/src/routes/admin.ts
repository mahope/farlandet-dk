import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authenticateToken, requireAdmin } from './auth'
import { ResourceService } from '../services/resourceService'
import { CategoryService } from '../services/categoryService'
import { pool } from '../config/database'

const router = Router()
const resourceService = new ResourceService()
const categoryService = new CategoryService()

// Apply auth middleware to all admin routes
router.use(authenticateToken)
router.use(requireAdmin)

// GET /api/admin/dashboard - Admin dashboard stats
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const client = await pool.connect()
    
    const statsResult = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM resources WHERE status = 'pending') as pending_resources,
        (SELECT COUNT(*) FROM resources WHERE status = 'approved') as approved_resources,
        (SELECT COUNT(*) FROM resources WHERE status = 'rejected') as rejected_resources,
        (SELECT COUNT(*) FROM resources) as total_resources,
        (SELECT COUNT(*) FROM categories) as total_categories,
        (SELECT COUNT(*) FROM tags) as total_tags,
        (SELECT COUNT(*) FROM admin_users) as total_admins
    `)
    
    // Get recent resources
    const recentResourcesResult = await client.query(`
      SELECT r.*, c.name as category_name
      FROM resources r
      LEFT JOIN categories c ON r.category_id = c.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `)
    
    client.release()
    
    const stats = statsResult.rows[0]
    const recentResources = recentResourcesResult.rows
    
    res.json({
      success: true,
      data: {
        stats: {
          pending: parseInt(stats.pending_resources),
          approved: parseInt(stats.approved_resources),
          rejected: parseInt(stats.rejected_resources),
          total: parseInt(stats.total_resources),
          categories: parseInt(stats.total_categories),
          tags: parseInt(stats.total_tags),
          admins: parseInt(stats.total_admins)
        },
        recentResources
      }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard data'
    })
  }
})

// GET /api/admin/resources - Get resources with filtering for moderation
router.get('/resources', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string
    const limit = parseInt(req.query.limit as string) || 50
    const offset = parseInt(req.query.offset as string) || 0
    
    const resources = await resourceService.getAllResources(status, limit, offset)
    
    res.json({
      success: true,
      data: resources,
      meta: {
        limit,
        offset,
        count: resources.length
      }
    })
  } catch (error) {
    console.error('Admin get resources error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resources'
    })
  }
})

// PUT /api/admin/resources/:id/moderate - Moderate resource (approve/reject)
router.put('/resources/:id/moderate', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const { status } = req.body
    const adminUser = (req as any).user
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid resource ID'
      })
    }
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be "approved" or "rejected"'
      })
    }
    
    const resource = await resourceService.updateResource(id, {
      status,
      // Note: approved_by would need to be added to the update function
    })
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      })
    }
    
    res.json({
      success: true,
      data: resource,
      message: `Resource ${status} successfully`
    })
  } catch (error) {
    console.error('Moderate resource error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to moderate resource'
    })
  }
})

// PUT /api/admin/resources/:id - Update resource (full edit)
router.put('/resources/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid resource ID'
      })
    }
    
    const updateData = req.body
    const resource = await resourceService.updateResource(id, updateData)
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      })
    }
    
    res.json({
      success: true,
      data: resource
    })
  } catch (error) {
    console.error('Update resource error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update resource'
    })
  }
})

// DELETE /api/admin/resources/:id - Delete resource
router.delete('/resources/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid resource ID'
      })
    }
    
    const deleted = await resourceService.deleteResource(id)
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      })
    }
    
    res.json({
      success: true,
      message: 'Resource deleted successfully'
    })
  } catch (error) {
    console.error('Delete resource error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete resource'
    })
  }
})

// GET /api/admin/categories - Get all categories (admin view)
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllCategories()
    
    res.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Admin get categories error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    })
  }
})

// POST /api/admin/categories - Create category
router.post('/categories', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      })
    }
    
    const category = await categoryService.createCategory(name, description)
    
    res.status(201).json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('Create category error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create category'
    })
  }
})

// PUT /api/admin/categories/:id - Update category
router.put('/categories/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const { name, description } = req.body
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID'
      })
    }
    
    const category = await categoryService.updateCategory(id, name, description)
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      })
    }
    
    res.json({
      success: true,
      data: category
    })
  } catch (error) {
    console.error('Update category error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update category'
    })
  }
})

// DELETE /api/admin/categories/:id - Delete category
router.delete('/categories/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID'
      })
    }
    
    const deleted = await categoryService.deleteCategory(id)
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      })
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Delete category error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete category'
    })
  }
})

export default router