import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabase } from '../db/supabase'

const router = Router()
router.use(requireAuth)

// Dashboard summary: activity today + active alerts
router.get('/summary', async (req: AuthRequest, res: Response) => {
  const teacherId = req.teacherId!
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()

  const [
    { count: classesToday },
    { count: activeAssignments },
    { count: unresolvedAlerts },
    { count: totalStudents },
  ] = await Promise.all([
    supabase.from('attendance_sessions')
      .select('classes!inner(teacher_id)', { count: 'exact', head: true })
      .eq('classes.teacher_id', teacherId)
      .gte('created_at', todayStart),
    supabase.from('contents')
      .select('classes!inner(teacher_id)', { count: 'exact', head: true })
      .eq('classes.teacher_id', teacherId)
      .eq('type', 'assignment')
      .gte('deadline', new Date().toISOString()),
    supabase.from('attendance_alerts')
      .select('classes!inner(teacher_id)', { count: 'exact', head: true })
      .eq('classes.teacher_id', teacherId)
      .eq('resolved', false),
    supabase.from('students')
      .select('classes!inner(teacher_id)', { count: 'exact', head: true })
      .eq('classes.teacher_id', teacherId),
  ])

  res.json({
    classes_today: classesToday ?? 0,
    active_assignments: activeAssignments ?? 0,
    unresolved_alerts: unresolvedAlerts ?? 0,
    total_students: totalStudents ?? 0,
  })
})

// Attendance rate per class (for progress bars)
router.get('/attendance-rates', async (req: AuthRequest, res: Response) => {
  const teacherId = req.teacherId!

  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, grade')
    .eq('teacher_id', teacherId)

  if (!classes || classes.length === 0) { res.json([]); return }

  const rates = await Promise.all(classes.map(async (cls) => {
    const { count: totalStudents } = await supabase
      .from('students').select('*', { count: 'exact', head: true }).eq('class_id', cls.id)

    const { data: sessions } = await supabase
      .from('attendance_sessions').select('id').eq('class_id', cls.id)

    const sessionIds = (sessions ?? []).map((s) => s.id)
    let presentCount = 0
    let totalRecords = 0

    if (sessionIds.length > 0) {
      const { count: present } = await supabase
        .from('attendance_records').select('*', { count: 'exact', head: true })
        .in('session_id', sessionIds).eq('status', 'present')
      const { count: total } = await supabase
        .from('attendance_records').select('*', { count: 'exact', head: true })
        .in('session_id', sessionIds)
      presentCount = present ?? 0
      totalRecords = total ?? 0
    }

    const rate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0

    return {
      class_id: cls.id,
      class_name: cls.name,
      grade: cls.grade,
      total_students: totalStudents ?? 0,
      total_sessions: sessionIds.length,
      attendance_rate: rate,
    }
  }))

  res.json(rates)
})

// Grade trend per class (for charts)
router.get('/grade-trends', async (req: AuthRequest, res: Response) => {
  const teacherId = req.teacherId!
  const { class_id } = req.query

  let classIds: string[] = []
  if (class_id) {
    classIds = [class_id as string]
  } else {
    const { data: classes } = await supabase
      .from('classes').select('id').eq('teacher_id', teacherId)
    classIds = (classes ?? []).map((c) => c.id)
  }

  if (classIds.length === 0) { res.json([]); return }

  const { data: grades } = await supabase
    .from('grades')
    .select('subject, score, class_id, created_at')
    .in('class_id', classIds)
    .order('created_at')

  if (!grades || grades.length === 0) { res.json([]); return }

  // Group by subject and calculate average per month
  const grouped: Record<string, Record<string, number[]>> = {}
  for (const g of grades) {
    const month = new Date(g.created_at).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
    if (!grouped[g.subject]) grouped[g.subject] = {}
    if (!grouped[g.subject][month]) grouped[g.subject][month] = []
    grouped[g.subject][month].push(Number(g.score))
  }

  const trends = Object.entries(grouped).map(([subject, months]) => ({
    subject,
    data: Object.entries(months).map(([month, scores]) => ({
      month,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    })),
  }))

  res.json(trends)
})

// Attendance chart data (last 7 sessions per class)
router.get('/attendance-chart', async (req: AuthRequest, res: Response) => {
  const { class_id } = req.query
  if (!class_id) { res.status(400).json({ message: 'class_id wajib' }); return }

  const { data: sessions } = await supabase
    .from('attendance_sessions')
    .select('id, created_at')
    .eq('class_id', class_id as string)
    .order('created_at', { ascending: false })
    .limit(7)

  if (!sessions || sessions.length === 0) { res.json([]); return }

  const points = await Promise.all(sessions.reverse().map(async (s) => {
    const { count: present } = await supabase
      .from('attendance_records').select('*', { count: 'exact', head: true })
      .eq('session_id', s.id).eq('status', 'present')
    const { count: total } = await supabase
      .from('attendance_records').select('*', { count: 'exact', head: true })
      .eq('session_id', s.id)

    return {
      date: new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      hadir: present ?? 0,
      total: total ?? 0,
      rate: total ? Math.round(((present ?? 0) / total) * 100) : 0,
    }
  }))

  res.json(points)
})

export default router
