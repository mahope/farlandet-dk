-- Debug RLS policies
-- First, let's see what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('resources', 'resource_tags', 'tags', 'categories');

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('resources', 'resource_tags', 'tags', 'categories');

-- Check grants
SELECT table_name, grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name IN ('resources', 'resource_tags', 'tags', 'categories')
AND grantee IN ('authenticated', 'anon', 'postgres');