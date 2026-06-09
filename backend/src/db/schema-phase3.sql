-- Run in Supabase SQL Editor (Phase 3)

-- Poin & Gamifikasi
CREATE TABLE IF NOT EXISTS student_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL CHECK (source IN ('attendance','assignment')),
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badge definitions
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL
);

-- Student earned badges
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, badge_id)
);

-- Streak per student per class
CREATE TABLE IF NOT EXISTS attendance_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_updated DATE,
  UNIQUE(student_id, class_id)
);

ALTER TABLE student_points DISABLE ROW LEVEL SECURITY;
ALTER TABLE badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_streaks DISABLE ROW LEVEL SECURITY;

-- Seed default badges
INSERT INTO badges (name, description, icon, condition_type, condition_value) VALUES
  ('Rajin Hadir', 'Hadir 7 hari berturut-turut', '🔥', 'streak', 7),
  ('Konsisten', 'Hadir 14 hari berturut-turut', '⚡', 'streak', 14),
  ('Juara Hadir', 'Hadir 30 hari berturut-turut', '🏆', 'streak', 30),
  ('Poin 100', 'Kumpulkan 100 poin', '⭐', 'points', 100),
  ('Poin 500', 'Kumpulkan 500 poin', '💎', 'points', 500)
ON CONFLICT DO NOTHING;
