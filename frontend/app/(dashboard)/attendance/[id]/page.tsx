'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/layout/PageHeader'
import { api } from '@/lib/api'
import { exportToExcel } from '@/lib/exportExcel'

type Status = 'present' | 'absent' | 'late' | 'excused'

interface StudentRecord {
  student_id: string
  full_name: string
  username: string
  record_id: string | null
  status: Status
}

interface SessionDetail {
  session: {
    id: string
    class_id: string
    pin: string
    expires_at: string
    created_at: string
  }
  students: StudentRecord[]
}

const statusConfig: Record<Status, { label: string; variant: 'positive' | 'danger' | 'warning' | 'neutral' }> = {
  present:  { label: 'Hadir',    variant: 'positive' },
  absent:   { label: 'Absen',    variant: 'danger' },
  late:     { label: 'Terlambat', variant: 'warning' },
  excused:  { label: 'Izin',     variant: 'neutral' },
}

export default function AttendanceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [detail, setDetail] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    api.get<SessionDetail>(`/attendance/sessions/${id}`)
      .then((data) => setDetail(data))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusChange(studentId: string, status: Status) {
    if (!detail) return
    setSaving(studentId)
    try {
      await api.put(`/attendance/sessions/${id}/students/${studentId}`, { status })
      setDetail((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          students: prev.students.map((s) =>
            s.student_id === studentId ? { ...s, status } : s
          ),
        }
      })
    } catch {
      alert('Gagal mengubah status')
    } finally {
      setSaving(null)
    }
  }

  function handleExport() {
    if (!detail) return
    const rows = detail.students.map((s, i) => ({
      'No': i + 1,
      'Nama Lengkap': s.full_name,
      'Username': s.username,
      'Status': statusConfig[s.status].label,
    }))
    const tanggal = new Date(detail.session.created_at).toLocaleDateString('id-ID')
    exportToExcel(rows, `Absensi-${detail.session.pin}-${tanggal}`, 'Absensi')
  }

  if (loading) return <div className="p-6 text-text-muted text-[13px]">Memuat...</div>
  if (!detail) return <div className="p-6 text-text-muted text-[13px]">Sesi tidak ditemukan.</div>

  const { session, students } = detail
  const expired = new Date(session.expires_at) < new Date()
  const presentCount = students.filter((s) => s.status === 'present').length
  const lateCount = students.filter((s) => s.status === 'late').length

  return (
    <div>
      <div className="mb-1">
        <Link href="/attendance" className="text-[12px] text-text-muted hover:text-primary">← Absensi</Link>
      </div>
      <PageHeader
        title={`Sesi PIN: ${session.pin}`}
        subtitle={new Date(session.created_at).toLocaleDateString('id-ID', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport}>Export CSV</Button>
          </div>
        }
      />

      {/* Stat summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Siswa', value: students.length, color: 'text-text-primary' },
          { label: 'Hadir', value: presentCount, color: 'text-positive-text' },
          { label: 'Terlambat', value: lateCount, color: 'text-warning-text' },
          { label: 'Tidak Hadir', value: students.filter((s) => s.status === 'absent').length, color: 'text-danger-text' },
        ].map((s) => (
          <Card key={s.label} className="text-center py-3">
            <div className={`text-[22px] font-medium ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-text-muted mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Student list with override */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-medium text-text-secondary">Daftar Absensi</h2>
        <Badge variant={expired ? 'neutral' : 'positive'}>{expired ? 'Sesi Selesai' : 'Sesi Aktif'}</Badge>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border-muted">
              <th className="text-left text-[11px] text-text-muted font-medium px-4 py-3">#</th>
              <th className="text-left text-[11px] text-text-muted font-medium px-4 py-3">Nama</th>
              <th className="text-left text-[11px] text-text-muted font-medium px-4 py-3">Status</th>
              <th className="text-left text-[11px] text-text-muted font-medium px-4 py-3">Override</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.student_id} className="border-b border-border-muted last:border-0 hover:bg-bg-subtle transition-colors">
                <td className="px-4 py-3 text-text-muted">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-text-primary">{s.full_name}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusConfig[s.status].variant}>
                    {statusConfig[s.status].label}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {(['present', 'late', 'excused', 'absent'] as Status[]).map((st) => (
                      <button
                        key={st}
                        disabled={saving === s.student_id || s.status === st}
                        onClick={() => handleStatusChange(s.student_id, st)}
                        className={[
                          'px-2 py-1 rounded-[6px] text-[11px] border transition-all',
                          s.status === st
                            ? 'opacity-40 cursor-default border-transparent bg-border-muted text-text-muted'
                            : 'border-border-default text-text-secondary hover:border-primary hover:text-primary cursor-pointer',
                          saving === s.student_id ? 'opacity-50 cursor-wait' : '',
                        ].join(' ')}
                      >
                        {statusConfig[st].label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
