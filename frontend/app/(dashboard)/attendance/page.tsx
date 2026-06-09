'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/layout/PageHeader'
import { api } from '@/lib/api'
import { Class, AttendanceSession } from '@/lib/types'

export default function AttendancePage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null)
  const [duration, setDuration] = useState(15)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showQR, setShowQR] = useState(false)

  const fetchSessions = useCallback(async (classId: string) => {
    try {
      const data = await api.get<AttendanceSession[]>(`/attendance/sessions?class_id=${classId}`)
      setSessions(Array.isArray(data) ? data : [])
    } catch {
      setSessions([])
    }
  }, [])

  useEffect(() => {
    api.get<Class[]>('/classes').then((data) => {
      const list = Array.isArray(data) ? data : []
      setClasses(list)
      if (list.length > 0) {
        setSelectedClass(list[0].id)
        fetchSessions(list[0].id)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [fetchSessions])

  useEffect(() => {
    if (!selectedClass) return
    fetchSessions(selectedClass)
  }, [selectedClass, fetchSessions])

  // countdown timer
  useEffect(() => {
    if (!activeSession) return
    const update = () => {
      const left = Math.max(0, Math.floor((new Date(activeSession.expires_at).getTime() - Date.now()) / 1000))
      setTimeLeft(left)
      if (left === 0) setActiveSession(null)
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [activeSession])

  async function handleStartSession() {
    if (!selectedClass) return
    setStarting(true)
    try {
      const session = await api.post<AttendanceSession>('/attendance/sessions', {
        class_id: selectedClass,
        duration_minutes: duration,
      })
      setActiveSession(session)
      fetchSessions(selectedClass)
    } catch {
      alert('Gagal membuka sesi absensi')
    } finally {
      setStarting(false)
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const selectedClassName = classes.find((c) => c.id === selectedClass)?.name

  return (
    <div>
      <PageHeader title="Absensi" subtitle="Kelola sesi absensi kelas" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Create session */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <h2 className="text-[14px] font-medium text-text-primary mb-4">Buka Sesi Absensi</h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[12px] font-medium text-text-secondary block mb-1.5">Kelas</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-bg-subtle border border-border-default rounded-[10px] px-3 py-2 text-[13px] text-text-primary outline-none focus:border-primary transition-colors"
                >
                  {loading ? (
                    <option>Memuat...</option>
                  ) : classes.length === 0 ? (
                    <option value="">Belum ada kelas</option>
                  ) : (
                    classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} — {c.grade}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-[12px] font-medium text-text-secondary block mb-1.5">
                  Durasi PIN: <span className="text-primary">{duration} menit</span>
                </label>
                <input
                  type="range"
                  min={5} max={60} step={5}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[11px] text-text-muted mt-1">
                  <span>5 menit</span><span>60 menit</span>
                </div>
              </div>

              <Button
                onClick={handleStartSession}
                loading={starting}
                disabled={!selectedClass || !!activeSession}
                className="w-full mt-1"
              >
                Buka Sesi
              </Button>
            </div>
          </Card>

          {/* Active session PIN + QR card */}
          {activeSession && (
            <Card className="bg-primary-muted border-primary-border text-center">
              <p className="text-[12px] text-positive-text mb-2">Sesi aktif — {selectedClassName}</p>

              {/* Toggle */}
              <div className="flex gap-1 bg-white/40 rounded-[8px] p-0.5 mb-3 mx-auto w-fit">
                <button
                  onClick={() => setShowQR(false)}
                  className={`px-3 py-1 rounded-[6px] text-[12px] font-medium transition-colors ${!showQR ? 'bg-white text-positive-text shadow-sm' : 'text-positive-text/70'}`}
                >
                  PIN
                </button>
                <button
                  onClick={() => setShowQR(true)}
                  className={`px-3 py-1 rounded-[6px] text-[12px] font-medium transition-colors ${showQR ? 'bg-white text-positive-text shadow-sm' : 'text-positive-text/70'}`}
                >
                  QR Code
                </button>
              </div>

              {showQR ? (
                <div className="flex justify-center my-3">
                  <div className="bg-white rounded-[8px] p-3">
                    <QRCode value={activeSession.pin} size={160} />
                  </div>
                </div>
              ) : (
                <div className="text-[42px] font-medium text-positive-text tracking-[0.3em] my-3">
                  {activeSession.pin}
                </div>
              )}

              <p className="text-[13px] text-positive-text">Berakhir dalam {formatTime(timeLeft)}</p>
            </Card>
          )}
        </div>

        {/* Right: Session history */}
        <div className="lg:col-span-2">
          <h2 className="text-[14px] font-medium text-text-secondary mb-3">Riwayat Sesi</h2>
          {sessions.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-text-muted text-[13px]">Belum ada sesi untuk kelas ini.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map((session) => {
                const expired = new Date(session.expires_at) < new Date()
                const present = session.present_count ?? 0
                const total = session.total_count ?? 0
                return (
                  <Link key={session.id} href={`/attendance/${session.id}`}>
                    <Card hoverable className="flex items-center gap-4 cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[14px] font-medium text-text-primary font-mono tracking-wider">
                            {session.pin}
                          </span>
                          <Badge variant={expired ? 'neutral' : 'positive'}>
                            {expired ? 'Selesai' : 'Aktif'}
                          </Badge>
                        </div>
                        <p className="text-[12px] text-text-muted">
                          {new Date(session.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-[20px] font-medium text-text-primary">{present}</div>
                        <div className="text-[11px] text-text-muted">dari {total} siswa</div>
                      </div>
                      <svg className="text-text-muted flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
