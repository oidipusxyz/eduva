'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/layout/PageHeader'
import { api } from '@/lib/api'
import { Class } from '@/lib/types'

interface Journal {
  id: string
  class_id: string
  session_date: string
  topic: string
  activity_notes: string
  created_at: string
  classes: { name: string; grade: string }
}

interface FormState {
  class_id: string
  session_date: string
  topic: string
  activity_notes: string
}

export default function JournalsPage() {
  const [journals, setJournals] = useState<Journal[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({
    class_id: '',
    session_date: new Date().toISOString().split('T')[0],
    topic: '',
    activity_notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [filterClass, setFilterClass] = useState('')

  async function fetchJournals(classId?: string) {
    const q = classId ? `?class_id=${classId}` : ''
    const data = await api.get<Journal[]>(`/journals${q}`).catch(() => [])
    setJournals(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    Promise.all([
      api.get<Class[]>('/classes').catch(() => []),
      api.get<Journal[]>('/journals').catch(() => []),
    ]).then(([c, j]) => {
      const classList = Array.isArray(c) ? c : []
      setClasses(classList)
      setJournals(Array.isArray(j) ? j : [])
      if (classList.length > 0) {
        setForm((f) => ({ ...f, class_id: classList[0].id }))
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (loading) return
    fetchJournals(filterClass || undefined)
  }, [filterClass])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) {
        await api.put(`/journals/${editId}`, form)
      } else {
        await api.post('/journals', form)
      }
      setShowForm(false)
      setEditId(null)
      setForm({ class_id: classes[0]?.id ?? '', session_date: new Date().toISOString().split('T')[0], topic: '', activity_notes: '' })
      fetchJournals(filterClass || undefined)
    } catch {
      alert('Gagal menyimpan jurnal')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(j: Journal) {
    setEditId(j.id)
    setForm({ class_id: j.class_id, session_date: j.session_date, topic: j.topic, activity_notes: j.activity_notes })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus jurnal ini?')) return
    try {
      await api.delete(`/journals/${id}`)
      setJournals((prev) => prev.filter((j) => j.id !== id))
    } catch {
      alert('Gagal menghapus jurnal')
    }
  }

  return (
    <div>
      <PageHeader
        title="Jurnal Mengajar"
        subtitle="Catat aktivitas pembelajaran per pertemuan"
        action={
          <Button size="sm" onClick={() => { setShowForm(!showForm); setEditId(null) }}>
            {showForm ? 'Batal' : '+ Tambah Jurnal'}
          </Button>
        }
      />

      {/* Form */}
      {showForm && (
        <Card className="mb-6">
          <h2 className="text-[14px] font-medium text-text-primary mb-4">
            {editId ? 'Edit Jurnal' : 'Tambah Jurnal Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-text-secondary block mb-1.5">Kelas</label>
                <select
                  value={form.class_id}
                  onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                  className="w-full bg-bg-subtle border border-border-default rounded-[10px] px-3 py-2 text-[13px] text-text-primary outline-none focus:border-primary transition-colors"
                  required
                >
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.grade}</option>)}
                </select>
              </div>
              <Input
                label="Tanggal Pertemuan"
                type="date"
                value={form.session_date}
                onChange={(e) => setForm({ ...form, session_date: e.target.value })}
                required
              />
            </div>
            <Input
              label="Topik / Materi"
              placeholder="HTML Dasar — Struktur Tag"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              required
            />
            <div>
              <label className="text-[12px] font-medium text-text-secondary block mb-1.5">Catatan Aktivitas</label>
              <textarea
                value={form.activity_notes}
                onChange={(e) => setForm({ ...form, activity_notes: e.target.value })}
                placeholder="Siswa mengerjakan latihan membuat struktur HTML dasar. Sebagian besar sudah paham, 3 siswa perlu pendampingan lebih..."
                rows={3}
                className="w-full bg-bg-subtle border border-border-default rounded-[10px] px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" type="button" size="sm" onClick={() => { setShowForm(false); setEditId(null) }}>Batal</Button>
              <Button type="submit" size="sm" loading={saving}>{editId ? 'Perbarui' : 'Simpan'}</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Class filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterClass('')}
          className={[
            'px-3 py-1.5 rounded-[20px] text-[12px] font-medium whitespace-nowrap border transition-all',
            !filterClass ? 'bg-primary-muted border-primary-border text-positive-text' : 'bg-bg-surface border-border-default text-text-muted hover:border-primary-border',
          ].join(' ')}
        >
          Semua Kelas
        </button>
        {classes.map((cls) => (
          <button
            key={cls.id}
            onClick={() => setFilterClass(cls.id)}
            className={[
              'px-3 py-1.5 rounded-[20px] text-[12px] font-medium whitespace-nowrap border transition-all',
              filterClass === cls.id ? 'bg-primary-muted border-primary-border text-positive-text' : 'bg-bg-surface border-border-default text-text-muted hover:border-primary-border',
            ].join(' ')}
          >
            {cls.name}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-[90px] bg-border-muted rounded-[14px] animate-pulse" />)}
        </div>
      ) : journals.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-text-muted text-[13px]">Belum ada jurnal. Mulai catat pertemuan pertama.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {journals.map((j) => (
            <Card key={j.id} hoverable className="group">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-center min-w-[44px]">
                  <div className="text-[18px] font-medium text-text-primary">
                    {new Date(j.session_date).getDate()}
                  </div>
                  <div className="text-[10px] text-text-muted uppercase">
                    {new Date(j.session_date).toLocaleDateString('id-ID', { month: 'short' })}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-medium text-text-primary">{j.topic}</span>
                    <Badge variant="info">{j.classes?.name}</Badge>
                  </div>
                  {j.activity_notes && (
                    <p className="text-[12px] text-text-muted line-clamp-2">{j.activity_notes}</p>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(j)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-danger-text hover:bg-danger-bg" onClick={() => handleDelete(j.id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
