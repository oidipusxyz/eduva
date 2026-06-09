import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../db/supabase'
import { processAttendance } from './gamification'

const router = Router()

// Student login
router.post('/login', async (req: Request, res: Response) => {
  const { full_name, password } = req.body
  if (!full_name || !password) {
    res.status(400).json({ message: 'Nama lengkap dan password wajib diisi' }); return
  }

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, username, password_hash, class_id')
    .ilike('full_name', full_name.trim())

  if (!students || students.length === 0) {
    res.status(401).json({ message: 'Nama lengkap atau password salah' }); return
  }

  // Find the student whose password matches (handles same name in different classes)
  let student = null
  for (const s of students) {
    const valid = await bcrypt.compare(password, s.password_hash)
    if (valid) { student = s; break }
  }

  if (!student) {
    res.status(401).json({ message: 'Nama lengkap atau password salah' }); return
  }

  const token = jwt.sign(
    { id: student.id, role: 'student', class_id: student.class_id },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  )

  const { password_hash: _, ...safeStudent } = student
  res.json({ token, student: safeStudent })
})

// Get student's class content (read-only)
router.get('/content', async (req: Request, res: Response) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ message: 'Unauthorized' }); return }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { id: string; class_id: string; role: string }
    if (payload.role !== 'student') { res.status(403).json({ message: 'Forbidden' }); return }

    const [{ data: contents, error }, { data: submissions }] = await Promise.all([
      supabase.from('contents').select('*').eq('class_id', payload.class_id).order('created_at', { ascending: false }),
      supabase.from('student_submissions').select('content_id, submitted_at, on_time').eq('student_id', payload.id),
    ])

    if (error) { res.status(500).json({ message: error.message }); return }

    const submittedMap = new Map((submissions ?? []).map((s) => [s.content_id, s]))
    const result = (contents ?? []).map((c) => {
      const sub = submittedMap.get(c.id)
      return { ...c, submitted: !!sub, submitted_at: sub?.submitted_at ?? null, on_time: sub?.on_time ?? null }
    })
    res.json(result)
  } catch {
    res.status(401).json({ message: 'Token tidak valid' })
  }
})

// Submit assignment (mark as done, award points if on time)
router.post('/submit/:contentId', async (req: Request, res: Response) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ message: 'Unauthorized' }); return }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { id: string; class_id: string; role: string }
    if (payload.role !== 'student') { res.status(403).json({ message: 'Forbidden' }); return }

    const { data: content } = await supabase
      .from('contents')
      .select('id, type, deadline, class_id')
      .eq('id', req.params.contentId)
      .single()

    if (!content) { res.status(404).json({ message: 'Tugas tidak ditemukan' }); return }
    if (content.type !== 'assignment') { res.status(400).json({ message: 'Bukan tugas' }); return }

    // Check already submitted
    const { data: existing } = await supabase
      .from('student_submissions')
      .select('id')
      .eq('student_id', payload.id)
      .eq('content_id', content.id)
      .single()

    if (existing) { res.status(409).json({ message: 'Tugas sudah dikumpulkan' }); return }

    const onTime = !content.deadline || new Date(content.deadline) >= new Date()
    const points = onTime ? 15 : 5

    await supabase.from('student_submissions').insert({
      student_id: payload.id,
      content_id: content.id,
      on_time: onTime,
    })

    // Award points (non-blocking)
    supabase.from('student_points').insert({
      student_id: payload.id,
      class_id: content.class_id,
      points,
      source: 'assignment',
    }).then(null, null)

    const msg = onTime
      ? `Tugas berhasil dikumpulkan! +${points} poin 🎉`
      : `Tugas dikumpulkan (terlambat). +${points} poin`

    res.json({ message: msg, points, on_time: onTime })
  } catch {
    res.status(401).json({ message: 'Token tidak valid' })
  }
})

// Submit PIN attendance
router.post('/attendance', async (req: Request, res: Response) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ message: 'Unauthorized' }); return }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { id: string; role: string }
    if (payload.role !== 'student') { res.status(403).json({ message: 'Forbidden' }); return }

    const { pin } = req.body
    if (!pin) { res.status(400).json({ message: 'PIN wajib diisi' }); return }

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
      .upsert(
        { session_id: session.id, student_id: payload.id, status: 'present' },
        { onConflict: 'session_id,student_id' }
      )

    if (error) { res.status(500).json({ message: 'Gagal mencatat absensi' }); return }

    // Award points + update streak (non-blocking)
    processAttendance(payload.id, session.class_id, 'present').catch(() => null)

    res.json({ message: 'Absensi berhasil dicatat! +10 poin 🎉' })
  } catch {
    res.status(401).json({ message: 'Token tidak valid' })
  }
})

// Get student attendance history
router.get('/attendance/history', async (req: Request, res: Response) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ message: 'Unauthorized' }); return }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { id: string; role: string }
    if (payload.role !== 'student') { res.status(403).json({ message: 'Forbidden' }); return }

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*, attendance_sessions(created_at, expires_at)')
      .eq('student_id', payload.id)
      .order('created_at', { ascending: false })

    if (error) { res.status(500).json({ message: error.message }); return }
    res.json(data ?? [])
  } catch {
    res.status(401).json({ message: 'Token tidak valid' })
  }
})

export default router
