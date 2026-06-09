import { Router, Response, Request } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabase } from '../db/supabase'

const router = Router()

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Teacher routes (protected)
router.get('/sessions', requireAuth, async (req: AuthRequest, res: Response) => {
  const { class_id } = req.query
  if (!class_id) { res.status(400).json({ message: 'class_id wajib diisi' }); return }

  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*, attendance_records(count)')
    .eq('class_id', class_id as string)
    .order('created_at', { ascending: false })

  if (error) { res.status(500).json({ message: error.message }); return }

  const sessions = await Promise.all((data ?? []).map(async (s: Record<string, unknown>) => {
    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', class_id as string)

    const presentCount = Array.isArray(s.attendance_records)
      ? (s.attendance_records[0] as { count: number })?.count ?? 0
      : 0

    return {
      ...s,
      present_count: presentCount,
      total_count: count ?? 0,
      attendance_records: undefined,
    }
  }))

  res.json(sessions)
})

router.post('/sessions', requireAuth, async (req: AuthRequest, res: Response) => {
  const { class_id, duration_minutes = 15 } = req.body
  if (!class_id) { res.status(400).json({ message: 'class_id wajib diisi' }); return }

  const pin = generatePin()
  const expires_at = new Date(Date.now() + duration_minutes * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('attendance_sessions')
    .insert({ class_id, pin, expires_at })
    .select()
    .single()

  if (error || !data) { res.status(500).json({ message: 'Gagal membuat sesi' }); return }

  // Trigger alert check in background (non-blocking)
  supabase.rpc('check_alerts', { p_class_id: class_id }).then(() => null, () => null)

  res.status(201).json(data)
})

// Student submit attendance with PIN (public)
router.post('/submit', async (req: Request, res: Response) => {
  const { pin, student_id } = req.body
  if (!pin || !student_id) { res.status(400).json({ message: 'PIN dan student_id wajib diisi' }); return }

  const { data: session } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('pin', pin)
    .single()

  if (!session) { res.status(404).json({ message: 'PIN tidak ditemukan' }); return }
  if (new Date(session.expires_at) < new Date()) {
    res.status(410).json({ message: 'PIN sudah kedaluwarsa' }); return
  }

  const { error } = await supabase
    .from('attendance_records')
    .upsert({ session_id: session.id, student_id, status: 'present' }, { onConflict: 'session_id,student_id' })

  if (error) { res.status(500).json({ message: 'Gagal mencatat absensi' }); return }
  res.json({ message: 'Absensi berhasil' })
})

// Session detail with all student records
router.get('/sessions/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data: session, error: sErr } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (sErr || !session) { res.status(404).json({ message: 'Sesi tidak ditemukan' }); return }

  // Get all students in class
  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, username')
    .eq('class_id', session.class_id)
    .order('full_name')

  // Get existing records
  const { data: records } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('session_id', req.params.id)

  // Merge: every student gets a record (default absent if not submitted)
  const merged = (students ?? []).map((s) => {
    const record = (records ?? []).find((r) => r.student_id === s.id)
    return {
      student_id: s.id,
      full_name: s.full_name,
      username: s.username,
      record_id: record?.id ?? null,
      status: record?.status ?? 'absent',
    }
  })

  res.json({ session, students: merged })
})

// Insert or update a single record (manual override)
router.put('/sessions/:sessionId/students/:studentId', requireAuth, async (req: AuthRequest, res: Response) => {
  const { status } = req.body
  const validStatuses = ['present', 'absent', 'late', 'excused']
  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: 'Status tidak valid' }); return
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .upsert(
      { session_id: req.params.sessionId, student_id: req.params.studentId, status },
      { onConflict: 'session_id,student_id' }
    )
    .select()
    .single()

  if (error || !data) { res.status(500).json({ message: 'Gagal mengupdate absensi' }); return }
  res.json(data)
})

// Manual override
router.put('/records/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { status } = req.body
  const validStatuses = ['present', 'absent', 'late', 'excused']
  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: 'Status tidak valid' }); return
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error || !data) { res.status(500).json({ message: 'Gagal mengupdate absensi' }); return }
  res.json(data)
})

export default router
