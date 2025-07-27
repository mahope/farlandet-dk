import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables not configured. Using placeholder values for development.')
}

// Create typed Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Type-safe table references
export const tables = {
  resources: () => supabase.from('resources'),
  categories: () => supabase.from('categories'),
  tags: () => supabase.from('tags'),
  user_profiles: () => supabase.from('user_profiles'),
  votes: () => supabase.from('votes'),
  comments: () => supabase.from('comments'),
  resource_tags: () => supabase.from('resource_tags'),
} as const

// Type-safe storage buckets
export const storage = {
  resources: () => supabase.storage.from('resources'),
  avatars: () => supabase.storage.from('avatars'),
} as const

// Type-safe auth
export const auth = supabase.auth

// Type-safe realtime
export const realtime = supabase.realtime