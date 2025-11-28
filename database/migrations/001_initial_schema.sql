-- =====================================================
-- Farlandet.dk Database Schema
-- Initial Migration - PostgreSQL
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- 2. CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- =====================================================
-- 3. TAGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_name ON tags(name);

-- =====================================================
-- 4. RESOURCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT,
    file_path TEXT,
    resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('link', 'pdf', 'article', 'podcast', 'tip', 'book', 'video', 'movie', 'tv_series')),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    submitter_email VARCHAR(255),
    submitter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    vote_score INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    rejection_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by VARCHAR(255)
);

CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_type ON resources(resource_type);
CREATE INDEX idx_resources_category ON resources(category_id);
CREATE INDEX idx_resources_submitter ON resources(submitter_id);
CREATE INDEX idx_resources_vote_score ON resources(vote_score DESC);
CREATE INDEX idx_resources_created ON resources(created_at DESC);
CREATE INDEX idx_resources_title ON resources USING gin(to_tsvector('danish', title));
CREATE INDEX idx_resources_description ON resources USING gin(to_tsvector('danish', description));

-- =====================================================
-- 5. RESOURCE_TAGS JUNCTION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS resource_tags (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource_id, tag_id)
);

CREATE INDEX idx_resource_tags_resource ON resource_tags(resource_id);
CREATE INDEX idx_resource_tags_tag ON resource_tags(tag_id);

-- =====================================================
-- 6. VOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, resource_id)
);

CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_votes_resource ON votes(resource_id);
CREATE INDEX idx_votes_type ON votes(vote_type);

-- =====================================================
-- 7. COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_resource ON comments(resource_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_deleted ON comments(is_deleted);
CREATE INDEX idx_comments_created ON comments(created_at DESC);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER FOR VOTE SCORE CALCULATION
-- =====================================================

-- Function to update resource vote_score
CREATE OR REPLACE FUNCTION update_resource_vote_score()
RETURNS TRIGGER AS $$
DECLARE
    up_votes INTEGER;
    down_votes INTEGER;
    resource_id_val INTEGER;
BEGIN
    -- Determine which resource_id to use
    IF TG_OP = 'DELETE' THEN
        resource_id_val := OLD.resource_id;
    ELSE
        resource_id_val := NEW.resource_id;
    END IF;

    -- Count votes
    SELECT
        COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN vote_type = 'down' THEN 1 ELSE 0 END), 0)
    INTO up_votes, down_votes
    FROM votes
    WHERE resource_id = resource_id_val;

    -- Update resource vote_score
    UPDATE resources
    SET vote_score = up_votes - down_votes
    WHERE id = resource_id_val;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

-- Apply vote score trigger
CREATE TRIGGER update_vote_score_on_insert AFTER INSERT ON votes
    FOR EACH ROW EXECUTE FUNCTION update_resource_vote_score();

CREATE TRIGGER update_vote_score_on_update AFTER UPDATE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_resource_vote_score();

CREATE TRIGGER update_vote_score_on_delete AFTER DELETE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_resource_vote_score();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for approved resources with details
CREATE OR REPLACE VIEW approved_resources_view AS
SELECT
    r.*,
    c.name as category_name,
    c.slug as category_slug,
    c.color as category_color,
    u.email as submitter_email_user,
    u.username as submitter_username,
    COUNT(DISTINCT v.id) as total_votes,
    COUNT(DISTINCT cm.id) FILTER (WHERE cm.is_deleted = false) as comment_count,
    ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names
FROM resources r
LEFT JOIN categories c ON r.category_id = c.id
LEFT JOIN users u ON r.submitter_id = u.id
LEFT JOIN votes v ON r.id = v.resource_id
LEFT JOIN comments cm ON r.id = cm.resource_id
LEFT JOIN resource_tags rt ON r.id = rt.resource_id
LEFT JOIN tags t ON rt.tag_id = t.id
WHERE r.status = 'approved'
GROUP BY r.id, c.id, u.id;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'Bruger profiler med authentication';
COMMENT ON TABLE categories IS 'Ressource kategorier (Bøger, Podcasts, etc.)';
COMMENT ON TABLE tags IS 'Fleksibel tagging system';
COMMENT ON TABLE resources IS 'Hovedindhold med moderation workflow';
COMMENT ON TABLE resource_tags IS 'Many-to-many relation mellem resources og tags';
COMMENT ON TABLE votes IS 'Community voting system (upvote/downvote)';
COMMENT ON TABLE comments IS 'Bruger kommentarer med soft deletion';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
