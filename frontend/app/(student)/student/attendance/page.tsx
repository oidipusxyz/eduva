'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import 'react-calendar-heatmap/dist/styles.css'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { isStudentAuthenticated, studentFetch } from '@/lib/studentAuth'

const CalendarHeatmap = dynamic(() => import('react-calendar-heatmap'), { ssr: false })
const QrScanner = dynamic(() => import('@/components/ui/QrScanner'), { ssr: false })

type Tab = 'input' | 'history'

interface AttendanceRecord {
  id: string
  status: string
  created_at: string
  attendance_sessions: { created_at: string } | null
}

export default function StudentAttendancePage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('input')

  // Input tab state
  const [pin, setPin] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [showScanner, setShowScanner] = useState(false)

  // History tab state
  const [history, setHistory] = useState<AttendanceRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (!isStudentAuthenticated()) router.replace('/student/login')
  }, [router])

  useEffect(() => {
    if (tab !== 'history') return
    setLoadingHistory(true)
    studentFetch<AttendanceRecord[]>('/student/attendance/history')
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => null)
      .finally(() => setLoadingHistory(false))
  }, [tab])

  async function submitPin(pinValue: string) {
    setSubmitting(true)
    setResult(null)
    try {
      const res = await studentFetch<{ message: string }>('/student/attendance', {
        method: 'POST',
        body: JSON.stringify({ pin: pinValue.trim() }),
      })
      setResult({ ok: true, message: res.message })
      setPin('')
    } catch (err: unknown) {
      setResult({ ok: false, message: err instanceof Error ? err.message : 'Gagal mencatat absensi' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pin.trim()) return
    submitPin(pin)
  }

  function handleScan(value: string) {
    setShowScanner(false)
    submitPin(value)
  }

  const heatmapValues = history.map((r) => ({
    date: (r.attendance_sessions?.created_at ?? r.created_at).split('T')[0],
    status: r.status,
  }))

  function classForValue(value: { status?: string } | undefined) {
    if (!value) return 'color-empty'
    if (value.status === 'present') return 'heatmap-present'
    if (value.status === 'late') return 'heatmap-late'
    if (value.status === 'excused') return 'heatmap-excused'
    return 'color-empty'
  }

  const today = new Date()
  const startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1)

  const statusLabel: Record<string, string> = { present: 'Hadir', late: 'Terlambat', excused: 'Izin', absent: 'Absen' }
  const statusClass: Record<string, string> = {
    present: 'text-positive-text bg-positive-bg',
    late: 'text-warning-text bg-warning-bg',
    excused: 'text-info-text bg-info-bg',
    absent: 'text-danger-text bg-danger-bg',
  }

  return (
    <div className="min-h-screen bg-bg-page">
      <div className="bg-bg-surface border-b border-border-default px-6 py-4 flex items-center gap-3">
        <Link href="/student/dashboard" className="text-text-muted hover:text-text-primary transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <span className="text-[15px] font-medium text-text-primary">Absensi</span>
      </div>

      <div className="p-6 max-w-[480px] mx-auto">
        {/* Tabs */}
        <div className="flex gap-1 bg-bg-subtle border border-border-default rounded-[10px] p-0.5 mb-5">
          {(['input', 'history'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors ${tab === t ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-muted'}`}
            >
              {t === 'input' ? 'Input PIN' : 'Riwayat'}
            </button>
          ))}
        </div>

        {tab === 'input' && (
          <div className="max-w-[340px] mx-auto pt-4">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-primary-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <h1 className="text-[18px] font-medium text-text-primary">Input PIN Absensi</h1>
              <p className="text-[12px] text-text-muted mt-1">Masukkan PIN dari guru kamu</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="_ _ _ _ _ _"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, '').slice(0, 6))
                  setResult(null)
                }}
                className="w-full text-center text-[32px] font-medium tracking-[0.5em] bg-bg-subtle border border-border-default rounded-[14px] px-4 py-5 outline-none focus:border-primary transition-colors text-text-primary"
              />

              {result && (
                <div className={`rounded-[10px] px-4 py-3 text-[13px] text-center ${result.ok ? 'bg-positive-bg text-positive-text border border-positive-border' : 'bg-danger-bg text-danger-text border border-danger-border'}`}>
                  {result.message}
                </div>
              )}

              <Button
                type="submit"
                loading={submitting}
                disabled={pin.length !== 6}
                className="w-full"
              >
                Absen Sekarang
              </Button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-border-default" />
                <span className="text-[11px] text-text-muted">atau</span>
                <div className="flex-1 h-px bg-border-default" />
              </div>

              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="w-full h-11 rounded-[12px] border border-border-default flex items-center justify-center gap-2 text-[13px] text-text-secondary hover:border-primary hover:text-primary transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="5" height="5" rx="0.5" /><rect x="16" y="3" width="5" height="5" rx="0.5" /><rect x="3" y="16" width="5" height="5" rx="0.5" />
                  <line x1="16" y1="16" x2="16" y2="21" /><line x1="16" y1="16" x2="21" y2="16" /><line x1="21" y1="21" x2="21" y2="16" /><line x1="21" y1="21" x2="16" y2="21" />
                </svg>
                Scan QR Code
              </button>
            </form>
          </div>
        )}

        {showScanner && (
          <QrScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
        )}

        {tab === 'history' && (
          <>
            <Card className="mb-4">
              <h2 className="text-[13px] font-medium text-text-secondary mb-3">Pola Kehadiran 6 Bulan</h2>
              {loadingHistory ? (
                <div className="text-center py-4 text-text-muted text-[12px]">Memuat...</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <style>{`
                      .color-empty { fill: #F3F4F6; }
                      .heatmap-present { fill: #16A34A; }
                      .heatmap-late { fill: #F59E0B; }
                      .heatmap-excused { fill: #93C5FD; }
                      .react-calendar-heatmap text { fill: #9CA3AF; font-size: 8px; }
                    `}</style>
                    <CalendarHeatmap
                      startDate={startDate}
                      endDate={today}
                      values={heatmapValues}
                      classForValue={classForValue as (v: unknown) => string}
                      showWeekdayLabels
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {[
                      { color: '#16A34A', label: 'Hadir' },
                      { color: '#F59E0B', label: 'Terlambat' },
                      { color: '#93C5FD', label: 'Izin' },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: l.color }} />
                        <span className="text-[10px] text-text-muted">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

            <div className="flex flex-col gap-2">
              {!loadingHistory && history.length === 0 && (
                <div className="text-center py-8 text-text-muted text-[13px]">Belum ada riwayat absensi.</div>
              )}
              {history.map((r) => (
                <Card key={r.id} className="flex items-center justify-between">
                  <span className="text-[13px] text-text-primary">
                    {new Date(r.attendance_sessions?.created_at ?? r.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                  <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 ${statusClass[r.status] ?? 'text-text-muted bg-bg-subtle'}`}>
                    {statusLabel[r.status] ?? r.status}
                  </span>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
