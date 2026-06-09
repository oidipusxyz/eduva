import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabase } from '../db/supabase'

const router = Router()
router.use(requireAuth)

// Get all unresolved alerts for this teacher
router.get('/', async (req: AuthRequest, res: Response) => {
  const teacherId = req.teacherId!

  const { data, error } = await supabase
    .from('attendance_alerts')
    .select(`
      *,
      students(full_name),
      classes!inner(name, grade, teacher_id)
    `)
    .eq('classes.teacher_id', teacherId)
    .eq('resolved', false)
    .order('alerted_at', { ascending: false })

  if (error) { res.status(500).json({ message: error.message }); return }
  res.json(data ?? [])
})

// Resolve an alert
router.put('/:id/resolve', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('attendance_alerts')
    .update({ resolved: true })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error || !data) { res.status(500).json({ message: 'Gagal menyelesaikan alert' }); return }
  res.json(data)
})

// Check and generate alerts (called after attendance session)
// Detects students with 3+ consecutive absences
router.post('/check', async (req: AuthRequest, res: Response) => {
  const { class_id } = req.body
  if (!class_id) { res.status(400).json({ message: 'class_id wajib' }); return }

  const { data: students } = await supabase
    .from('students').select('id, full_name').eq('class_id', class_id)

  if (!students || students.length === 0) { res.json({ checked: 0, new_alerts: 0 }); return }

  const { data: sessions } = await supabase
    .from('attendance_sessions')
    .select('id')
    .eq('class_id', class_id)
    .order('created_at', { ascending: false })
    .limit(5)

  const sessionIds = (sessions ?? []).map((s) => s.id)
  if (sessionIds.length < 3) { res.json({ checked: 0, new_alerts: 0 }); return }

  let newAlerts = 0

  for (const student of students) {
    const { data: records } = await supabase
      .from('attendance_records')
      .select('status, session_id')
      .eq('student_id', student.id)
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false })
      .limit(3)

    if (!records || records.length < 3) continue

    const allAbsent = records.every((r) => r.status === 'absent')
    if (!allAbsent) continue

    // Check if alert already exists
    const { data: existing } = await supabase
      .from('attendance_alerts')
      .select('id')
      .eq('student_id', student.id)
      .eq('class_id', class_id)
      .eq('resolved', false)
      .single()

    if (existing) continue

    await supabase.from('attendance_alerts').insert({
      student_id: student.id,
      class_id,
      consecutive_absences: 3,
    })
    newAlerts++
  }

  res.json({ checked: students.length, new_alerts: newAlerts })
})

export default router
