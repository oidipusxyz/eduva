'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/layout/PageHeader'
import { api } from '@/lib/api'
import { Class } from '@/lib/types'
import Link from 'next/link'

interface FormState { name: string; grade: string }

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>({ name: '', grade: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>({ name: '', grade: '' })
  const [editSaving, setEditSaving] = useState(false)

  async function fetchClasses() {
    try {
      const data = await api.get<Class[]>('/classes')
      setClasses(Array.isArray(data) ? data : [])
    } catch {
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClasses() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/classes', form)
      setForm({ name: '', grade: '' })
      setShowForm(false)
      fetchClasses()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal membuat kelas')
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editId) return
    setEditSaving(true)
    try {
      await api.put(`/classes/${editId}`, editForm)
      setEditId(null)
      fetchClasses()
    } catch {
      alert('Gagal memperbarui kelas')
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus kelas ini? Semua siswa dan data akan ikut terhapus.')) return
    try {
      await api.delete(`/classes/${id}`)
      setClasses((prev) => prev.filter((c) => c.id !== id))
    } catch (err: unknown) {
      alert('Gagal menghapus kelas: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  function startEdit(cls: Class) {
    setEditId(cls.id)
    setEditForm({ name: cls.name, grade: cls.grade })
  }

  return (
    <div>
      <PageHeader
        title="Kelas"
        subtitle="Kelola semua kelas Anda"
        action={
          <Button size="sm" onClick={() => { setShowForm(!showForm); setEditId(null) }}>
            {showForm ? 'Batal' : '+ Kelas Baru'}
          </Button>
        }
      />

      {/* Create form */}
      {showForm && (
        <Card className="mb-6">
          <h2 className="text-[14px] font-medium text-text-primary mb-4">Buat Kelas Baru</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nama Kelas"
                placeholder="Pemrograman Web"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="Kelas / Tingkat"
                placeholder="XI RPL 1"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                required
              />
            </div>
            {error && <p className="text-[12px] text-danger-text">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" type="button" size="sm" onClick={() => setShowForm(false)}>Batal</Button>
              <Button type="submit" size="sm" loading={saving}>Simpan</Button>
            </div>
          </form>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[120px] bg-border-muted rounded-[14px] animate-pulse" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-text-muted">Belum ada kelas. Buat kelas pertama Anda.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls.id} hoverable={editId !== cls.id} className="group">
              {editId === cls.id ? (
                /* Inline edit form */
                <form onSubmit={handleEdit} className="flex flex-col gap-3">
                  <Input
                    label="Nama Kelas"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Kelas / Tingkat"
                    value={editForm.grade}
                    onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                    required
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" loading={editSaving} className="flex-1">Simpan</Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setEditId(null)}>Batal</Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-medium text-text-primary truncate">{cls.name}</h3>
                      <p className="text-[12px] text-text-muted">{cls.grade}</p>
                    </div>
                    <Badge variant="info">{cls.student_count ?? 0} siswa</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Link href={`/classes/${cls.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">Kelola</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-text-muted hover:text-text-secondary"
                      onClick={() => startEdit(cls)}
                      title="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger-text hover:bg-danger-bg"
                      onClick={() => handleDelete(cls.id)}
                      title="Hapus"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
