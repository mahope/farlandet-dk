-- Disable email confirmation requirement
-- This allows users to login immediately after signup without email verification

-- Update auth configuration to skip email confirmation
-- Note: This can also be done via Supabase Dashboard → Authentication → Settings
-- But we include SQL commands for completeness

-- These settings are typically configured in Supabase Dashboard, but included for reference:
/*
In Supabase Dashboard → Authentication → Settings:
- Enable email confirmations: OFF
- Enable email change confirmations: OFF  
- Secure email change: OFF (for development)
*/

-- For development: Allow unconfirmed users to sign in
-- This is typically done via Dashboard, but we can create a policy override

-- Grant immediate access to user profiles for unconfirmed users
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;

CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (
        auth.uid() = id OR
        auth.jwt() ->> 'role' = 'service_role'
    );