import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabase } from '../db/supabase'
import bcrypt from 'bcryptjs'

const router = Router()
router.use(requireAuth)

router.get('/', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('classes')
    .select('*, students(count)')
    .eq('teacher_id', req.teacherId!)
    .order('created_at', { ascending: false })

  if (error) { res.status(500).json({ message: error.message }); return }

  const classes = (data ?? []).map((c: Record<string, unknown>) => ({
    ...c,
    student_count: Array.isArray(c.students) ? (c.students[0] as { count: number })?.count ?? 0 : 0,
    students: undefined,
  }))
  res.json(classes)
})

router.post('/', async (req: AuthRequest, res: Response) => {
  const { name, grade } = req.body
  if (!name || !grade) { res.status(400).json({ message: 'Nama dan kelas wajib diisi' }); return }

  const { data, error } = await supabase
    .from('classes')
    .insert({ teacher_id: req.teacherId!, name, grade })
    .select()
    .single()

  if (error || !data) { res.status(500).json({ message: 'Gagal membuat kelas' }); return }
  res.status(201).json(data)
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', req.params.id)
    .eq('teacher_id', req.teacherId!)
    .single()

  if (error || !data) { res.status(404).json({ message: 'Kelas tidak ditemukan' }); return }
  res.json(data)
})

router.put('/:id', async (req: AuthRequest, res: Response) => {
  const { name, grade } = req.body
  const { data, error } = await supabase
    .from('classes')
    .update({ name, grade })
    .eq('id', req.params.id)
    .eq('teacher_id', req.teacherId!)
    .select()
    .single()

  if (error || !data) { res.status(500).json({ message: 'Gagal memperbarui kelas' }); return }
  res.json(data)
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', req.params.id)
    .eq('teacher_id', req.teacherId!)

  if (error) { res.status(500).json({ message: error.message, code: error.code }); return }
  res.status(204).send()
})

// Students in class
router.get('/:id/students', async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('students')
    .select('id, full_name, username, created_at')
    .eq('class_id', req.params.id)
    .order('full_name')

  if (error) { res.status(500).json({ message: error.message }); return }
  res.json(data ?? [])
})

router.post('/:id/students', async (req: AuthRequest, res: Response) => {
  const { full_name } = req.body
  if (!full_name) { res.status(400).json({ message: 'Nama lengkap wajib diisi' }); return }

  // Generate username from name
  const base = full_name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)
  const suffix = Math.floor(1000 + Math.random() * 9000)
  const username = `${base}${suffix}`
  const default_password = `edu${suffix}`
  const password_hash = await bcrypt.hash(default_password, 10)

  const { data, error } = await supabase
    .from('students')
    .insert({ class_id: req.params.id, full_name, username, password_hash })
    .select('id, full_name, username, created_at')
    .single()

  if (error || !data) { res.status(500).json({ message: 'Gagal menambah siswa' }); return }
  res.status(201).json({ ...data, default_password })
})

router.delete('/:id/students/:studentId', async (req: AuthRequest, res: Response) => {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', req.params.studentId)
    .eq('class_id', req.params.id)

  if (error) { res.status(500).json({ message: 'Gagal menghapus siswa' }); return }
  res.status(204).send()
})

export default router
