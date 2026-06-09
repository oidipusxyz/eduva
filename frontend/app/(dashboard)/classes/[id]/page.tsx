'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/layout/PageHeader'
import { api } from '@/lib/api'
import { exportToExcel } from '@/lib/exportExcel'
import { Class, Student } from '@/lib/types'
import Link from 'next/link'

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [cls, setCls] = useState<Class | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get<Class>(`/classes/${id}`).catch(() => null),
      api.get<Student[]>(`/classes/${id}/students`).catch(() => []),
    ]).then(([c, s]) => {
      setCls(c)
      setStudents(Array.isArray(s) ? s : [])
      setLoading(false)
    })
  }, [id])

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault()
    if (!studentName.trim()) return
    setSaving(true)
    try {
      const s = await api.post<Student>(`/classes/${id}/students`, { full_name: studentName })
      setStudents((prev) => [...prev, s])
      setStudentName('')
      setShowAdd(false)
    } catch {
      alert('Gagal menambah siswa')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveStudent(studentId: string) {
    if (!confirm('Hapus siswa ini?')) return
    try {
      await api.delete(`/classes/${id}/students/${studentId}`)
      setStudents((prev) => prev.filter((s) => s.id !== studentId))
    } catch {
      alert('Gagal menghapus siswa')
    }
  }

  if (loading) return <div className="p-6 text-text-muted text-[13px]">Memuat...</div>
  if (!cls) return <div className="p-6 text-text-muted text-[13px]">Kelas tidak ditemukan.</div>

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Link href="/classes" className="text-[12px] text-text-muted hover:text-primary">← Kelas</Link>
      </div>
      <PageHeader
        title={cls.name}
        subtitle={cls.grade}
        action={
          <div className="flex gap-2">
            <Link href={`/attendance?class=${id}`}>
              <Button variant="secondary" size="sm">Buka Absensi</Button>
            </Link>
            <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
              + Tambah Siswa
            </Button>
          </div>
        }
      />

      {showAdd && (
        <Card className="mb-6">
          <form onSubmit={handleAddStudent} className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                label="Nama Lengkap Siswa"
                placeholder="Ahmad Fauzi"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="sm" loading={saving}>Tambah</Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowAdd(false)}>Batal</Button>
          </form>
        </Card>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-medium text-text-secondary">
          Daftar Siswa <Badge variant="neutral" className="ml-1">{students.length}</Badge>
        </h2>
        {students.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-[12px]"
            onClick={() => {
              const rows = students.map((s, i) => ({
                'No': i + 1,
                'Nama Lengkap': s.full_name,
                'Username': s.username,
                'Password Default': `edu${s.username.replace(/\D/g, '').slice(-4)}`,
              }))
              exportToExcel(rows, `Akun-Siswa-${cls.name}`, 'Siswa')
            }}
          >
            Export CSV
          </Button>
        )}
      </div>

      {students.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-text-muted text-[13px]">Belum ada siswa di kelas ini.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border-muted">
                <th className="text-left text-[11px] text-text-muted font-medium px-4 py-3">#</th>
                <th className="text-left text-[11px] text-text-muted font-medium px-4 py-3">Nama</th>
                <th className="text-left text-[11px] text-text-muted font-medium px-4 py-3">Username</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id} className="border-b border-border-muted last:border-0 hover:bg-bg-subtle transition-colors">
                  <td className="px-4 py-3 text-text-muted">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-text-primary">{s.full_name}</td>
                  <td className="px-4 py-3 text-text-muted font-mono text-[12px]">{s.username}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRemoveStudent(s.id)}
                      className="text-[12px] text-text-muted hover:text-danger-text transition-colors"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
