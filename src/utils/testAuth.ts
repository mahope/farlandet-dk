// Test authentication functions
import { supabase } from '../lib/supabase'

export async function testSignUp(email: string, password: string, username?: string) {
  try {
    console.log('🚀 Testing user signup...')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || null,
        },
      },
    })
    
    if (error) {
      console.error('❌ Signup failed:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Signup successful!')
    console.log('📧 User:', data.user?.email)
    console.log('🔑 Session:', data.session ? 'Logged in immediately!' : 'No session created')
    console.log('📬 Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No - confirmation email sent')
    console.log('🎯 User can use all features immediately while email confirmation is pending')
    
    // Check if profile was created
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      if (profileError) {
        console.warn('⚠️ Profile not found:', profileError.message)
      } else {
        console.log('👤 Profile created:', profile.username)
      }
    }
    
    return { success: true, data }
    
  } catch (error) {
    console.error('💥 Signup test failed:', error)
    return { success: false, error: String(error) }
  }
}

export async function testSignIn(email: string, password: string) {
  try {
    console.log('🚀 Testing user signin...')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('❌ Signin failed:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Signin successful!')
    console.log('📧 User:', data.user?.email)
    console.log('👤 Profile ID:', data.user?.id)
    
    return { success: true, data }
    
  } catch (error) {
    console.error('💥 Signin test failed:', error)
    return { success: false, error: String(error) }
  }
}

// Make functions available in dev console
if (import.meta.env.DEV) {
  window.testSignUp = testSignUp
  window.testSignIn = testSignIn
  window.testSignOut = () => supabase.auth.signOut()
}

declare global {
  interface Window {
    testSignUp?: (email: string, password: string, username?: string) => Promise<any>
    testSignIn?: (email: string, password: string) => Promise<any>
    testSignOut?: () => Promise<any>
  }
}