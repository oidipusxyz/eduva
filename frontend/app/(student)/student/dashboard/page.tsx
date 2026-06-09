'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import { getStudentToken, parseStudentJwt, isStudentAuthenticated, studentFetch } from '@/lib/studentAuth'

interface Stats {
  total_points: number
  streak: { current_streak: number; longest_streak: number }
  badges: { id: string; name: string; icon: string }[]
}

export default function StudentDashboardPage() {
  const router = useRouter()
  const [student, setStudent] = useState<{ id: string; full_name: string } | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    if (!isStudentAuthenticated()) { router.replace('/student/login'); return }
    const token = getStudentToken()!
    const payload = parseStudentJwt(token)
    setStudent(payload)

    studentFetch<Stats>('/gamification/my-stats')
      .then(setStats)
      .catch(() => null)
  }, [router])

  if (!student) return null

  const menuItems = [
    { href: '/student/attendance', label: 'Input Absensi', desc: 'Masukkan PIN dari guru', icon: '✅', color: '#4CAF50', bg: '#F0FDF4' },
    { href: '/student/content', label: 'Materi & Tugas', desc: 'Lihat materi dan tugas', icon: '📚', color: '#1D4ED8', bg: '#EFF6FF' },
    { href: '/student/leaderboard', label: 'Leaderboard', desc: 'Peringkat kehadiran kelas', icon: '🏆', color: '#D97706', bg: '#FFFBEB' },
    { href: '/student/badges', label: 'Badge Saya', desc: 'Pencapaian yang kamu raih', icon: '🎖️', color: '#7C3AED', bg: '#F5F3FF' },
  ]

  return (
    <div className="min-h-screen bg-bg-page">
      <div className="bg-bg-surface border-b border-border-default px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[8px] bg-primary flex items-center justify-center">
            <span className="text-white text-[13px] font-medium">E</span>
          </div>
          <span className="text-[15px] font-medium text-text-primary">Eduva Siswa</span>
        </div>
        <button
          onClick={() => { localStorage.removeItem('student_token'); router.push('/student/login') }}
          className="text-[12px] text-text-muted hover:text-danger-text transition-colors"
        >
          Keluar
        </button>
      </div>

      <div className="p-6 max-w-[480px] mx-auto">
        {/* Greeting */}
        <div className="mb-5">
          <h1 className="text-[20px] font-medium text-text-primary">Halo! 👋</h1>
          <p className="text-[13px] text-text-muted mt-0.5">Selamat datang di Eduva</p>
        </div>

        {/* Gamification stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <Card className="text-center py-3 px-2">
              <div className="text-[22px] font-medium text-primary">{stats.total_points}</div>
              <div className="text-[11px] text-text-muted">Poin</div>
            </Card>
            <Card className="text-center py-3 px-2">
              <div className="text-[22px] font-medium text-warning-text">
                {stats.streak.current_streak}🔥
              </div>
              <div className="text-[11px] text-text-muted">Streak</div>
            </Card>
            <Card className="text-center py-3 px-2">
              <div className="text-[22px] font-medium text-[#7C3AED]">{stats.badges.length}</div>
              <div className="text-[11px] text-text-muted">Badge</div>
            </Card>
          </div>
        )}

        {/* Earned badges preview */}
        {stats && stats.badges.length > 0 && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {stats.badges.map((b) => (
              <div key={b.id} className="flex-shrink-0 bg-positive-bg border border-positive-border rounded-[20px] px-3 py-1 flex items-center gap-1.5">
                <span className="text-[14px]">{b.icon}</span>
                <span className="text-[11px] font-medium text-positive-text">{b.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Menu */}
        <div className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card hoverable hoverColor={item.color} className="cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0 text-[22px]" style={{ backgroundColor: item.bg }}>
                    {item.icon}
                  </div>
                  <div>
                    <h2 className="text-[15px] font-medium text-text-primary">{item.label}</h2>
                    <p className="text-[12px] text-text-muted mt-0.5">{item.desc}</p>
                  </div>
                  <svg className="ml-auto text-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
