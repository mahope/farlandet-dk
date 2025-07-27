-- Fix resource insertion RLS policy
-- The current policy allows INSERT but might be too restrictive

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Public insert resources" ON resources;

-- Create a more permissive INSERT policy for resource submission
CREATE POLICY "Allow resource submission" ON resources
    FOR INSERT WITH CHECK (
        -- Allow if user is authenticated OR if submitter_email is provided for anonymous submissions
        auth.uid() IS NOT NULL OR submitter_email IS NOT NULL
    );

-- Also ensure we have a policy for viewing own submissions (pending resources)
DROP POLICY IF EXISTS "Users view own submissions" ON resources;
CREATE POLICY "Users view own submissions" ON resources
    FOR SELECT USING (
        status = 'approved' OR 
        (auth.uid() IS NOT NULL AND submitter_id = auth.uid()) OR
        (submitter_email IS NOT NULL AND submitter_email = auth.email())
    );

-- Grant necessary permissions for resource submission
-- (These might not be needed if using service role, but good to have)
GRANT INSERT ON resources TO authenticated;
GRANT INSERT ON resources TO anon;
GRANT SELECT ON resources TO authenticated;
GRANT SELECT ON resources TO anon;

-- Also ensure resource_tags table allows insertions for tag linking
DROP POLICY IF EXISTS "Allow resource tag linking" ON resource_tags;
CREATE POLICY "Allow resource tag linking" ON resource_tags
    FOR INSERT WITH CHECK (true);

-- Grant permissions for resource_tags
GRANT INSERT ON resource_tags TO authenticated;
GRANT INSERT ON resource_tags TO anon;
GRANT SELECT ON resource_tags TO authenticated;
GRANT SELECT ON resource_tags TO anon;