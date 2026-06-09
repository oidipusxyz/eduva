import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabase } from '../db/supabase'

const router = Router()
router.use(requireAuth)

router.get('/', async (req: AuthRequest, res: Response) => {
  const { class_id, student_id } = req.query
  let query = supabase.from('grades').select('*, students(full_name)')
  if (class_id) query = query.eq('class_id', class_id as string)
  if (student_id) query = query.eq('student_id', student_id as string)
  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) { res.status(500).json({ message: error.message }); return }
  res.json(data ?? [])
})

router.post('/bulk', async (req: AuthRequest, res: Response) => {
  const { class_id, subject, grades } = req.body
  if (!class_id || !subject || !Array.isArray(grades) || grades.length === 0) {
    res.status(400).json({ message: 'class_id, subject, dan grades wajib diisi' }); return
  }

  const records = grades.map((g: { student_id: string; score: number }) => ({
    student_id: g.student_id,
    class_id,
    subject,
    score: g.score,
  }))

  const { data, error } = await supabase
    .from('grades')
    .upsert(records, { onConflict: 'student_id,class_id,subject' })
    .select()

  if (error) { res.status(500).json({ message: 'Gagal menyimpan nilai' }); return }
  res.status(201).json(data)
})

router.put('/:id', async (req: AuthRequest, res: Response) => {
  const { score } = req.body
  const { data, error } = await supabase
    .from('grades')
    .update({ score })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error || !data) { res.status(500).json({ message: 'Gagal memperbarui nilai' }); return }
  res.json(data)
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { error } = await supabase.from('grades').delete().eq('id', req.params.id)
  if (error) { res.status(500).json({ message: 'Gagal menghapus nilai' }); return }
  res.status(204).send()
})

export default router
