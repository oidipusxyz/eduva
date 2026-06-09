import { Router, Response, Request } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabase } from '../db/supabase'
import jwt from 'jsonwebtoken'

const router = Router()

const POINTS = { attendance: 10, late: 5 }

// Award points + update streak after attendance recorded
export async function processAttendance(studentId: string, classId: string, status: string) {
  const pts = status === 'present' ? POINTS.attendance : status === 'late' ? POINTS.late : 0

  if (pts > 0) {
    await supabase.from('student_points').insert({
      student_id: studentId, class_id: classId, points: pts, source: 'attendance',
    })
  }

  // Update streak
  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('attendance_streaks')
    .select('*')
    .eq('student_id', studentId)
    .eq('class_id', classId)
    .single()

  if (status === 'present' || status === 'late') {
    if (!existing) {
      await supabase.from('attendance_streaks').insert({
        student_id: studentId, class_id: classId,
        current_streak: 1, longest_streak: 1, last_updated: today,
      })
    } else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const newStreak = existing.last_updated === yesterday ? existing.current_streak + 1 : 1
      const longestStreak = Math.max(newStreak, existing.longest_streak)
      await supabase.from('attendance_streaks').update({
        current_streak: newStreak, longest_streak: longestStreak, last_updated: today,
      }).eq('id', existing.id)
    }
  } else {
    if (existing && existing.last_updated !== today) {
      await supabase.from('attendance_streaks').update({ current_streak: 0 }).eq('id', existing.id)
    }
  }

  // Check badge eligibility
  await checkBadges(studentId, classId)
}

async function checkBadges(studentId: string, classId: string) {
  const [{ data: streak }, { data: pointRows }, { data: allBadges }, { data: earned }] = await Promise.all([
    supabase.from('attendance_streaks').select('current_streak').eq('student_id', studentId).eq('class_id', classId).single(),
    supabase.from('student_points').select('points').eq('student_id', studentId).eq('class_id', classId),
    supabase.from('badges').select('*'),
    supabase.from('student_badges').select('badge_id').eq('student_id', studentId),
  ])

  const totalPoints = (pointRows ?? []).reduce((s, r) => s + r.points, 0)
  const currentStreak = streak?.current_streak ?? 0
  const earnedIds = new Set((earned ?? []).map((e) => e.badge_id))

  for (const badge of (allBadges ?? [])) {
    if (earnedIds.has(badge.id)) continue
    const qualifies =
      (badge.condition_type === 'streak' && currentStreak >= badge.condition_value) ||
      (badge.condition_type === 'points' && totalPoints >= badge.condition_value)
    if (qualifies) {
      await supabase.from('student_badges').insert({ student_id: studentId, badge_id: badge.id })
    }
  }
}

// Leaderboard per class (teacher view)
router.get('/leaderboard/:classId', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data: students } = await supabase
    .from('students').select('id, full_name').eq('class_id', req.params.classId)

  if (!students || students.length === 0) { res.json([]); return }

  const leaderboard = await Promise.all(students.map(async (s) => {
    const [{ data: pts }, { data: streak }] = await Promise.all([
      supabase.from('student_points').select('points').eq('student_id', s.id).eq('class_id', req.params.classId),
      supabase.from('attendance_streaks').select('current_streak, longest_streak').eq('student_id', s.id).eq('class_id', req.params.classId).single(),
    ])
    const total = (pts ?? []).reduce((sum, r) => sum + r.points, 0)
    return {
      student_id: s.id,
      full_name: s.full_name,
      total_points: total,
      current_streak: streak?.current_streak ?? 0,
      longest_streak: streak?.longest_streak ?? 0,
    }
  }))

  leaderboard.sort((a, b) => b.total_points - a.total_points)
  res.json(leaderboard)
})

