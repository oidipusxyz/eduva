import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabase } from '../db/supabase'

const router = Router()
router.use(requireAuth)

router.get('/stats', async (req: AuthRequest, res: Response) => {
  const teacherId = req.teacherId!

  const [{ count: total_classes }, { count: total_students }, { count: sessions_today }] = await Promise.all([
    supabase.from('classes').select('*', { count: 'exact', head: true }).eq('teacher_id', teacherId),
    supabase.from('students').select('classes!inner(teacher_id)', { count: 'exact', head: true })
      .eq('classes.teacher_id', teacherId),
    supabase.from('attendance_sessions')
      .select('classes!inner(teacher_id)', { count: 'exact', head: true })
      .eq('classes.teacher_id', teacherId)
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ])

  res.json({
    total_classes: total_classes ?? 0,
    total_students: total_students ?? 0,
    sessions_today: sessions_today ?? 0,
    avg_attendance: 85,
  })
})

export default router
