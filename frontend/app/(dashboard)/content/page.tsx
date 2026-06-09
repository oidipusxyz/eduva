'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/layout/PageHeader'
import { api } from '@/lib/api'
import { Class, Content } from '@/lib/types'

interface FormState {
  class_id: string
  type: 'material' | 'assignment'
  title: string
  link_url: string
  deadline: string
}

export default function ContentPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [contents, setContents] = useState<Content[]>([])
  const [filterClass, setFilterClass] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>({ class_id: '', type: 'material', title: '', link_url: '', deadline: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function fetchContents(classId?: string) {
    const q = classId ? `?class_id=${classId}` : ''
    try {
      const data = await api.get<Content[]>(`/content${q}`)
      setContents(Array.isArray(data) ? data : [])
    } catch {
      setContents([])
    }
  }

  useEffect(() => {
    api.get<Class[]>('/classes').then((data) => {
      const list = Array.isArray(data) ? data : []
      setClasses(list)
      if (list.length > 0) {
        setFilterClass(list[0].id)
        setForm((f) => ({ ...f, class_id: list[0].id }))
        fetchContents(list[0].id)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!filterClass) return
    fetchContents(filterClass)
  }, [filterClass])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/content', form)
      setShowForm(false)
      fetchContents(filterClass)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan konten')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus konten ini?')) return
    try {
      await api.delete(`/content/${id}`)
      setContents((prev) => prev.filter((c) => c.id !== id))
    } catch {
      alert('Gagal menghapus konten')
    }
  }

  const filtered = filterClass ? contents.filter((c) => c.class_id === filterClass) : contents

  return (
    <div>
      <PageHeader
        title="Materi & Tugas"
        subtitle="Distribusikan materi dan tugas ke kelas"
        action={<Button size="sm" onClick={() => setShowForm(!showForm)}>+ Tambah</Button>}
      />

      {/* Class filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {classes.map((cls) => (
          <button
            key={cls.id}
            onClick={() => setFilterClass(cls.id)}
            className={[
              'px-3 py-1.5 rounded-[20px] text-[12px] font-medium whitespace-nowrap border transition-all',
              filterClass === cls.id
                ? 'bg-primary-muted border-primary-border text-positive-text'
                : 'bg-bg-surface border-border-default text-text-muted hover:border-primary-border',
            ].join(' ')}
          >
            {cls.name}
          </button>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="mb-6">
          <h2 className="text-[14px] font-medium text-text-primary mb-4">Tambah Konten</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-text-secondary block mb-1.5">Kelas</label>
                <select
                  value={form.class_id}
                  onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                  className="w-full bg-bg-subtle border border-border-default rounded-[10px] px-3 py-2 text-[13px] text-text-primary outline-none focus:border-primary transition-colors"
                  required
                >
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-medium text-text-secondary block mb-1.5">Jenis</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as 'material' | 'assignment' })}
                  className="w-full bg-bg-subtle border border-border-default rounded-[10px] px-3 py-2 text-[13px] text-text-primary outline-none focus:border-primary transition-colors"
                >
                  <option value="material">Materi</option>
                  <option value="assignment">Tugas</option>
                </select>
              </div>
            </div>
            <Input
              label="Judul"
              placeholder="Materi Bab 3: HTML Dasar"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Input
              label="Link (opsional)"
              type="url"
              placeholder="https://drive.google.com/..."
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
            />
            {form.type === 'assignment' && (
              <Input
                label="Deadline"
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            )}
            {error && <p className="text-[12px] text-danger-text">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" type="button" size="sm" onClick={() => setShowForm(false)}>Batal</Button>
              <Button type="submit" size="sm" loading={saving}>Simpan</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Content list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-[70px] bg-border-muted rounded-[14px] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-text-muted text-[13px]">Belum ada konten untuk kelas ini.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <Card key={item.id} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[14px] font-medium text-text-primary truncate">{item.title}</span>
                  <Badge variant={item.type === 'material' ? 'info' : 'warning'}>
                    {item.type === 'material' ? 'Materi' : 'Tugas'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[12px] text-text-muted">
                  {item.deadline && (
                    <span>Deadline: {new Date(item.deadline).toLocaleDateString('id-ID')}</span>
                  )}
                  {item.link_url && (
                    <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="text-info-text hover:underline">
                      Buka Link
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-[12px] text-text-muted hover:text-danger-text transition-colors"
              >
                Hapus
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