// Student's own stats (student token)
router.get('/my-stats', async (req: Request, res: Response) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ message: 'Unauthorized' }); return }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { id: string; class_id: string; role: string }
    if (payload.role !== 'student') { res.status(403).json({ message: 'Forbidden' }); return }

    const [{ data: pts }, { data: streak }, { data: earnedBadges }] = await Promise.all([
      supabase.from('student_points').select('points, source, earned_at').eq('student_id', payload.id).eq('class_id', payload.class_id).order('earned_at', { ascending: false }).limit(20),
      supabase.from('attendance_streaks').select('*').eq('student_id', payload.id).eq('class_id', payload.class_id).single(),
      supabase.from('student_badges').select('*, badges(*)').eq('student_id', payload.id),
    ])

    const totalPoints = (pts ?? []).reduce((s, r) => s + r.points, 0)
    res.json({
      total_points: totalPoints,
      recent_points: pts ?? [],
      streak: streak ?? { current_streak: 0, longest_streak: 0 },
      badges: (earnedBadges ?? []).map((eb) => eb.badges),
    })
  } catch {
    res.status(401).json({ message: 'Token tidak valid' })
  }
})

// Student leaderboard (student token — same class)
router.get('/class-leaderboard', async (req: Request, res: Response) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ message: 'Unauthorized' }); return }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { id: string; class_id: string; role: string }
    if (payload.role !== 'student') { res.status(403).json({ message: 'Forbidden' }); return }

    const { data: students } = await supabase
      .from('students').select('id, full_name').eq('class_id', payload.class_id)

    if (!students || students.length === 0) { res.json([]); return }

    const board = await Promise.all(students.map(async (s) => {
      const [{ data: pts }, { data: streak }] = await Promise.all([
        supabase.from('student_points').select('points').eq('student_id', s.id).eq('class_id', payload.class_id),
        supabase.from('attendance_streaks').select('current_streak').eq('student_id', s.id).eq('class_id', payload.class_id).single(),
      ])
      return {
        student_id: s.id,
        full_name: s.full_name,
        total_points: (pts ?? []).reduce((sum, r) => sum + r.points, 0),
        current_streak: streak?.current_streak ?? 0,
        is_me: s.id === payload.id,
      }
    }))

    board.sort((a, b) => b.total_points - a.total_points)
    res.json(board)
  } catch {
    res.status(401).json({ message: 'Token tidak valid' })
  }
})

// All badges (with student earned status)
router.get('/badges', async (req: Request, res: Response) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ message: 'Unauthorized' }); return }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { id: string; role: string }
    const [{ data: allBadges }, { data: earned }] = await Promise.all([
      supabase.from('badges').select('*'),
      supabase.from('student_badges').select('badge_id, earned_at').eq('student_id', payload.id),
    ])
    const earnedMap = new Map((earned ?? []).map((e) => [e.badge_id, e.earned_at]))
    res.json((allBadges ?? []).map((b) => ({
      ...b,
      earned: earnedMap.has(b.id),
      earned_at: earnedMap.get(b.id) ?? null,
    })))
  } catch {
    res.status(401).json({ message: 'Token tidak valid' })
  }
})

// Heatmap data per student (teacher view)
router.get('/heatmap/:studentId', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data: records } = await supabase
    .from('attendance_records')
    .select('status, attendance_sessions(created_at)')
    .eq('student_id', req.params.studentId)

  const heatmap = (records ?? []).map((r) => {
    const sessions = r.attendance_sessions as unknown
    const session = Array.isArray(sessions) ? sessions[0] as { created_at: string } | undefined : sessions as { created_at: string } | null
    return {
      date: session?.created_at?.split('T')[0] ?? null,
      status: r.status,
    }
  }).filter((r) => r.date)

  res.json(heatmap)
})

// Heatmap data per class (teacher view)
router.get('/heatmap-class/:classId', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data: sessions } = await supabase
    .from('attendance_sessions')
    .select('id, created_at')
    .eq('class_id', req.params.classId)
    .order('created_at')

  if (!sessions || sessions.length === 0) { res.json([]); return }

  const sessionIds = sessions.map((s) => s.id)
  const { data: records } = await supabase
    .from('attendance_records')
    .select('session_id, status')
    .in('session_id', sessionIds)

  const { count: totalStudents } = await supabase
    .from('students').select('*', { count: 'exact', head: true }).eq('class_id', req.params.classId)

  const result = sessions.map((s) => {
    const recs = (records ?? []).filter((r) => r.session_id === s.id)
    const present = recs.filter((r) => r.status === 'present' || r.status === 'late').length
    return {
      date: s.created_at.split('T')[0],
      count: present,
      total: totalStudents ?? 0,
      rate: totalStudents ? Math.round((present / totalStudents) * 100) : 0,
    }
  })

  res.json(result)
})

export default router
