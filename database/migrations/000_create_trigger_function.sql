-- Migration: 000_create_trigger_function.sql
-- Description: Create trigger function for auto-updating updated_at timestamp
-- Author: System
-- Date: 2026-02-16

BEGIN;

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;
