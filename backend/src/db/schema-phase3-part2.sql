-- Run in Supabase SQL Editor (Phase 3 Part 2 — Assignment Submissions)

CREATE TABLE IF NOT EXISTS student_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  on_time BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(student_id, content_id)
);

ALTER TABLE student_submissions DISABLE ROW LEVEL SECURITY;
