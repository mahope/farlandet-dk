import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { ResourceService } from '../services/resourceService'

const router = Router()
const resourceService = new ResourceService()

// Validation schemas
const createResourceSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  url: z.string().url().optional(),
  type: z.enum(['link', 'pdf', 'article', 'podcast', 'tip', 'book', 'video', 'movie', 'tv_series']).optional(),
  category_id: z.number().int().positive().optional(),
  submitted_by: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).optional()
})

const updateResourceSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  type: z.enum(['link', 'pdf', 'article', 'podcast', 'tip', 'book', 'video', 'movie', 'tv_series']).optional(),
  category_id: z.number().int().positive().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  tags: z.array(z.string().max(50)).optional()
})

// GET /api/resources - Get all resources (with filtering)
router.get('/', async (req: Request, res: Response) => {
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
    console.error('Error fetching resources:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resources'
    })
  }
})

// GET /api/resources/:id - Get single resource
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid resource ID'
      })
    }
    
    const resource = await resourceService.getResourceById(id)
    
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
    console.error('Error fetching resource:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resource'
    })
  }
})

// POST /api/resources - Create new resource
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createResourceSchema.parse(req.body)
    
    const resource = await resourceService.createResource(validatedData)
    
    res.status(201).json({
      success: true,
      data: resource,
      message: 'Resource submitted successfully. It will be reviewed before being published.'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }
    
    console.error('Error creating resource:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create resource'
    })
  }
})

// PUT /api/resources/:id - Update resource (admin only)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid resource ID'
      })
    }
    
    const validatedData = updateResourceSchema.parse(req.body)
    
    const resource = await resourceService.updateResource(id, validatedData)
    
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
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }
    
    console.error('Error updating resource:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update resource'
    })
  }
})

// DELETE /api/resources/:id - Delete resource (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
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
    console.error('Error deleting resource:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete resource'
    })
  }
})

// POST /api/resources/:id/vote - Vote on resource
router.post('/:id/vote', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const { type } = req.body
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid resource ID'
      })
    }
    
    if (!['up', 'down'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Vote type must be "up" or "down"'
      })
    }
    
    const increment = type === 'up' ? 1 : -1
    const resource = await resourceService.voteResource(id, increment)
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found or not approved'
      })
    }
    
    res.json({
      success: true,
      data: resource
    })
  } catch (error) {
    console.error('Error voting on resource:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to vote on resource'
    })
  }
})

export default router