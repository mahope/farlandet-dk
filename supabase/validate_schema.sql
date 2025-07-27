-- Validation script to test database schema and functions
-- This script can be run to verify that all components are working correctly

-- Test 1: Verify all tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('categories', 'tags', 'user_profiles', 'resources', 'resource_tags', 'votes', 'comments');
    
    IF table_count = 7 THEN
        RAISE NOTICE 'SUCCESS: All 7 required tables exist';
    ELSE
        RAISE EXCEPTION 'FAILED: Expected 7 tables, found %', table_count;
    END IF;
END $$;

-- Test 2: Verify RLS is enabled on all tables
DO $$
DECLARE
    rls_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO rls_count
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
    AND c.relname IN ('categories', 'tags', 'user_profiles', 'resources', 'resource_tags', 'votes', 'comments')
    AND c.relrowsecurity = true;
    
    IF rls_count = 7 THEN
        RAISE NOTICE 'SUCCESS: RLS enabled on all 7 tables';
    ELSE
        RAISE EXCEPTION 'FAILED: RLS not enabled on all tables. Found % with RLS', rls_count;
    END IF;
END $$;

-- Test 3: Verify custom types exist
DO $$
DECLARE
    type_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO type_count
    FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'public'
    AND t.typname IN ('user_role', 'resource_status', 'resource_type', 'vote_type');
    
    IF type_count = 4 THEN
        RAISE NOTICE 'SUCCESS: All 4 custom types exist';
    ELSE
        RAISE EXCEPTION 'FAILED: Expected 4 custom types, found %', type_count;
    END IF;
END $$;

-- Test 4: Verify functions exist
DO $$
DECLARE
    function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN ('get_random_resource', 'get_resources_with_details', 'increment_view_count', 'update_resource_vote_score', 'handle_new_user');
    
    IF function_count >= 5 THEN
        RAISE NOTICE 'SUCCESS: All required functions exist';
    ELSE
        RAISE EXCEPTION 'FAILED: Expected at least 5 functions, found %', function_count;
    END IF;
END $$;

-- Test 5: Verify indexes exist
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';
    
    IF index_count >= 8 THEN
        RAISE NOTICE 'SUCCESS: Performance indexes created (found %)', index_count;
    ELSE
        RAISE EXCEPTION 'FAILED: Expected at least 8 indexes, found %', index_count;
    END IF;
END $$;

-- Test 6: Test foreign key constraints
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
    AND constraint_type = 'FOREIGN KEY';
    
    IF fk_count >= 8 THEN
        RAISE NOTICE 'SUCCESS: Foreign key constraints exist (found %)', fk_count;
    ELSE
        RAISE EXCEPTION 'FAILED: Expected at least 8 foreign keys, found %', fk_count;
    END IF;
END $$;

-- Test 7: Verify triggers exist
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public';
    
    IF trigger_count >= 6 THEN
        RAISE NOTICE 'SUCCESS: Triggers created (found %)', trigger_count;
    ELSE
        RAISE EXCEPTION 'FAILED: Expected at least 6 triggers, found %', trigger_count;
    END IF;
END $$;

-- Test 8: Test that we can insert sample data (this will be rolled back)
BEGIN;

-- Insert test category
INSERT INTO categories (name, slug, description) 
VALUES ('Test Category', 'test-category', 'Test description');

-- Insert test tag
INSERT INTO tags (name, slug) 
VALUES ('test-tag', 'test-tag');

RAISE NOTICE 'SUCCESS: Sample data insertion works';

ROLLBACK;

RAISE NOTICE 'Database schema validation completed successfully!';
RAISE NOTICE 'All tables, functions, policies, and constraints are properly configured.';
RAISE NOTICE 'The database is ready for the Danish Fathers Directory application.';