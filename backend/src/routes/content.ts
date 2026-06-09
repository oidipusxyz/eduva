import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabase } from '../db/supabase'

const router = Router()
router.use(requireAuth)

router.get('/', async (req: AuthRequest, res: Response) => {
  const { class_id } = req.query
  let query = supabase.from('contents').select('*')
  if (class_id) query = query.eq('class_id', class_id as string)
  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) { res.status(500).json({ message: error.message }); return }
  res.json(data ?? [])
})

router.post('/', async (req: AuthRequest, res: Response) => {
  const { class_id, type, title, link_url, deadline } = req.body
  if (!class_id || !type || !title) {
    res.status(400).json({ message: 'class_id, type, dan title wajib diisi' }); return
  }

  const { data, error } = await supabase
    .from('contents')
    .insert({ class_id, type, title, link_url: link_url || null, deadline: deadline || null })
    .select()
    .single()

  if (error || !data) { res.status(500).json({ message: 'Gagal menyimpan konten' }); return }
  res.status(201).json(data)
})

router.put('/:id', async (req: AuthRequest, res: Response) => {
  const { title, link_url, deadline } = req.body
  const { data, error } = await supabase
    .from('contents')
    .update({ title, link_url, deadline })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error || !data) { res.status(500).json({ message: 'Gagal memperbarui konten' }); return }
  res.json(data)
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { error } = await supabase.from('contents').delete().eq('id', req.params.id)
  if (error) { res.status(500).json({ message: 'Gagal menghapus konten' }); return }
  res.status(204).send()
})

export default router
