-- Run in Supabase SQL Editor (Phase 5 — Admin Role)

-- Add role column to teachers
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'teacher'
  CHECK (role IN ('teacher', 'admin'));

ALTER TABLE teachers ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Promote first teacher to admin (run once, then change email to yours)
-- UPDATE teachers SET role = 'admin' WHERE email = 'your-email@example.com';
