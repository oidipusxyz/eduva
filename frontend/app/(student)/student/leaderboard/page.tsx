'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import { isStudentAuthenticated, studentFetch } from '@/lib/studentAuth'

interface LeaderboardEntry {
  student_id: string
  full_name: string
  total_points: number
  current_streak: number
  is_me: boolean
}

const RANK_COLORS = ['#D97706', '#6B7280', '#B45309']
const RANK_ICONS = ['🥇', '🥈', '🥉']

export default function StudentLeaderboardPage() {
  const router = useRouter()
  const [board, setBoard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isStudentAuthenticated()) { router.replace('/student/login'); return }
    studentFetch<LeaderboardEntry[]>('/gamification/class-leaderboard')
      .then(setBoard)
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [router])

  const myRank = board.findIndex((e) => e.is_me) + 1

  return (
    <div className="min-h-screen bg-bg-page">
      <div className="bg-bg-surface border-b border-border-default px-6 py-4 flex items-center gap-3">
        <Link href="/student/dashboard" className="text-text-muted hover:text-text-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-[15px] font-medium text-text-primary">Leaderboard Kelas</h1>
      </div>

      <div className="p-6 max-w-[480px] mx-auto">
        {loading ? (
          <div className="text-center py-16 text-text-muted text-[13px]">Memuat...</div>
        ) : board.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-[40px] mb-2">🏆</div>
            <p className="text-[13px] text-text-muted">Leaderboard belum tersedia</p>
          </div>
        ) : (
          <>
            {/* My rank summary */}
            {myRank > 0 && (
              <div className="bg-primary-muted border border-primary-border rounded-[12px] p-4 mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-primary font-medium uppercase tracking-wide">Peringkatmu</div>
                  <div className="text-[24px] font-medium text-text-primary mt-0.5">#{myRank}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-text-muted">Poin kamu</div>
                  <div className="text-[18px] font-medium text-primary">{board[myRank - 1].total_points}</div>
                </div>
              </div>
            )}

            {/* Leaderboard list */}
            <div className="flex flex-col gap-2">
              {board.map((entry, i) => {
                const rank = i + 1
                const isTop3 = rank <= 3
                return (
                  <Card
                    key={entry.student_id}
                    className={`flex items-center gap-3 ${entry.is_me ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                  >
                    <div className="w-8 text-center flex-shrink-0">
                      {isTop3 ? (
                        <span className="text-[20px]">{RANK_ICONS[rank - 1]}</span>
                      ) : (
                        <span className="text-[13px] font-medium" style={{ color: RANK_COLORS[2] || '#9CA3AF' }}>#{rank}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-medium text-text-primary truncate">{entry.full_name}</span>
                        {entry.is_me && (
                          <span className="text-[10px] bg-primary text-white rounded-full px-1.5 py-0.5 flex-shrink-0">Kamu</span>
                        )}
                      </div>
                      {entry.current_streak > 0 && (
                        <span className="text-[11px] text-text-muted">{entry.current_streak}🔥 streak</span>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[14px] font-medium text-primary">{entry.total_points}</div>
                      <div className="text-[10px] text-text-muted">poin</div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
