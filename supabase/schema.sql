-- DecisionTrail Database Schema for Supabase
-- Run this in the Supabase SQL Editor to set up your tables

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
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
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

-- Indexes for fast retrieval
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

-- Row Level Security (optional, for multi-user support later)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust for production)
CREATE POLICY "Allow all for authenticated" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON decisions FOR ALL USING (true);
