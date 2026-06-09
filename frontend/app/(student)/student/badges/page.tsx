'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import { isStudentAuthenticated, studentFetch } from '@/lib/studentAuth'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  condition_type: string
  condition_value: number
  earned: boolean
  earned_at: string | null
}

export default function StudentBadgesPage() {
  const router = useRouter()
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isStudentAuthenticated()) { router.replace('/student/login'); return }
    studentFetch<Badge[]>('/gamification/badges')
      .then((data) => setBadges(data))
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [router])

  const earned = badges.filter((b) => b.earned)
  const locked = badges.filter((b) => !b.earned)

  return (
    <div className="min-h-screen bg-bg-page">
      <div className="bg-bg-surface border-b border-border-default px-6 py-4 flex items-center gap-3">
        <Link href="/student/dashboard" className="text-text-muted hover:text-text-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-[15px] font-medium text-text-primary">Badge Saya</h1>
      </div>

      <div className="p-6 max-w-[480px] mx-auto">
        {loading ? (
          <div className="text-center py-16 text-text-muted text-[13px]">Memuat...</div>
        ) : (
          <>
            {earned.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[12px] font-medium text-text-secondary uppercase tracking-wide">Diraih ({earned.length})</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {earned.map((badge) => (
                    <Card key={badge.id} className="text-center py-4 px-3">
                      <div className="text-[36px] mb-2">{badge.icon}</div>
                      <div className="text-[13px] font-medium text-text-primary">{badge.name}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">{badge.description}</div>
                      {badge.earned_at && (
                        <div className="text-[10px] text-positive-text mt-1.5 bg-positive-bg rounded-full px-2 py-0.5 inline-block">
                          {new Date(badge.earned_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {earned.length === 0 && (
              <div className="text-center py-8 mb-6">
                <div className="text-[40px] mb-2">🎖️</div>
                <p className="text-[13px] text-text-muted">Belum ada badge yang diraih</p>
                <p className="text-[12px] text-text-muted mt-1">Rajin hadir untuk mendapatkan badge pertamamu!</p>
              </div>
            )}

            {locked.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[12px] font-medium text-text-secondary uppercase tracking-wide">Terkunci ({locked.length})</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {locked.map((badge) => (
                    <Card key={badge.id} className="text-center py-4 px-3 opacity-50">
                      <div className="text-[36px] mb-2 grayscale filter">{badge.icon}</div>
                      <div className="text-[13px] font-medium text-text-secondary">{badge.name}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">{badge.description}</div>
                      <div className="text-[10px] text-text-muted mt-1.5">
                        {badge.condition_type === 'streak' ? `${badge.condition_value} hari berturut-turut` : `${badge.condition_value} poin`}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
