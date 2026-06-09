'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'react-calendar-heatmap/dist/styles.css'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/layout/PageHeader'
import { api } from '@/lib/api'
import { Class } from '@/lib/types'

const CalendarHeatmap = dynamic(() => import('react-calendar-heatmap'), { ssr: false })

interface Student {
  id: string
  full_name: string
}

interface HeatmapEntry {
  date: string
  status?: string
  count?: number
  rate?: number
}

type ViewMode = 'class' | 'student'

export default function HeatmapPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [mode, setMode] = useState<ViewMode>('class')
  const [heatmapData, setHeatmapData] = useState<HeatmapEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get<Class[]>('/classes').then((data) => {
      const list = Array.isArray(data) ? data : []
      setClasses(list)
      if (list.length > 0) setSelectedClass(list[0].id)
    }).catch(() => null)
  }, [])

  useEffect(() => {
    if (!selectedClass) return
    // Load students for the class when switching to student mode
    api.get<Student[]>(`/classes/${selectedClass}/students`).then((data) => {
      const list = Array.isArray(data) ? data : []
      setStudents(list)
      if (list.length > 0) setSelectedStudent(list[0].id)
    }).catch(() => null)
  }, [selectedClass])

  useEffect(() => {
    if (!selectedClass) return
    setLoading(true)

    const endpoint = mode === 'class'
      ? `/gamification/heatmap-class/${selectedClass}`
      : selectedStudent ? `/gamification/heatmap/${selectedStudent}` : null

    if (!endpoint) { setLoading(false); return }

    api.get<HeatmapEntry[]>(endpoint)
      .then((data) => setHeatmapData(Array.isArray(data) ? data : []))
      .catch(() => setHeatmapData([]))
      .finally(() => setLoading(false))
  }, [selectedClass, selectedStudent, mode])

  const today = new Date()
  const startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1)

  function classForValue(value: { date: string; count?: number; rate?: number; status?: string } | undefined) {
    if (!value) return 'color-empty'
    if (mode === 'class') {
      const rate = value.rate ?? 0
      if (rate >= 80) return 'heatmap-high'
      if (rate >= 50) return 'heatmap-mid'
      if (rate > 0) return 'heatmap-low'
      return 'color-empty'
    } else {
      // Student individual
      if (value.status === 'present') return 'heatmap-high'
      if (value.status === 'late') return 'heatmap-mid'
      if (value.status === 'excused') return 'heatmap-low'
      return 'color-empty'
    }
  }

  function titleForValue(value: { date: string; count?: number; rate?: number; status?: string } | undefined) {
    if (!value) return ''
    const date = new Date(value.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    if (mode === 'class') return `${date}: ${value.count ?? 0} hadir (${value.rate ?? 0}%)`
    const labels: Record<string, string> = { present: 'Hadir', late: 'Terlambat', excused: 'Izin', absent: 'Absen' }
    return `${date}: ${labels[value.status ?? ''] ?? '-'}`
  }

  return (
    <div>
      <PageHeader title="Heatmap Kehadiran" subtitle="Visualisasi pola kehadiran kelas" />

      <div className="flex flex-col gap-4">
        {/* Controls */}
        <Card>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-[12px] font-medium text-text-secondary block mb-1.5">Kelas</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-bg-subtle border border-border-default rounded-[10px] px-3 py-2 text-[13px] text-text-primary outline-none focus:border-primary transition-colors"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[12px] font-medium text-text-secondary block mb-1.5">Tampilan</label>
              <div className="flex gap-1 bg-bg-subtle border border-border-default rounded-[10px] p-0.5">
                <button
                  onClick={() => setMode('class')}
                  className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors ${mode === 'class' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Per Kelas
                </button>
                <button
                  onClick={() => setMode('student')}
                  className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors ${mode === 'student' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Per Siswa
                </button>
              </div>
            </div>

            {mode === 'student' && students.length > 0 && (
              <div>
                <label className="text-[12px] font-medium text-text-secondary block mb-1.5">Siswa</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="bg-bg-subtle border border-border-default rounded-[10px] px-3 py-2 text-[13px] text-text-primary outline-none focus:border-primary transition-colors"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>

        {/* Heatmap */}
        <Card>
          <h2 className="text-[13px] font-medium text-text-secondary mb-4">
            {mode === 'class' ? 'Tingkat kehadiran kelas per hari' : 'Riwayat kehadiran siswa'}
          </h2>

          {loading ? (
            <div className="text-center py-8 text-text-muted text-[13px]">Memuat data...</div>
          ) : heatmapData.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-[13px]">Belum ada data kehadiran.</div>
          ) : (
            <div className="overflow-x-auto">
              <style>{`
                .color-empty { fill: #F3F4F6; }
                .heatmap-low { fill: #BBF7D0; }
                .heatmap-mid { fill: #4ADE80; }
                .heatmap-high { fill: #16A34A; }
                .react-calendar-heatmap text { fill: #9CA3AF; font-size: 8px; }
              `}</style>
              <CalendarHeatmap
                startDate={startDate}
                endDate={today}
                values={heatmapData}
                classForValue={classForValue as (v: unknown) => string}
                titleForValue={titleForValue as (v: unknown) => string}
                showWeekdayLabels
              />
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-[11px] text-text-muted">Kurang</span>
            <div className="flex gap-1">
              {['#F3F4F6', '#BBF7D0', '#4ADE80', '#16A34A'].map((color) => (
                <div key={color} className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: color }} />
              ))}
            </div>
            <span className="text-[11px] text-text-muted">Banyak</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
