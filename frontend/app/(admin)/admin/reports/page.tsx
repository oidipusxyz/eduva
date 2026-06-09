'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/layout/PageHeader'
import { api } from '@/lib/api'

interface ClassReport {
  class_id: string
  class_name: string
  grade: string
  teacher_name: string
  total_students: number
  total_sessions: number
  present_rate: number
  late_rate: number
  absent_rate: number
}

export default function AdminReportsPage() {
  const [classes, setClasses] = useState<ClassReport[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    api.get<ClassReport[]>('/admin/reports')
      .then((data) => setClasses(Array.isArray(data) ? data : []))
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  async function handleExportPDF() {
    setExporting(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF()
      const now = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Laporan Kehadiran Seluruh Kelas', 14, 20)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      doc.text(`Dicetak: ${now}`, 14, 28)

      autoTable(doc, {
        startY: 35,
        head: [['Kelas', 'Tingkat', 'Guru', 'Siswa', 'Sesi', 'Hadir (%)', 'Terlambat (%)', 'Absen (%)']],
        body: classes.map((c) => [
          c.class_name, c.grade, c.teacher_name,
          c.total_students, c.total_sessions,
          `${c.present_rate}%`, `${c.late_rate}%`, `${c.absent_rate}%`,
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [76, 175, 80], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 250, 245] },
      })

      // Summary row
      const avg = classes.length
        ? Math.round(classes.reduce((s, c) => s + c.present_rate, 0) / classes.length)
        : 0
      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(`Rata-rata kehadiran sekolah: ${avg}%`, 14, finalY)

      doc.save(`laporan-sekolah-${now}.pdf`)
    } catch {
      alert('Gagal export PDF')
    } finally {
      setExporting(false)
    }
  }

  async function handleExportExcel() {
    const { exportToExcel } = await import('@/lib/exportExcel')
    exportToExcel(
      classes.map((c) => ({
        Kelas: c.class_name,
        Tingkat: c.grade,
        Guru: c.teacher_name,
        'Total Siswa': c.total_students,
        'Total Sesi': c.total_sessions,
        'Kehadiran (%)': c.present_rate,
        'Terlambat (%)': c.late_rate,
        'Absen (%)': c.absent_rate,
      })),
      'laporan-sekolah',
      'Rekap Kelas'
    )
  }

  const avgAttendance = classes.length
    ? Math.round(classes.reduce((s, c) => s + c.present_rate, 0) / classes.length)
    : 0

  return (
    <div>
      <PageHeader
        title="Laporan Sekolah"
        subtitle="Rekap kehadiran seluruh kelas"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleExportExcel} disabled={loading || classes.length === 0}>
              Excel
            </Button>
            <Button size="sm" onClick={handleExportPDF} loading={exporting} disabled={loading || classes.length === 0}>
              Export PDF
            </Button>
          </div>
        }
      />

      {!loading && classes.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center">
            <div className="text-[28px] font-medium text-primary">{avgAttendance}%</div>
            <div className="text-[12px] text-text-muted mt-1">Rata-rata Kehadiran</div>
          </Card>
          <Card className="text-center">
            <div className="text-[28px] font-medium text-info-text">{classes.length}</div>
            <div className="text-[12px] text-text-muted mt-1">Total Kelas</div>
          </Card>
          <Card className="text-center">
            <div className="text-[28px] font-medium text-[#7C3AED]">
              {classes.reduce((s, c) => s + c.total_students, 0)}
            </div>
            <div className="text-[12px] text-text-muted mt-1">Total Siswa</div>
          </Card>
        </div>
      )}

      <Card>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-border-muted rounded-[10px] animate-pulse" />)}
          </div>
        ) : classes.length === 0 ? (
          <p className="text-[13px] text-text-muted text-center py-8">Belum ada data kelas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border-default">
                  {['Kelas', 'Tingkat', 'Guru', 'Siswa', 'Sesi', 'Hadir', 'Terlambat', 'Absen'].map((h) => (
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
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-border-muted rounded-full overflow-hidden min-w-[60px]">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${cls.present_rate}%` }} />
                        </div>
                        <span className={`font-medium ${cls.present_rate >= 80 ? 'text-positive-text' : cls.present_rate >= 60 ? 'text-warning-text' : 'text-danger-text'}`}>
                          {cls.present_rate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-warning-text">{cls.late_rate}%</td>
                    <td className="py-3 text-danger-text">{cls.absent_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
