-- Migration: 009_create_projection_snapshots_table.sql
-- Description: Create PROJECTION_SNAPSHOTS table
-- Author: System
-- Date: 2026-02-16

BEGIN;

CREATE TABLE PROJECTION_SNAPSHOTS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  snapshot_date TIMESTAMP NOT NULL,
  snapshot_name VARCHAR(255) NOT NULL,
  projected_gp DECIMAL(15,2) NOT NULL,
  projected_gp_pct DECIMAL(5,2) NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_snapshots_projects 
    FOREIGN KEY (project_id) 
    REFERENCES PROJECTS(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_snapshots_created_by 
    FOREIGN KEY (created_by) 
    REFERENCES USERS(id) 
    ON DELETE RESTRICT,
  CONSTRAINT chk_snapshots_gp_pct CHECK (projected_gp_pct BETWEEN 0 AND 100)
);

-- Indexes
CREATE INDEX idx_snapshots_project_id ON PROJECTION_SNAPSHOTS(project_id);
CREATE INDEX idx_snapshots_created_by ON PROJECTION_SNAPSHOTS(created_by);
CREATE INDEX idx_snapshots_snapshot_date ON PROJECTION_SNAPSHOTS(snapshot_date);
CREATE INDEX idx_snapshots_project_date ON PROJECTION_SNAPSHOTS(project_id, snapshot_date DESC);

-- Comments
COMMENT ON TABLE PROJECTION_SNAPSHOTS IS 'Project cost projection snapshots';
COMMENT ON COLUMN PROJECTION_SNAPSHOTS.snapshot_date IS 'Date/time when snapshot was taken';
COMMENT ON COLUMN PROJECTION_SNAPSHOTS.snapshot_name IS 'User-friendly name for this snapshot';
COMMENT ON COLUMN PROJECTION_SNAPSHOTS.projected_gp IS 'Projected gross profit';
COMMENT ON COLUMN PROJECTION_SNAPSHOTS.projected_gp_pct IS 'Projected gross profit percentage';

COMMIT;
