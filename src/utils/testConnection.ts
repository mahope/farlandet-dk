// Test database connection utility
import { supabase } from '../lib/supabase'

export async function testDatabaseConnection() {
  try {
    console.log('🚀 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase.from('categories').select('count')
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful!')
    console.log(`📊 Found ${data?.length || 0} categories`)
    
    // Test authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.warn('⚠️  Auth check failed:', authError.message)
    } else {
      console.log('🔐 Auth system ready', session ? '(logged in)' : '(logged out)')
    }
    
    return true
    
  } catch (error) {
    console.error('💥 Connection test failed:', error)
    return false
  }
}

// Test categories and tags
export async function testDataSetup() {
  try {
    console.log('🧪 Testing data setup...')
    
    const [categoriesResult, tagsResult] = await Promise.all([
      supabase.from('categories').select('id, name').limit(5),
      supabase.from('tags').select('id, name').limit(10)
    ])
    
    console.log('📁 Categories:', categoriesResult.data?.map(c => c.name).join(', ') || 'None')
    console.log('🏷️  Tags:', tagsResult.data?.map(t => t.name).join(', ') || 'None')
    
    return {
      categories: categoriesResult.data?.length || 0,
      tags: tagsResult.data?.length || 0
    }
    
  } catch (error) {
    console.error('💥 Data test failed:', error)
    return { categories: 0, tags: 0 }
  }
}

// Run tests if called directly
if (import.meta.env.DEV) {
  window.testDB = testDatabaseConnection
  window.testData = testDataSetup
}

declare global {
  interface Window {
    testDB?: () => Promise<boolean>
    testData?: () => Promise<{ categories: number, tags: number }>
  }
}