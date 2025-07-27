-- Enable Row Level Security on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert categories" ON categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update categories" ON categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete categories" ON categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Tags policies (public read, authenticated users can create)
CREATE POLICY "Tags are viewable by everyone" ON tags
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert tags" ON tags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Resources policies
CREATE POLICY "Approved resources are viewable by everyone" ON resources
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own submitted resources" ON resources
    FOR SELECT USING (
        submitter_id = auth.uid() OR 
        (submitter_email IS NOT NULL AND submitter_email = auth.email())
    );

CREATE POLICY "Moderators can view all resources" ON resources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Anyone can submit resources" ON resources
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own pending resources" ON resources
    FOR UPDATE USING (
        (submitter_id = auth.uid() OR 
         (submitter_email IS NOT NULL AND submitter_email = auth.email())) 
        AND status = 'pending'
    );

CREATE POLICY "Moderators can update any resource" ON resources
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Only admins can delete resources" ON resources
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Resource tags policies (follow resource permissions)
CREATE POLICY "Resource tags are viewable with their resources" ON resource_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM resources 
            WHERE id = resource_id AND (
                status = 'approved' OR 
                submitter_id = auth.uid() OR
                (submitter_email IS NOT NULL AND submitter_email = auth.email()) OR
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
                )
            )
        )
    );

CREATE POLICY "Resource tags can be inserted with resources" ON resource_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM resources 
            WHERE id = resource_id AND (
                submitter_id = auth.uid() OR
                (submitter_email IS NOT NULL AND submitter_email = auth.email()) OR
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
                )
            )
        )
    );

CREATE POLICY "Resource tags can be updated with resources" ON resource_tags
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM resources 
            WHERE id = resource_id AND (
                submitter_id = auth.uid() OR
                (submitter_email IS NOT NULL AND submitter_email = auth.email()) OR
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
                )
            )
        )
    );

CREATE POLICY "Resource tags can be deleted with resources" ON resource_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM resources 
            WHERE id = resource_id AND (
                submitter_id = auth.uid() OR
                (submitter_email IS NOT NULL AND submitter_email = auth.email()) OR
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
                )
            )
        )
    );

-- Votes policies (authenticated users only)
CREATE POLICY "Users can view votes on approved resources" ON votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM resources 
            WHERE id = resource_id AND status = 'approved'
        )
    );

CREATE POLICY "Authenticated users can insert votes" ON votes
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM resources 
            WHERE id = resource_id AND status = 'approved'
        )
    );

CREATE POLICY "Users can update their own votes" ON votes
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        user_id = auth.uid()
    );

CREATE POLICY "Users can delete their own votes" ON votes
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        user_id = auth.uid()
    );

-- Comments policies
CREATE POLICY "Comments are viewable on approved resources" ON comments
    FOR SELECT USING (
        NOT is_deleted AND
        EXISTS (
            SELECT 1 FROM resources 
            WHERE id = resource_id AND status = 'approved'
        )
    );

CREATE POLICY "Moderators can view all comments" ON comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Authenticated users can insert comments" ON comments
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM resources 
            WHERE id = resource_id AND status = 'approved'
        )
    );

CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        user_id = auth.uid()
    );

CREATE POLICY "Moderators can update any comment" ON comments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        user_id = auth.uid()
    );

CREATE POLICY "Moderators can delete any comment" ON comments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );