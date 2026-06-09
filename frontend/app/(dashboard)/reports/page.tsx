'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import PageHeader from '@/components/layout/PageHeader'
import { api } from '@/lib/api'
import { Class } from '@/lib/types'

interface AttendanceMatrix {
  sessions: { id: string; created_at: string; pin: string }[]
  students: { id: string; full_name: string }[]
  matrix: Record<string, string>[]
}

interface MonthlyReport {
  month: string
  total_sessions: number
  total_journals: number
  classes: { id: string; name: string; grade: string }[]
  journals: { session_date: string; topic: string; activity_notes: string; classes: { name: string } }[]
}

const statusLabel: Record<string, string> = {
  present: 'H', late: 'T', excused: 'I', absent: 'A',
}
const statusColor: Record<string, string> = {
  present: 'text-positive-text bg-positive-bg',
  late: 'text-warning-text bg-warning-bg',
  excused: 'text-info-text bg-info-bg',
  absent: 'text-danger-text bg-danger-bg',
}

function getCurrentWeek(): string {
  const now = new Date()
  const jan4 = new Date(now.getFullYear(), 0, 4)
  const startOfWeek1 = new Date(jan4.getTime() - (jan4.getDay() === 0 ? 6 : jan4.getDay() - 1) * 86400000)
  const week = Math.ceil((now.getTime() - startOfWeek1.getTime()) / (7 * 86400000))
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export default function ReportsPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [week, setWeek] = useState(getCurrentWeek())
  const [periodMode, setPeriodMode] = useState<'monthly' | 'weekly'>('monthly')
  const [activeTab, setActiveTab] = useState<'attendance' | 'monthly'>('attendance')
  const [attendanceData, setAttendanceData] = useState<AttendanceMatrix | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyReport | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get<Class[]>('/classes').then((data) => {
      const list = Array.isArray(data) ? data : []
      setClasses(list)
      if (list.length > 0) setSelectedClass(list[0].id)
    }).catch(() => {})
  }, [])

  async function fetchReport() {
    setLoading(true)
    try {
      if (activeTab === 'attendance' && selectedClass) {
        const periodParam = periodMode === 'weekly' ? `week=${week}` : `month=${month}`
        const data = await api.get<AttendanceMatrix>(`/reports/attendance?class_id=${selectedClass}&${periodParam}`)
        setAttendanceData(data)
      } else if (activeTab === 'monthly') {
        const data = await api.get<MonthlyReport>(`/reports/monthly?month=${month}`)
        setMonthlyData(data)
      }
    } catch {
      alert('Gagal memuat laporan')
    } finally {
      setLoading(false)
    }
  }

  function exportAttendancePDF() {
    if (!attendanceData) return
    import('jspdf').then(({ default: jsPDF }) => {
      import('jspdf-autotable').then(({ default: autoTable }) => {
        const doc = new jsPDF({ orientation: 'landscape' })
        const cls = classes.find((c) => c.id === selectedClass)

        doc.setFontSize(14)
        doc.text(`Rekap Absensi — ${cls?.name ?? ''} (${cls?.grade ?? ''})`, 14, 15)
        doc.setFontSize(10)
        doc.text(`Periode: ${periodMode === 'weekly' ? `Minggu ${week}` : month}`, 14, 22)

        const headers = ['No', 'Nama Siswa', ...attendanceData.sessions.map((s) =>
          new Date(s.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })
        ), 'Hadir', 'Total', '%']

        const rows = attendanceData.matrix.map((row, i) => [
          i + 1,
          row.full_name,
          ...attendanceData.sessions.map((s) => statusLabel[row[s.id]] ?? 'A'),
          row.present_count,
          row.total_sessions,
          `${row.rate}%`,
        ])

        autoTable(doc, { head: [headers], body: rows, startY: 28, styles: { fontSize: 8 } })
        doc.save(`Absensi-${cls?.name ?? 'kelas'}-${month}.pdf`)
      })
    })
  }

  function exportMonthlyPDF() {
    if (!monthlyData) return
    import('jspdf').then(({ default: jsPDF }) => {
      import('jspdf-autotable').then(({ default: autoTable }) => {
        const doc = new jsPDF()
        doc.setFontSize(16)
        doc.text('Laporan Mengajar Bulanan', 14, 20)
        doc.setFontSize(11)
        doc.text(`Periode: ${monthlyData.month}`, 14, 30)
        doc.text(`Total Sesi: ${monthlyData.total_sessions}`, 14, 37)
        doc.text(`Total Jurnal Tercatat: ${monthlyData.total_journals}`, 14, 44)

        const rows = monthlyData.journals.map((j, i) => [
          i + 1,
          j.session_date,
          j.classes?.name ?? '',
          j.topic,
          j.activity_notes ?? '',
        ])

        autoTable(doc, {
          head: [['No', 'Tanggal', 'Kelas', 'Topik', 'Catatan']],
          body: rows,
          startY: 52,
          styles: { fontSize: 9 },
          columnStyles: { 4: { cellWidth: 60 } },
        })

        doc.save(`Laporan-Mengajar-${monthlyData.month}.pdf`)
      })
    })
  }

  return (
    <div>
      <PageHeader title="Rekap & Laporan" subtitle="Laporan absensi dan mengajar bulanan" />

      {/* Tab */}
      <div className="flex gap-2 mb-5">
        {(['attendance', 'monthly'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setAttendanceData(null); setMonthlyData(null) }}
            className={[
              'px-4 py-2 rounded-[10px] text-[13px] font-medium border transition-all',
              activeTab === tab
                ? 'bg-primary text-white border-primary'
                : 'bg-bg-surface border-border-default text-text-secondary hover:border-primary',
            ].join(' ')}
          >
            {tab === 'attendance' ? '📋 Rekap Absensi' : '📄 Laporan Bulanan'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          {activeTab === 'attendance' && (
            <>
              <div className="flex-1 min-w-[160px]">
                <label className="text-[12px] font-medium text-text-secondary block mb-1.5">Kelas</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-bg-subtle border border-border-default rounded-[10px] px-3 py-2 text-[13px] text-text-primary outline-none focus:border-primary transition-colors"
                >
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.grade}</option>)}
                </select>
              </div>

              {/* Period toggle */}
              <div>
                <label className="text-[12px] font-medium text-text-secondary block mb-1.5">Periode</label>
                <div className="flex border border-border-default rounded-[10px] overflow-hidden">
                  {(['monthly', 'weekly'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => { setPeriodMode(mode); setAttendanceData(null) }}
                      className={[
                        'px-3 py-2 text-[12px] font-medium transition-all',
                        periodMode === mode
                          ? 'bg-primary text-white'
                          : 'bg-bg-subtle text-text-muted hover:bg-border-muted',
                      ].join(' ')}
                    >
                      {mode === 'monthly' ? 'Bulanan' : 'Mingguan'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Date input — monthly or weekly */}
          {(activeTab !== 'attendance' || periodMode === 'monthly') && (
            <div className="flex-1 min-w-[140px]">
              <label className="text-[12px] font-medium text-text-secondary block mb-1.5">Bulan</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-bg-subtle border border-border-default rounded-[10px] px-3 py-2 text-[13px] text-text-primary outline-none focus:border-primary transition-colors"
              />
            </div>
          )}
          {activeTab === 'attendance' && periodMode === 'weekly' && (
            <div className="flex-1 min-w-[160px]">
              <label className="text-[12px] font-medium text-text-secondary block mb-1.5">Minggu</label>
              <input
                type="week"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="w-full bg-bg-subtle border border-border-default rounded-[10px] px-3 py-2 text-[13px] text-text-primary outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          <Button onClick={fetchReport} loading={loading} size="sm">Tampilkan</Button>
        </div>
      </Card>

      {/* Attendance recap table */}
      {activeTab === 'attendance' && attendanceData && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-medium text-text-secondary">
              Rekap Absensi — {classes.find((c) => c.id === selectedClass)?.name}
            </h2>
            <Button variant="secondary" size="sm" onClick={exportAttendancePDF}>Export PDF</Button>
          </div>

          {attendanceData.sessions.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-text-muted text-[13px]">Tidak ada sesi absensi pada bulan ini.</p>
            </Card>
          ) : (
            <Card className="p-0 overflow-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border-muted bg-bg-subtle">
                    <th className="text-left text-text-muted font-medium px-4 py-3 sticky left-0 bg-bg-subtle">Nama Siswa</th>
                    {attendanceData.sessions.map((s) => (
                      <th key={s.id} className="text-center text-text-muted font-medium px-2 py-3 min-w-[44px]">
                        {new Date(s.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                      </th>
                    ))}
                    <th className="text-center text-text-muted font-medium px-3 py-3">Hadir</th>
                    <th className="text-center text-text-muted font-medium px-3 py-3">%</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.matrix.map((row, i) => (
                    <tr key={i} className="border-b border-border-muted last:border-0 hover:bg-bg-subtle transition-colors">
                      <td className="px-4 py-2.5 font-medium text-text-primary sticky left-0 bg-bg-surface">{row.full_name}</td>
                      {attendanceData.sessions.map((s) => {
                        const st = row[s.id] ?? 'absent'
                        return (
                          <td key={s.id} className="px-2 py-2.5 text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-[4px] text-[10px] font-medium ${statusColor[st] ?? ''}`}>
                              {statusLabel[st] ?? 'A'}
                            </span>
                          </td>
                        )
                      })}
                      <td className="px-3 py-2.5 text-center font-medium text-text-primary">{row.present_count}/{row.total_sessions}</td>
                      <td className="px-3 py-2.5 text-center">
                        <ProgressBar value={Number(row.rate)} className="min-w-[60px]" showLabel />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          <div className="flex gap-4 mt-3 text-[11px] text-text-muted">
            {[['H', 'Hadir', 'positive'], ['T', 'Terlambat', 'warning'], ['I', 'Izin', 'info'], ['A', 'Absen', 'danger']].map(([code, label]) => (
              <span key={code} className="flex items-center gap-1">
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-[4px] text-[10px] font-medium ${statusColor[Object.keys(statusLabel).find((k) => statusLabel[k] === code) ?? 'absent']}`}>{code}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Monthly report */}
      {activeTab === 'monthly' && monthlyData && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-medium text-text-secondary">Laporan Bulan {month}</h2>
            <Button variant="secondary" size="sm" onClick={exportMonthlyPDF}>Export PDF</Button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Sesi', value: monthlyData.total_sessions },
              { label: 'Jurnal Tercatat', value: monthlyData.total_journals },
              { label: 'Jumlah Kelas', value: monthlyData.classes.length },
            ].map((s) => (
              <Card key={s.label} className="text-center py-4">
                <div className="text-[22px] font-medium text-text-primary">{s.value}</div>
                <div className="text-[12px] text-text-muted mt-0.5">{s.label}</div>
              </Card>
            ))}
          </div>

          {monthlyData.journals.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-text-muted text-[13px]">Belum ada jurnal pada bulan ini.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {monthlyData.journals.map((j, i) => (
                <Card key={i} className="flex items-start gap-3">
                  <div className="text-center min-w-[40px]">
                    <div className="text-[16px] font-medium text-text-primary">{new Date(j.session_date).getDate()}</div>
                    <div className="text-[10px] text-text-muted uppercase">{new Date(j.session_date).toLocaleDateString('id-ID', { month: 'short' })}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-medium text-text-primary">{j.topic}</span>
                      <Badge variant="info">{j.classes?.name}</Badge>
                    </div>
                    {j.activity_notes && <p className="text-[12px] text-text-muted">{j.activity_notes}</p>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
