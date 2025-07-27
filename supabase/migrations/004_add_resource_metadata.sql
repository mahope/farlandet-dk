-- Add metadata JSONB column to resources table for resource-type specific data
ALTER TABLE resources ADD COLUMN metadata JSONB;

-- Add index for better performance on metadata queries
CREATE INDEX idx_resources_metadata ON resources USING gin(metadata);

-- Update constraint to allow PDF resources with both URL and file_path
ALTER TABLE resources DROP CONSTRAINT valid_resource_content;
ALTER TABLE resources ADD CONSTRAINT valid_resource_content CHECK (
    (url IS NOT NULL OR file_path IS NOT NULL) OR 
    (resource_type = 'tip' AND url IS NULL AND file_path IS NULL)
);