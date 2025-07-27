-- Fix RLS policy infinite recursion error
-- The problem is policies referencing user_profiles in complex ways

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

DROP POLICY IF EXISTS "Approved resources are viewable by everyone" ON resources;
DROP POLICY IF EXISTS "Users can view their own submitted resources" ON resources;
DROP POLICY IF EXISTS "Moderators can view all resources" ON resources;
DROP POLICY IF EXISTS "Users can update their own pending resources" ON resources;
DROP POLICY IF EXISTS "Moderators can update any resource" ON resources;

-- Create simple, non-recursive policies

-- User profiles policies (simplified)
CREATE POLICY "Allow select for authenticated users" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow insert for authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow update for authenticated users" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Resources policies (simplified - no user_profile references)
CREATE POLICY "Public read approved resources" ON resources
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Public insert resources" ON resources
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users update own resources" ON resources
    FOR UPDATE USING (
        submitter_id = auth.uid() OR 
        (submitter_email IS NOT NULL AND submitter_email = auth.email())
    );

-- Temporarily disable RLS on categories and tags for public access
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled on sensitive tables
-- But use simpler policies to avoid recursion