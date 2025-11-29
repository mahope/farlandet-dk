-- Drop all tables for Farlandet.dk
-- WARNING: This will delete ALL data permanently!
-- Run with: psql -U postgres -d farlandet -f drop_all.sql

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS resource_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any custom types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS resource_status CASCADE;
DROP TYPE IF EXISTS resource_type CASCADE;
DROP TYPE IF EXISTS vote_type CASCADE;

-- Confirm deletion
SELECT 'All tables dropped successfully!' AS status;
