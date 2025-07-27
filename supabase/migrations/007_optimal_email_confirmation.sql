-- Optimal email confirmation strategy:
-- 1. Users can login immediately after signup
-- 2. Email confirmation still sent for verification
-- 3. Non-confirmed users have full access but see optional verification prompt

-- Update RLS policies to allow unconfirmed users full access
-- But maintain email confirmation tracking for UI purposes

-- Allow unconfirmed users to use all features
DROP POLICY IF EXISTS "Authenticated users can insert votes" ON votes;
CREATE POLICY "Authenticated users can insert votes" ON votes
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM resources 
            WHERE id = resource_id AND status = 'approved'
        )
        -- No email confirmation requirement
    );

DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;
CREATE POLICY "Authenticated users can insert comments" ON comments
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM resources 
            WHERE id = resource_id AND status = 'approved'
        )
        -- No email confirmation requirement
    );

-- Allow unconfirmed users to submit resources
DROP POLICY IF EXISTS "Anyone can submit resources" ON resources;
CREATE POLICY "Anyone can submit resources" ON resources
    FOR INSERT WITH CHECK (
        -- Allow anonymous submissions OR authenticated users (confirmed or not)
        submitter_id IS NULL OR 
        (auth.role() = 'authenticated' AND submitter_id = auth.uid())
    );

-- Add function to check if user should see email verification reminder
CREATE OR REPLACE FUNCTION should_show_email_verification(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    days_since_signup INTEGER;
BEGIN
    -- Get user information from auth.users
    SELECT 
        email_confirmed_at,
        created_at,
        EXTRACT(DAYS FROM NOW() - created_at)::INTEGER as days_old
    INTO user_record
    FROM auth.users 
    WHERE id = user_id;
    
    -- Show verification reminder if:
    -- 1. Email not confirmed AND
    -- 2. User signed up more than 1 day ago
    RETURN (
        user_record.email_confirmed_at IS NULL AND 
        user_record.days_old >= 1
    );
END;
$$;