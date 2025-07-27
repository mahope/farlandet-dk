-- Temporary fix: Disable RLS on resource submission tables
-- This is for testing - we'll re-enable with proper policies later

-- Disable RLS on resources table
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;

-- Disable RLS on resource_tags table  
ALTER TABLE resource_tags DISABLE ROW LEVEL SECURITY;

-- Ensure tags table has no RLS (should already be disabled)
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;

-- Ensure categories table has no RLS (should already be disabled)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Grant all necessary permissions explicitly
GRANT ALL ON resources TO authenticated;
GRANT ALL ON resources TO anon;
GRANT ALL ON resource_tags TO authenticated;
GRANT ALL ON resource_tags TO anon;
GRANT ALL ON tags TO authenticated;
GRANT ALL ON tags TO anon;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON categories TO anon;

-- Also grant sequence permissions for auto-incrementing IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;