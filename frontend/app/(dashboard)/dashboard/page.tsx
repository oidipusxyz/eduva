'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import PageHeader from '@/components/layout/PageHeader'
import { api } from '@/lib/api'
import { Class } from '@/lib/types'

interface Summary {
  classes_today: number
  active_assignments: number
  unresolved_alerts: number
  total_students: number
}

interface AttendanceRate {
  class_id: string
  class_name: string
  grade: string
  total_students: number
  total_sessions: number
  attendance_rate: number
}

interface ChartPoint {
  date: string
  hadir: number
  total: number
  rate: number
}

interface GradeTrend {
  subject: string
  data: { month: string; avg: number }[]
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [rates, setRates] = useState<AttendanceRate[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [attendanceChart, setAttendanceChart] = useState<ChartPoint[]>([])
  const [gradeTrends, setGradeTrends] = useState<GradeTrend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Summary>('/analytics/summary').catch(() => null),
      api.get<AttendanceRate[]>('/analytics/attendance-rates').catch(() => []),
      api.get<Class[]>('/classes').catch(() => []),
    ]).then(([s, r, c]) => {
      setSummary(s)
      setRates(Array.isArray(r) ? r : [])
      const classList = Array.isArray(c) ? c : []
      setClasses(classList)
      if (classList.length > 0) setSelectedClass(classList[0].id)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedClass) return
    Promise.all([
      api.get<ChartPoint[]>(`/analytics/attendance-chart?class_id=${selectedClass}`).catch(() => []),
      api.get<GradeTrend[]>(`/analytics/grade-trends?class_id=${selectedClass}`).catch(() => []),
    ]).then(([chart, trends]) => {
      setAttendanceChart(Array.isArray(chart) ? chart : [])
      setGradeTrends(Array.isArray(trends) ? trends : [])
    })
  }, [selectedClass])

  const statCards = [
    { label: 'Sesi Hari Ini', value: summary?.classes_today ?? 0, badge: null, icon: '✅', color: '#4CAF50' },
    { label: 'Tugas Aktif', value: summary?.active_assignments ?? 0, badge: null, icon: '📝', color: '#1D4ED8' },
    { label: 'Total Siswa', value: summary?.total_students ?? 0, badge: null, icon: '👩‍🎓', color: '#7C3AED' },
    {
      label: 'Alert Siswa', value: summary?.unresolved_alerts ?? 0,
      badge: (summary?.unresolved_alerts ?? 0) > 0 ? 'danger' as const : null,
      icon: '🔔', color: '#DC2626',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Ringkasan aktivitas kelas Anda"
        action={
          <Link href="/classes">
            <Button size="sm">+ Buat Kelas</Button>
          </Link>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <Card key={s.label} hoverable hoverColor={s.color + '80'}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-[20px]">{s.icon}</span>
              {s.badge && <Badge variant={s.badge}>Perlu Tindakan</Badge>}
            </div>
            <div className="text-[24px] font-medium text-text-primary">
              {loading ? '—' : s.value}
            </div>
            <div className="text-[12px] text-text-muted mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Alert banner */}
      {(summary?.unresolved_alerts ?? 0) > 0 && (
        <Link href="/alerts">
          <div className="bg-warning-bg border border-warning-border rounded-[14px] px-4 py-3 mb-6 flex items-center gap-3 cursor-pointer hover:brightness-95 transition-all">
            <span className="text-[18px]">⚠️</span>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-warning-text">
                {summary!.unresolved_alerts} siswa terdeteksi absen berturut-turut
              </p>
              <p className="text-[12px] text-warning-text opacity-80">Klik untuk lihat detail dan ambil tindakan</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </Link>
      )}

      {/* Class selector for charts */}
      {classes.length > 0 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls.id)}
              className={[
                'px-3 py-1.5 rounded-[20px] text-[12px] font-medium whitespace-nowrap border transition-all',
                selectedClass === cls.id
                  ? 'bg-primary-muted border-primary-border text-positive-text'
                  : 'bg-bg-surface border-border-default text-text-muted hover:border-primary-border',
              ].join(' ')}
            >
              {cls.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Attendance chart */}
        <Card>
          <h2 className="text-[14px] font-medium text-text-primary mb-4">Tren Kehadiran</h2>
          {attendanceChart.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-text-muted text-[13px]">
              Belum ada data sesi
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={attendanceChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
                  formatter={(v) => [`${v}%`, 'Kehadiran']}
                />
                <Line type="monotone" dataKey="rate" stroke="#4CAF50" strokeWidth={2} dot={{ r: 3, fill: '#4CAF50' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Grade trend chart */}
        <Card>
          <h2 className="text-[14px] font-medium text-text-primary mb-4">Perkembangan Nilai</h2>
          {gradeTrends.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-text-muted text-[13px]">
              Belum ada data nilai
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={gradeTrends[0]?.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                <Bar dataKey="avg" fill="#4CAF50" radius={[4, 4, 0, 0]} name="Rata-rata" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Attendance rates per class */}
      <h2 className="text-[14px] font-medium text-text-secondary mb-3">Kehadiran per Kelas</h2>
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-[60px] bg-border-muted rounded-[14px] animate-pulse" />)}
        </div>
      ) : rates.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-text-muted text-[13px]">Belum ada kelas.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {rates.map((r) => (
            <Card key={r.class_id} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[13px] font-medium text-text-primary">{r.class_name}</span>
                  <span className="text-[12px] text-text-muted">{r.grade}</span>
                  <Badge variant="neutral">{r.total_students} siswa</Badge>
                </div>
                <ProgressBar value={r.attendance_rate} showLabel />
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[18px] font-medium text-text-primary">{r.attendance_rate}%</div>
                <div className="text-[11px] text-text-muted">{r.total_sessions} sesi</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
