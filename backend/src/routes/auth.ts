import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../db/supabase'

const router = Router()

router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    res.status(400).json({ message: 'Semua field wajib diisi' }); return
  }
  if (password.length < 8) {
    res.status(400).json({ message: 'Password minimal 8 karakter' }); return
  }

  const { data: existing } = await supabase.from('teachers').select('id').eq('email', email).single()
  if (existing) {
    res.status(409).json({ message: 'Email sudah terdaftar' }); return
  }

  const password_hash = await bcrypt.hash(password, 12)
  const { data, error } = await supabase
    .from('teachers')
    .insert({ name, email, password_hash })
    .select('id, name, email')
    .single()

  if (error || !data) {
    res.status(500).json({ message: 'Gagal membuat akun' }); return
  }

  const token = jwt.sign({ id: data.id, role: 'teacher' }, process.env.JWT_SECRET!, { expiresIn: '30d' })
  res.status(201).json({ token, teacher: { ...data, role: 'teacher' } })
})

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({ message: 'Email dan password wajib diisi' }); return
  }

  // Fetch core fields — role & is_active may not exist yet (before schema-phase5 migration)
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id, name, email, password_hash')
    .eq('email', email)
    .single()

  if (!teacher) {
    res.status(401).json({ message: 'Email atau password salah' }); return
  }

  const valid = await bcrypt.compare(password, teacher.password_hash)
  if (!valid) {
    res.status(401).json({ message: 'Email atau password salah' }); return
  }

  // Try to read role & is_active (available only after schema-phase5 migration)
  const { data: extended } = await supabase
    .from('teachers')
    .select('role, is_active')
    .eq('id', teacher.id)
    .single()

  const role = (extended as { role?: string } | null)?.role ?? 'teacher'
  const isActive = (extended as { is_active?: boolean } | null)?.is_active

  if (isActive === false) {
    res.status(403).json({ message: 'Akun tidak aktif. Hubungi admin sekolah.' }); return
  }

  const token = jwt.sign({ id: teacher.id, role }, process.env.JWT_SECRET!, { expiresIn: '30d' })
  const { password_hash: _, ...safeTeacher } = teacher
  res.json({ token, teacher: { ...safeTeacher, role } })
})

export default router
