'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/layout/PageHeader'
import { api } from '@/lib/api'

interface Overview {
  total_teachers: number
  total_classes: number
  total_students: number
  total_sessions: number
  attendance_rate_30d: number
  unresolved_alerts: number
}

interface ClassReport {
  class_id: string
  class_name: string
  grade: string
  teacher_name: string
  total_students: number
  total_sessions: number
  present_rate: number
  absent_rate: number
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [classes, setClasses] = useState<ClassReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Overview>('/admin/overview'),
      api.get<ClassReport[]>('/admin/reports'),
    ]).then(([ov, cls]) => {
      setOverview(ov)
      setClasses(Array.isArray(cls) ? cls : [])
    }).catch(() => null).finally(() => setLoading(false))
  }, [])

  const stats = overview ? [
    { label: 'Total Guru', value: overview.total_teachers, color: '#1D4ED8', bg: '#EFF6FF' },
    { label: 'Total Kelas', value: overview.total_classes, color: '#4CAF50', bg: '#F0FDF4' },
    { label: 'Total Siswa', value: overview.total_students, color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Kehadiran 30 Hari', value: `${overview.attendance_rate_30d}%`, color: '#D97706', bg: '#FFFBEB' },
  ] : []

  return (
    <div>
      <PageHeader title="Overview Sekolah" subtitle="Ringkasan performa seluruh kelas" />

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-border-muted rounded-[14px] animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Alert banner */}
          {overview && overview.unresolved_alerts > 0 && (
            <div className="bg-warning-bg border border-warning-border rounded-[12px] px-4 py-3 flex items-center gap-3 mb-5 text-[13px] text-warning-text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Ada <strong className="mx-1">{overview.unresolved_alerts}</strong> siswa dengan alert kehadiran yang belum ditangani di seluruh kelas.
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((s) => (
              <Card key={s.label} hoverable hoverColor={s.color}>
                <div className="text-[24px] font-medium" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[12px] text-text-muted mt-1">{s.label}</div>
              </Card>
            ))}
          </div>

          {/* Classes table */}
          <Card>
            <h2 className="text-[14px] font-medium text-text-primary mb-4">Performa Per Kelas</h2>
            {classes.length === 0 ? (
              <p className="text-[13px] text-text-muted text-center py-6">Belum ada data kelas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border-default">
                      {['Kelas', 'Tingkat', 'Guru', 'Siswa', 'Sesi', 'Hadir', 'Absen'].map((h) => (
                        <th key={h} className="text-left py-2 pr-4 text-text-muted font-medium text-[11px] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((cls) => (
                      <tr key={cls.class_id} className="border-b border-border-muted last:border-0">
                        <td className="py-3 pr-4 font-medium text-text-primary">{cls.class_name}</td>
                        <td className="py-3 pr-4 text-text-secondary">{cls.grade}</td>
                        <td className="py-3 pr-4 text-text-secondary">{cls.teacher_name}</td>
                        <td className="py-3 pr-4 text-text-secondary">{cls.total_students}</td>
                        <td className="py-3 pr-4 text-text-secondary">{cls.total_sessions}</td>
                        <td className="py-3 pr-4">
                          <span className={`font-medium ${cls.present_rate >= 80 ? 'text-positive-text' : cls.present_rate >= 60 ? 'text-warning-text' : 'text-danger-text'}`}>
                            {cls.present_rate}%
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-danger-text">{cls.absent_rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
