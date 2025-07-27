-- Fix user profile creation issues

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Update the RLS policy to allow service role to insert profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Allow authenticated users to also see their own profiles (for immediate access after signup)
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;

CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (
        auth.uid() = id OR
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Recreate the user creation function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- This allows the function to bypass RLS
SET search_path = public
AS $$
DECLARE
    username_value TEXT;
BEGIN
    -- Extract username from metadata or use email prefix
    username_value := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1)
    );
    
    -- Insert user profile (bypasses RLS due to SECURITY DEFINER)
    INSERT INTO public.user_profiles (id, username, role, created_at, updated_at)
    VALUES (
        NEW.id,
        username_value,
        'user',
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION 
    WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO postgres, anon, authenticated, service_role;