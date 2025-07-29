import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { CategoryService } from '../services/categoryService'

const router = Router()
const categoryService = new CategoryService()

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional()
})

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional()
})

// GET /api/categories - Get all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllCategories()
    
    res.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    })
  }
})

// GET /api/categories/:id - Get single category
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID'
      })
    }
    
    const category = await categoryService.getCategoryById(id)
    
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
    console.error('Error fetching category:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category'
    })
  }
})

// POST /api/categories - Create new category (admin only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createCategorySchema.parse(req.body)
    
    const category = await categoryService.createCategory(
      validatedData.name,
      validatedData.description
    )
    
    res.status(201).json({
      success: true,
      data: category
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }
    
    console.error('Error creating category:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create category'
    })
  }
})

// PUT /api/categories/:id - Update category (admin only)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID'
      })
    }
    
    const validatedData = updateCategorySchema.parse(req.body)
    
    const category = await categoryService.updateCategory(
      id,
      validatedData.name,
      validatedData.description
    )
    
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
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }
    
    console.error('Error updating category:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update category'
    })
  }
})

// DELETE /api/categories/:id - Delete category (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
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
    console.error('Error deleting category:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete category'
    })
  }
})

export default router