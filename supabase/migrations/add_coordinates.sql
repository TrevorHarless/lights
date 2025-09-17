-- Add latitude and longitude columns to projects table
ALTER TABLE projects 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Add index for location-based queries
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects(latitude, longitude);

-- Add comment explaining the coordinate precision
COMMENT ON COLUMN projects.latitude IS 'Latitude coordinate (decimal degrees, -90 to 90)';
COMMENT ON COLUMN projects.longitude IS 'Longitude coordinate (decimal degrees, -180 to 180)';