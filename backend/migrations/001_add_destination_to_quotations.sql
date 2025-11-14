-- Migration: Add destination_city_id to quotations table
-- Created: 2025-11-14
-- Description: Adds destination tracking to quotations for better data consistency with bookings

-- Add destination_city_id column to quotations table
ALTER TABLE quotations
ADD COLUMN destination_city_id INTEGER;

-- Add foreign key constraint to cities table
ALTER TABLE quotations
ADD CONSTRAINT fk_quotations_destination_city
FOREIGN KEY (destination_city_id)
REFERENCES cities(id)
ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_quotations_destination_city_id
ON quotations(destination_city_id);

-- Add comment
COMMENT ON COLUMN quotations.destination_city_id IS 'Destination city for the quotation - links to cities table';
