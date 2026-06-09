import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabase } from '../db/supabase'

const router = Router()
router.use(requireAuth)

router.get('/', async (req: AuthRequest, res: Response) => {
  const { class_id, month } = req.query
  let query = supabase
    .from('teaching_journals')
    .select('*, classes(name, grade)')
    .eq('teacher_id', req.teacherId!)
    .order('session_date', { ascending: false })

  if (class_id) query = query.eq('class_id', class_id as string)
  if (month) {
    const [year, m] = (month as string).split('-')
    const start = `${year}-${m}-01`
    const end = new Date(Number(year), Number(m), 0).toISOString().split('T')[0]
    query = query.gte('session_date', start).lte('session_date', end)
  }

  const { data, error } = await query
  if (error) { res.status(500).json({ message: error.message }); return }
  res.json(data ?? [])
})

router.post('/', async (req: AuthRequest, res: Response) => {
  const { class_id, session_date, topic, activity_notes } = req.body
  if (!class_id || !session_date || !topic) {
    res.status(400).json({ message: 'class_id, session_date, dan topic wajib diisi' }); return
  }

  const { data, error } = await supabase
    .from('teaching_journals')
    .insert({ teacher_id: req.teacherId!, class_id, session_date, topic, activity_notes })
    .select('*, classes(name, grade)')
    .single()

  if (error || !data) { res.status(500).json({ message: 'Gagal menyimpan jurnal' }); return }
  res.status(201).json(data)
})

router.put('/:id', async (req: AuthRequest, res: Response) => {
  const { topic, activity_notes, session_date } = req.body
  const { data, error } = await supabase
    .from('teaching_journals')
    .update({ topic, activity_notes, session_date })
    .eq('id', req.params.id)
    .eq('teacher_id', req.teacherId!)
    .select()
    .single()

  if (error || !data) { res.status(500).json({ message: 'Gagal memperbarui jurnal' }); return }
  res.json(data)
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { error } = await supabase
    .from('teaching_journals')
    .delete()
    .eq('id', req.params.id)
    .eq('teacher_id', req.teacherId!)

  if (error) { res.status(500).json({ message: 'Gagal menghapus jurnal' }); return }
  res.status(204).send()
})

export default router
