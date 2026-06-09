'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { isStudentAuthenticated, studentFetch } from '@/lib/studentAuth'
import { Content } from '@/lib/types'

interface ContentWithSubmission extends Content {
  submitted: boolean
  submitted_at: string | null
  on_time: boolean | null
}

export default function StudentContentPage() {
  const router = useRouter()
  const [contents, setContents] = useState<ContentWithSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'material' | 'assignment'>('all')
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [toast, setToast] = useState<{ id: string; message: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (!isStudentAuthenticated()) { router.replace('/student/login'); return }
    studentFetch<ContentWithSubmission[]>('/student/content')
      .then((data) => setContents(Array.isArray(data) ? data : []))
      .catch(() => setContents([]))
      .finally(() => setLoading(false))
  }, [router])

  const filtered = filter === 'all' ? contents : contents.filter((c) => c.type === filter)

  const isDeadlineSoon = (deadline?: string) => {
    if (!deadline) return false
    const diff = new Date(deadline).getTime() - Date.now()
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000
  }

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  }

  async function handleSubmit(contentId: string) {
    setSubmitting(contentId)
    try {
      const res = await studentFetch<{ message: string; points: number; on_time: boolean }>(
        `/student/submit/${contentId}`,
        { method: 'POST' }
      )
      setContents((prev) =>
        prev.map((c) =>
          c.id === contentId
            ? { ...c, submitted: true, submitted_at: new Date().toISOString(), on_time: res.on_time }
            : c
        )
      )
      setToast({ id: contentId, message: res.message, ok: true })
      setTimeout(() => setToast(null), 3000)
    } catch (err: unknown) {
      setToast({ id: contentId, message: err instanceof Error ? err.message : 'Gagal mengumpulkan', ok: false })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="min-h-screen bg-bg-page">
      <div className="bg-bg-surface border-b border-border-default px-6 py-4 flex items-center gap-3">
        <Link href="/student/dashboard" className="text-text-muted hover:text-text-primary transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <span className="text-[15px] font-medium text-text-primary">Materi & Tugas</span>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-[10px] text-[13px] font-medium shadow-lg transition-all ${toast.ok ? 'bg-positive-bg text-positive-text border border-positive-border' : 'bg-danger-bg text-danger-text border border-danger-border'}`}>
          {toast.message}
        </div>
      )}

      <div className="p-6 max-w-[600px] mx-auto">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {(['all', 'material', 'assignment'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'px-3 py-1.5 rounded-[20px] text-[12px] font-medium border transition-all',
                filter === f
                  ? 'bg-primary-muted border-primary-border text-positive-text'
                  : 'bg-bg-surface border-border-default text-text-muted hover:border-primary-border',
              ].join(' ')}
            >
              {f === 'all' ? 'Semua' : f === 'material' ? 'Materi' : 'Tugas'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[80px] bg-border-muted rounded-[14px] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-text-muted text-[13px]">Belum ada konten.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((item) => {
              const overdue = item.type === 'assignment' && isOverdue(item.deadline)
              const soon = item.type === 'assignment' && isDeadlineSoon(item.deadline)
              const isAssignment = item.type === 'assignment'

              return (
                <Card key={item.id}>
                  <div className="flex items-start gap-3">
                    <div className={[
                      'w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0',
                      item.type === 'material' ? 'bg-info-bg' : 'bg-warning-bg',
                    ].join(' ')}>
                      {item.type === 'material' ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[14px] font-medium text-text-primary">{item.title}</h3>
                        <Badge variant={item.type === 'material' ? 'info' : 'warning'}>
                          {item.type === 'material' ? 'Materi' : 'Tugas'}
                        </Badge>
                        {item.submitted && (
                          <Badge variant={item.on_time ? 'positive' : 'neutral'}>
                            {item.on_time ? '✓ Tepat waktu' : '✓ Terlambat'}
                          </Badge>
                        )}
                        {!item.submitted && overdue && <Badge variant="danger">Lewat Deadline</Badge>}
                        {!item.submitted && soon && !overdue && <Badge variant="warning">Segera</Badge>}
                      </div>

                      {item.deadline && (
                        <p className={['text-[12px] mt-1', overdue && !item.submitted ? 'text-danger-text' : soon && !item.submitted ? 'text-warning-text' : 'text-text-muted'].join(' ')}>
                          Deadline: {new Date(item.deadline).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      )}

                      {item.submitted && item.submitted_at && (
                        <p className="text-[11px] text-text-muted mt-0.5">
                          Dikumpulkan {new Date(item.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}

                      {item.link_url && (
                        <a
                          href={item.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[12px] text-info-text hover:underline mt-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          Buka Link
                        </a>
                      )}

                      {/* Submit button for assignments not yet submitted */}
                      {isAssignment && !item.submitted && (
                        <button
                          onClick={() => handleSubmit(item.id)}
                          disabled={submitting === item.id}
                          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-primary text-white text-[12px] font-medium hover:brightness-95 transition-all disabled:opacity-60"
                        >
                          {submitting === item.id ? (
                            <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                          Kumpul Tugas {!overdue ? '(+15 poin)' : '(+5 poin)'}
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
