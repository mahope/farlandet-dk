-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE resource_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE resource_type AS ENUM ('link', 'pdf', 'article', 'podcast', 'tip', 'book', 'video', 'movie', 'tv_series');
CREATE TYPE vote_type AS ENUM ('up', 'down');

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100),
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500),
    file_path VARCHAR(500),
    resource_type resource_type NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    submitter_email VARCHAR(255),
    submitter_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    status resource_status DEFAULT 'pending',
    vote_score INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_resource_content CHECK (
        (url IS NOT NULL AND file_path IS NULL) OR 
        (url IS NULL AND file_path IS NOT NULL) OR
        (resource_type = 'tip' AND url IS NULL AND file_path IS NULL)
    )
);

-- Resource tags junction table
CREATE TABLE resource_tags (
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (resource_id, tag_id)
);

-- Votes table
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    vote_type vote_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one vote per user per resource
    UNIQUE(user_id, resource_id)
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_category ON resources(category_id);
CREATE INDEX idx_resources_created_at ON resources(created_at DESC);
CREATE INDEX idx_resources_vote_score ON resources(vote_score DESC);
CREATE INDEX idx_resources_submitter ON resources(submitter_id);
CREATE INDEX idx_votes_resource ON votes(resource_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_comments_resource ON comments(resource_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_resource_tags_resource ON resource_tags(resource_id);
CREATE INDEX idx_resource_tags_tag ON resource_tags(tag_id);

-- Full text search index for resources
CREATE INDEX idx_resources_search ON resources USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));