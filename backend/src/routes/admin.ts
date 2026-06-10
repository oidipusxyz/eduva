import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import { requireAdmin, AuthRequest } from '../middleware/auth'
import { supabase } from '../db/supabase'

const router = Router()

// Overview stats — all classes in the school
router.get('/overview', requireAdmin, async (_req: AuthRequest, res: Response) => {
  const [
    { count: totalTeachers },
    { count: totalClasses },
    { count: totalStudents },
    { count: totalSessions },
  ] = await Promise.all([
    supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('classes').select('*', { count: 'exact', head: true }),
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('attendance_sessions').select('*', { count: 'exact', head: true }),
  ])

  // Overall attendance rate (last 30 days)
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentSessions } = await supabase
    .from('attendance_sessions')
    .select('id')
    .gte('created_at', since)

  let attendanceRate = 0
  if (recentSessions && recentSessions.length > 0) {
    const sessionIds = recentSessions.map((s) => s.id)
    const [{ count: presentCount }, { count: totalRecords }] = await Promise.all([
      supabase.from('attendance_records').select('*', { count: 'exact', head: true })
        .in('session_id', sessionIds).eq('status', 'present'),
      supabase.from('attendance_records').select('*', { count: 'exact', head: true })
        .in('session_id', sessionIds),
    ])
    attendanceRate = totalRecords ? Math.round(((presentCount ?? 0) / totalRecords) * 100) : 0
  }

  // Unresolved alerts
  const { count: unresolvedAlerts } = await supabase
    .from('attendance_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('resolved', false)

  res.json({
    total_teachers: totalTeachers ?? 0,
    total_classes: totalClasses ?? 0,
    total_students: totalStudents ?? 0,
    total_sessions: totalSessions ?? 0,
    attendance_rate_30d: attendanceRate,
    unresolved_alerts: unresolvedAlerts ?? 0,
  })
})

// List all teachers with their class counts
router.get('/teachers', requireAdmin, async (_req: AuthRequest, res: Response) => {
  const { data: teachers, error } = await supabase
    .from('teachers')
    .select('id, name, email, role, is_active, created_at')
    .order('created_at', { ascending: false })

  if (error) { res.status(500).json({ message: error.message }); return }

  const result = await Promise.all((teachers ?? []).map(async (t) => {
    const { count: classCount } = await supabase
      .from('classes').select('*', { count: 'exact', head: true }).eq('teacher_id', t.id)
    const { count: sessionCount } = await supabase
      .from('attendance_sessions').select('id', { count: 'exact', head: true })
      .in('class_id',
        (await supabase.from('classes').select('id').eq('teacher_id', t.id)).data?.map((c) => c.id) ?? []
      )
    return { ...t, class_count: classCount ?? 0, session_count: sessionCount ?? 0 }
  }))

  res.json(result)
})

// Create teacher account (admin only)
router.post('/teachers', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    res.status(400).json({ message: 'Nama, email, dan password wajib diisi' }); return
  }

  const { data: existing } = await supabase.from('teachers').select('id').eq('email', email).single()
  if (existing) { res.status(409).json({ message: 'Email sudah terdaftar' }); return }

  const password_hash = await bcrypt.hash(password, 12)
  const { data, error } = await supabase
    .from('teachers')
    .insert({ name, email, password_hash, role: 'teacher', is_active: true })
    .select('id, name, email, role, is_active')
    .single()

  if (error || !data) { res.status(500).json({ message: 'Gagal membuat akun guru' }); return }
  res.status(201).json(data)
})

// Toggle teacher active status
router.patch('/teachers/:id/toggle', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { data: teacher } = await supabase
    .from('teachers').select('id, is_active, role').eq('id', req.params.id).single()

  if (!teacher) { res.status(404).json({ message: 'Guru tidak ditemukan' }); return }
  if (teacher.role === 'admin') { res.status(400).json({ message: 'Tidak bisa menonaktifkan admin' }); return }

  const { error } = await supabase
    .from('teachers').update({ is_active: !teacher.is_active }).eq('id', req.params.id)

  if (error) { res.status(500).json({ message: error.message }); return }
  res.json({ is_active: !teacher.is_active })
})

// Promote/demote teacher role
router.patch('/teachers/:id/role', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { role } = req.body
  if (!['teacher', 'admin'].includes(role)) {
    res.status(400).json({ message: 'Role tidak valid' }); return
  }

  const { error } = await supabase.from('teachers').update({ role }).eq('id', req.params.id)
  if (error) { res.status(500).json({ message: error.message }); return }
  res.json({ role })
})

// Delete teacher
router.delete('/teachers/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { data: teacher } = await supabase
    .from('teachers').select('id, role').eq('id', req.params.id).single()

  if (!teacher) { res.status(404).json({ message: 'Guru tidak ditemukan' }); return }
  if (teacher.role === 'admin') { res.status(400).json({ message: 'Tidak bisa menghapus akun admin' }); return }
  if (teacher.id === req.teacherId) { res.status(400).json({ message: 'Tidak bisa menghapus akun sendiri' }); return }

  const { data: classes } = await supabase
    .from('classes').select('id').eq('teacher_id', req.params.id)

  if (classes && classes.length > 0) {
    res.status(400).json({ message: `Guru masih memiliki ${classes.length} kelas. Hapus semua kelasnya terlebih dahulu.` }); return
  }

  const { error } = await supabase.from('teachers').delete().eq('id', req.params.id)
  if (error) { res.status(500).json({ message: error.message }); return }
  res.status(204).send()
})

// School-wide attendance report (all classes)
router.get('/reports', requireAdmin, async (_req: AuthRequest, res: Response) => {
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, grade, teacher_id')
    .order('grade')

  if (!classes || classes.length === 0) { res.json([]); return }

  const teacherIds = [...new Set(classes.map((c) => c.teacher_id))]
  const { data: teachers } = await supabase
    .from('teachers').select('id, name').in('id', teacherIds)
  const teacherMap = new Map((teachers ?? []).map((t) => [t.id, t.name]))

  const result = await Promise.all(classes.map(async (cls) => {
    const { data: sessions } = await supabase
      .from('attendance_sessions').select('id').eq('class_id', cls.id)

    const sessionIds = (sessions ?? []).map((s) => s.id)
    const { count: totalStudents } = await supabase
      .from('students').select('*', { count: 'exact', head: true }).eq('class_id', cls.id)

    if (sessionIds.length === 0) {
      return {
        class_id: cls.id, class_name: cls.name, grade: cls.grade,
        teacher_name: teacherMap.get(cls.teacher_id) ?? '-',
        total_students: totalStudents ?? 0, total_sessions: 0,
        present_rate: 0, late_rate: 0, absent_rate: 0,
      }
    }

    const { data: records } = await supabase
      .from('attendance_records').select('status').in('session_id', sessionIds)

    const total = (records ?? []).length
    const present = (records ?? []).filter((r) => r.status === 'present').length
    const late = (records ?? []).filter((r) => r.status === 'late').length
    const absent = total - present - late

    return {
      class_id: cls.id,
      class_name: cls.name,
      grade: cls.grade,
      teacher_name: teacherMap.get(cls.teacher_id) ?? '-',
      total_students: totalStudents ?? 0,
      total_sessions: sessionIds.length,
      present_rate: total ? Math.round((present / total) * 100) : 0,
      late_rate: total ? Math.round((late / total) * 100) : 0,
      absent_rate: total ? Math.round((absent / total) * 100) : 0,
    }
  }))

  res.json(result)
})

export default router
