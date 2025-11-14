-- Add location type columns to transfer_routes table
ALTER TABLE transfer_routes
ADD COLUMN IF NOT EXISTS from_location_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS to_location_type VARCHAR(50);

-- Add comment to columns
COMMENT ON COLUMN transfer_routes.from_location_type IS 'Type of departure location (Airport, Hotel, City Center, Port, Train Station, Other)';
COMMENT ON COLUMN transfer_routes.to_location_type IS 'Type of arrival location (Airport, Hotel, City Center, Port, Train Station, Other)';
