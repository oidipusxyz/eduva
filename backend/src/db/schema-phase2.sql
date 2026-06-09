-- Run this in Supabase SQL Editor (Phase 2 additions)

-- Jurnal Mengajar
CREATE TABLE IF NOT EXISTS teaching_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  topic TEXT NOT NULL,
  activity_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Smart Alert Log
CREATE TABLE IF NOT EXISTS attendance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  consecutive_absences INTEGER NOT NULL DEFAULT 3,
  alerted_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

ALTER TABLE teaching_journals DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_alerts DISABLE ROW LEVEL SECURITY;
