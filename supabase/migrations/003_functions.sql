-- Function to get a random approved resource
CREATE OR REPLACE FUNCTION get_random_resource()
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    url VARCHAR(500),
    file_path VARCHAR(500),
    resource_type resource_type,
    category_id UUID,
    category_name VARCHAR(100),
    category_slug VARCHAR(100),
    category_color VARCHAR(7),
    vote_score INTEGER,
    view_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    tags JSON
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.title,
        r.description,
        r.url,
        r.file_path,
        r.resource_type,
        r.category_id,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color,
        r.vote_score,
        r.view_count,
        r.created_at,
        COALESCE(
            json_agg(
                json_build_object(
                    'id', t.id,
                    'name', t.name,
                    'slug', t.slug
                )
            ) FILTER (WHERE t.id IS NOT NULL),
            '[]'::json
        ) as tags
    FROM resources r
    LEFT JOIN categories c ON r.category_id = c.id
    LEFT JOIN resource_tags rt ON r.id = rt.resource_id
    LEFT JOIN tags t ON rt.tag_id = t.id
    WHERE r.status = 'approved'
    GROUP BY r.id, c.name, c.slug, c.color
    ORDER BY RANDOM()
    LIMIT 1;
END;
$$;

-- Function to update vote score when votes change
CREATE OR REPLACE FUNCTION update_resource_vote_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Calculate new vote score
    UPDATE resources 
    SET vote_score = (
        SELECT COALESCE(
            SUM(CASE 
                WHEN vote_type = 'up' THEN 1 
                WHEN vote_type = 'down' THEN -1 
                ELSE 0 
            END), 
            0
        )
        FROM votes 
        WHERE resource_id = COALESCE(NEW.resource_id, OLD.resource_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.resource_id, OLD.resource_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for vote score updates
CREATE TRIGGER trigger_update_vote_score
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_resource_vote_score();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(resource_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE resources 
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE id = resource_uuid AND status = 'approved';
END;
$$;

-- Function to get resources with full details (for search and filtering)
CREATE OR REPLACE FUNCTION get_resources_with_details(
    search_query TEXT DEFAULT NULL,
    category_filter UUID DEFAULT NULL,
    tag_filters UUID[] DEFAULT NULL,
    resource_type_filter resource_type DEFAULT NULL,
    status_filter resource_status DEFAULT 'approved',
    sort_by TEXT DEFAULT 'created_at',
    sort_order TEXT DEFAULT 'desc',
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    url VARCHAR(500),
    file_path VARCHAR(500),
    resource_type resource_type,
    category_id UUID,
    category_name VARCHAR(100),
    category_slug VARCHAR(100),
    category_color VARCHAR(7),
    vote_score INTEGER,
    view_count INTEGER,
    status resource_status,
    created_at TIMESTAMP WITH TIME ZONE,
    tags JSON,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    query_text TEXT;
    sort_column TEXT;
BEGIN
    -- Validate sort parameters
    sort_column := CASE 
        WHEN sort_by = 'vote_score' THEN 'r.vote_score'
        WHEN sort_by = 'view_count' THEN 'r.view_count'
        WHEN sort_by = 'title' THEN 'r.title'
        ELSE 'r.created_at'
    END;
    
    -- Build the query
    query_text := '
    WITH filtered_resources AS (
        SELECT DISTINCT r.id
        FROM resources r
        LEFT JOIN categories c ON r.category_id = c.id
        LEFT JOIN resource_tags rt ON r.id = rt.resource_id
        LEFT JOIN tags t ON rt.tag_id = t.id
        WHERE r.status = $4';
    
    -- Add search filter
    IF search_query IS NOT NULL AND search_query != '' THEN
        query_text := query_text || ' AND (
            r.title ILIKE ''%'' || $1 || ''%'' OR 
            r.description ILIKE ''%'' || $1 || ''%'' OR
            to_tsvector(''english'', r.title || '' '' || COALESCE(r.description, '''')) @@ plainto_tsquery(''english'', $1)
        )';
    END IF;
    
    -- Add category filter
    IF category_filter IS NOT NULL THEN
        query_text := query_text || ' AND r.category_id = $2';
    END IF;
    
    -- Add resource type filter
    IF resource_type_filter IS NOT NULL THEN
        query_text := query_text || ' AND r.resource_type = $5';
    END IF;
    
    -- Add tag filters
    IF tag_filters IS NOT NULL AND array_length(tag_filters, 1) > 0 THEN
        query_text := query_text || ' AND t.id = ANY($3)';
    END IF;
    
    query_text := query_text || '
    ),
    total AS (
        SELECT COUNT(*) as count FROM filtered_resources
    )
    SELECT 
        r.id,
        r.title,
        r.description,
        r.url,
        r.file_path,
        r.resource_type,
        r.category_id,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color,
        r.vote_score,
        r.view_count,
        r.status,
        r.created_at,
        COALESCE(
            json_agg(
                json_build_object(
                    ''id'', t.id,
                    ''name'', t.name,
                    ''slug'', t.slug
                )
            ) FILTER (WHERE t.id IS NOT NULL),
            ''[]''::json
        ) as tags,
        total.count as total_count
    FROM filtered_resources fr
    JOIN resources r ON fr.id = r.id
    LEFT JOIN categories c ON r.category_id = c.id
    LEFT JOIN resource_tags rt ON r.id = rt.resource_id
    LEFT JOIN tags t ON rt.tag_id = t.id
    CROSS JOIN total
    GROUP BY r.id, c.name, c.slug, c.color, total.count
    ORDER BY ' || sort_column || ' ' || CASE WHEN sort_order = 'asc' THEN 'ASC' ELSE 'DESC' END || '
    LIMIT $6 OFFSET $7';
    
    RETURN QUERY EXECUTE query_text 
    USING search_query, category_filter, tag_filters, status_filter, resource_type_filter, limit_count, offset_count;
END;
$$;

-- Function to create user profile automatically when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_profiles (id, username, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        'user'
    );
    RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create triggers for updated_at columns
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votes_updated_at
    BEFORE UPDATE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();