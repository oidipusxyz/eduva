import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabase } from '../db/supabase'

const router = Router()
router.use(requireAuth)

// Attendance recap: supports month (YYYY-MM) or week (YYYY-Www) period
router.get('/attendance', async (req: AuthRequest, res: Response) => {
  const { class_id, month, week } = req.query
  if (!class_id || (!month && !week)) {
    res.status(400).json({ message: 'class_id dan month/week wajib diisi' }); return
  }

  let start: string
  let end: string

  if (week) {
    // week format: YYYY-Www (e.g. 2025-W23)
    const [yearStr, weekStr] = (week as string).split('-W')
    const year = Number(yearStr)
    const weekNum = Number(weekStr)
    const jan4 = new Date(year, 0, 4)
    const startOfWeek1 = new Date(jan4.getTime() - (jan4.getDay() === 0 ? 6 : jan4.getDay() - 1) * 86400000)
    const weekStart = new Date(startOfWeek1.getTime() + (weekNum - 1) * 7 * 86400000)
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000)
    start = weekStart.toISOString()
    end = weekEnd.toISOString()
  } else {
    const [year, m] = (month as string).split('-')
    start = `${year}-${m}-01T00:00:00.000Z`
    end = new Date(Number(year), Number(m), 1).toISOString()
  }

  const { data: sessions } = await supabase
    .from('attendance_sessions')
    .select('id, created_at, pin')
    .eq('class_id', class_id as string)
    .gte('created_at', start)
    .lt('created_at', end)
    .order('created_at')

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name')
    .eq('class_id', class_id as string)
    .order('full_name')

  if (!sessions || !students) { res.json({ sessions: [], students: [], matrix: [] }); return }

  const sessionIds = sessions.map((s) => s.id)
  const { data: records } = sessionIds.length > 0
    ? await supabase.from('attendance_records').select('*').in('session_id', sessionIds)
    : { data: [] }

  // Build matrix: student x session
  const matrix = students.map((student) => {
    const row: Record<string, string> = { student_id: student.id, full_name: student.full_name }
    let presentCount = 0

    for (const session of sessions) {
      const record = (records ?? []).find(
        (r) => r.session_id === session.id && r.student_id === student.id
      )
      const status = record?.status ?? 'absent'
      row[session.id] = status
      if (status === 'present' || status === 'late') presentCount++
    }

    row.present_count = String(presentCount)
    row.total_sessions = String(sessions.length)
    row.rate = sessions.length > 0 ? String(Math.round((presentCount / sessions.length) * 100)) : '0'
    return row
  })

  res.json({ sessions, students, matrix })
})

// Monthly teaching report for a teacher
router.get('/monthly', async (req: AuthRequest, res: Response) => {
  const { month } = req.query
  if (!month) { res.status(400).json({ message: 'month wajib diisi' }); return }

  const [year, m] = (month as string).split('-')
  const start = `${year}-${m}-01`
  const end = new Date(Number(year), Number(m), 0).toISOString().split('T')[0]

  const [
    { data: journals },
    { data: classes },
    { count: totalSessions },
  ] = await Promise.all([
    supabase.from('teaching_journals')
      .select('*, classes(name, grade)')
      .eq('teacher_id', req.teacherId!)
      .gte('session_date', start)
      .lte('session_date', end)
      .order('session_date'),
    supabase.from('classes').select('id, name, grade').eq('teacher_id', req.teacherId!),
    supabase.from('attendance_sessions')
      .select('classes!inner(teacher_id)', { count: 'exact', head: true })
      .eq('classes.teacher_id', req.teacherId!)
      .gte('created_at', `${start}T00:00:00.000Z`)
      .lte('created_at', `${end}T23:59:59.999Z`),
  ])

  res.json({
    month,
    total_sessions: totalSessions ?? 0,
    total_journals: (journals ?? []).length,
    classes: classes ?? [],
    journals: journals ?? [],
  })
})

export default router
