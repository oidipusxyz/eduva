'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/layout/PageHeader'
import { api } from '@/lib/api'

interface Teacher {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  class_count: number
  session_count: number
}

interface NewTeacherForm {
  name: string
  email: string
  password: string
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<NewTeacherForm>({ name: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  function fetchTeachers() {
    api.get<Teacher[]>('/admin/teachers')
      .then((data) => setTeachers(Array.isArray(data) ? data : []))
      .catch(() => null)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTeachers() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/admin/teachers', form)
      setForm({ name: '', email: '', password: '' })
      setShowForm(false)
      fetchTeachers()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal membuat akun')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(id: string) {
    setTogglingId(id)
    try {
      const res = await api.patch<{ is_active: boolean }>(`/admin/teachers/${id}/toggle`, {})
      setTeachers((prev) => prev.map((t) => t.id === id ? { ...t, is_active: res.is_active } : t))
    } catch {
      null
    } finally {
      setTogglingId(null)
    }
  }

  const roleLabel: Record<string, { text: string; cls: string }> = {
    admin: { text: 'Admin', cls: 'bg-primary-muted text-positive-text border-primary-border' },
    teacher: { text: 'Guru', cls: 'bg-info-bg text-info-text border-info-border' },
  }

  return (
    <div>
      <PageHeader
        title="Manajemen Guru"
        subtitle="Kelola akun guru di sekolah ini"
        action={
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'secondary' : 'primary'} size="sm">
            {showForm ? 'Batal' : '+ Tambah Guru'}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6 max-w-[480px]">
          <h2 className="text-[14px] font-medium text-text-primary mb-4">Buat Akun Guru Baru</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div>
              <label className="text-[12px] font-medium text-text-secondary block mb-1">Nama Lengkap</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full bg-bg-subtle border border-border-default rounded-[10px] px-3 py-2 text-[13px] text-text-primary outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-text-secondary block mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                className="w-full bg-bg-subtle border border-border-default rounded-[10px] px-3 py-2 text-[13px] text-text-primary outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-text-secondary block mb-1">Password Awal</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8}
                className="w-full bg-bg-subtle border border-border-default rounded-[10px] px-3 py-2 text-[13px] text-text-primary outline-none focus:border-primary transition-colors" />
            </div>
            {error && <p className="text-[12px] text-danger-text bg-danger-bg border border-danger-border rounded-[8px] px-3 py-2">{error}</p>}
            <Button type="submit" loading={submitting} className="w-full mt-1">Buat Akun</Button>
          </form>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-border-muted rounded-[10px] animate-pulse" />)}
          </div>
        ) : teachers.length === 0 ? (
          <p className="text-[13px] text-text-muted text-center py-6">Belum ada guru.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border-default">
                  {['Nama', 'Email', 'Role', 'Kelas', 'Sesi', 'Status', ''].map((h) => (
                    <th key={h} className="text-left py-2 pr-4 text-text-muted font-medium text-[11px] uppercase tracking-wide last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => {
                  const rl = roleLabel[t.role] ?? roleLabel.teacher
                  return (
                    <tr key={t.id} className="border-b border-border-muted last:border-0">
                      <td className="py-3 pr-4 font-medium text-text-primary">{t.name}</td>
                      <td className="py-3 pr-4 text-text-secondary">{t.email}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${rl.cls}`}>{rl.text}</span>
                      </td>
                      <td className="py-3 pr-4 text-text-secondary">{t.class_count}</td>
                      <td className="py-3 pr-4 text-text-secondary">{t.session_count}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${t.is_active ? 'bg-positive-bg text-positive-text' : 'bg-danger-bg text-danger-text'}`}>
                          {t.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {t.role !== 'admin' && (
                          <button
                            onClick={() => handleToggle(t.id)}
                            disabled={togglingId === t.id}
                            className={`text-[11px] font-medium px-3 py-1 rounded-[6px] border transition-colors ${t.is_active ? 'border-danger-border text-danger-text hover:bg-danger-bg' : 'border-positive-border text-positive-text hover:bg-positive-bg'} disabled:opacity-50`}
                          >
                            {togglingId === t.id ? '...' : t.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
