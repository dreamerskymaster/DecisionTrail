-- DecisionTrail Database Schema for Supabase
-- Run this in the Supabase SQL Editor to set up your tables.
-- Safe to re-run: uses IF NOT EXISTS and IF EXISTS guards.

-- ===========================================================
-- TABLES
-- ===========================================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decisions table
CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  project_name TEXT,
  what TEXT,
  why TEXT,
  alternatives TEXT,
  who TEXT,
  risks TEXT,
  phase TEXT CHECK (phase IN ('Planning', 'Procurement', 'Installation', 'Commissioning', 'Closeout')),
  category TEXT CHECK (category IN ('Engineering', 'Scheduling', 'Budget', 'Safety', 'Scope', 'Vendor', 'Resource')),
  impact TEXT CHECK (impact IN ('Low', 'Medium', 'High', 'Critical')),
  summary TEXT,
  completeness INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================
-- INDEXES
-- ===========================================================
CREATE INDEX IF NOT EXISTS idx_decisions_project ON decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_decisions_phase ON decisions(phase);
CREATE INDEX IF NOT EXISTS idx_decisions_category ON decisions(category);
CREATE INDEX IF NOT EXISTS idx_decisions_created ON decisions(created_at DESC);

-- Full-text search index
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(what, '') || ' ' || coalesce(why, '') || ' ' ||
    coalesce(alternatives, '') || ' ' || coalesce(who, '') || ' ' || coalesce(risks, '') || ' ' ||
    coalesce(summary, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_decisions_search ON decisions USING gin(search_vector);

-- ===========================================================
-- ROW LEVEL SECURITY
-- ===========================================================
-- Demo-friendly: allow anon and authenticated roles to read/write.
-- For production multi-user, replace with auth.uid()-based policies.

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- Clean up any prior policies before recreating
DROP POLICY IF EXISTS "Allow all for authenticated" ON projects;
DROP POLICY IF EXISTS "Allow all for authenticated" ON decisions;
DROP POLICY IF EXISTS "projects_anon_all" ON projects;
DROP POLICY IF EXISTS "decisions_anon_all" ON decisions;

-- Explicit policies for anon and authenticated roles
CREATE POLICY "projects_anon_all" ON projects
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "decisions_anon_all" ON decisions
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Grant table-level access to anon (required alongside RLS in some setups)
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON decisions TO anon, authenticated;
