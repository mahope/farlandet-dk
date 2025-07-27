// Simple Supabase connection test
import { createClient } from '@supabase/supabase-js'

export function testSimpleConnection() {
  console.log('🔧 Testing simple connection...')
  
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  console.log('URL exists:', !!url)
  console.log('Key exists:', !!key)
  console.log('URL format:', url?.includes('supabase.co'))
  
  if (!url || !key || url.includes('your_supabase')) {
    console.error('❌ Environment variables not properly set!')
    return
  }
  
  try {
    const supabase = createClient(url, key)
    console.log('✅ Supabase client created')
    
    // Simple ping test with timeout
    const timeout = setTimeout(() => {
      console.log('⏰ Connection timed out after 5 seconds')
    }, 5000)
    
    supabase.from('categories').select('count').limit(1)
      .then(result => {
        clearTimeout(timeout)
        if (result.error) {
          console.error('❌ Query error:', result.error.message)
        } else {
          console.log('✅ Connection successful!')
        }
      })
      .catch(error => {
        clearTimeout(timeout)
        console.error('❌ Network error:', error)
      })
      
  } catch (error) {
    console.error('❌ Client creation failed:', error)
  }
}

if (import.meta.env.DEV) {
  window.testSimple = testSimpleConnection
}