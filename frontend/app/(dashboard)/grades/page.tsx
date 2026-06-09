'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/layout/PageHeader'
import { api } from '@/lib/api'
import { Class, Student, Grade } from '@/lib/types'
import { exportToExcel } from '@/lib/exportExcel'

interface GradeEntry {
  student_id: string
  student_name: string
  score: string
}

export default function GradesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [subject, setSubject] = useState('')
  const [entries, setEntries] = useState<GradeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get<Class[]>('/classes').then((data) => {
      const list = Array.isArray(data) ? data : []
      setClasses(list)
      if (list.length > 0) setSelectedClass(list[0].id)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedClass) return
    Promise.all([
      api.get<Student[]>(`/classes/${selectedClass}/students`).catch(() => []),
      api.get<Grade[]>(`/grades?class_id=${selectedClass}`).catch(() => []),
    ]).then(([s, g]) => {
      const studentList = Array.isArray(s) ? s : []
      const gradeList = Array.isArray(g) ? g : []
      setStudents(studentList)
      setGrades(gradeList)
      setEntries(studentList.map((st) => ({
        student_id: st.id,
        student_name: st.full_name,
        score: '',
      })))
    })
  }, [selectedClass])

  async function handleSave() {
    const valid = entries.filter((e) => e.score !== '' && !isNaN(Number(e.score)))
    if (valid.length === 0 || !subject.trim()) {
      alert('Isi mata pelajaran dan minimal satu nilai')
      return
    }
    setSaving(true)
    try {
      await api.post('/grades/bulk', {
        class_id: selectedClass,
        subject,
        grades: valid.map((e) => ({ student_id: e.student_id, score: Number(e.score) })),
      })
      const updated = await api.get<Grade[]>(`/grades?class_id=${selectedClass}`)
      setGrades(Array.isArray(updated) ? updated : [])
      alert('Nilai berhasil disimpan')
    } catch {
      alert('Gagal menyimpan nilai')
    } finally {
      setSaving(false)
    }
  }

  function handleExport() {
    const rows = grades.map((g, i) => {
      const student = students.find((s) => s.id === g.student_id)
      return {
        'No': i + 1,
        'Nama Lengkap': student?.full_name ?? '',
        'Mata Pelajaran': g.subject,
        'Nilai': g.score,
      }
    })
    const className = classes.find((c) => c.id === selectedClass)?.name ?? 'kelas'
    exportToExcel(rows, `Nilai-${className}`, 'Nilai')
  }

  const subjects = [...new Set(grades.map((g) => g.subject))]

  return (
    <div>
      <PageHeader
        title="Nilai"
        subtitle="Input dan rekap nilai siswa"
        action={
          <div className="flex gap-2">
            {grades.length > 0 && (
              <Button variant="secondary" size="sm" onClick={handleExport}>Export CSV</Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input form */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-[14px] font-medium text-text-primary mb-4">Input Nilai</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[12px] font-medium text-text-secondary block mb-1.5">Kelas</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-bg-subtle border border-border-default rounded-[10px] px-3 py-2 text-[13px] text-text-primary outline-none focus:border-primary transition-colors"
                >
                  {loading ? <option>Memuat...</option> : classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.grade}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Mata Pelajaran"
                placeholder="Pemrograman Web"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {students.length === 0 ? (
              <p className="text-[13px] text-text-muted text-center py-6">Tidak ada siswa di kelas ini.</p>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-4 max-h-[400px] overflow-y-auto">
                  {entries.map((entry, i) => (
                    <div key={entry.student_id} className="flex items-center gap-3">
                      <span className="text-[13px] text-text-primary flex-1">{entry.student_name}</span>
                      <input
                        type="number"
                        min={0} max={100}
                        placeholder="0–100"
                        value={entry.score}
                        onChange={(e) => {
                          const next = [...entries]
                          next[i] = { ...next[i], score: e.target.value }
                          setEntries(next)
                        }}
                        className="w-20 bg-bg-subtle border border-border-default rounded-[10px] px-3 py-1.5 text-[13px] text-text-primary text-right outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  ))}
                </div>
                <Button onClick={handleSave} loading={saving} size="sm">Simpan Nilai</Button>
              </>
            )}
          </Card>
        </div>

        {/* Rekap */}
        <div>
          <Card>
            <h2 className="text-[14px] font-medium text-text-primary mb-4">Rekap Nilai</h2>
            {subjects.length === 0 ? (
              <p className="text-[13px] text-text-muted">Belum ada nilai tersimpan.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {subjects.map((subj) => {
                  const subjGrades = grades.filter((g) => g.subject === subj)
                  const avg = Math.round(subjGrades.reduce((s, g) => s + g.score, 0) / subjGrades.length)
                  const min = Math.min(...subjGrades.map((g) => g.score))
                  const max = Math.max(...subjGrades.map((g) => g.score))
                  return (
                    <div key={subj} className="border border-border-muted rounded-[10px] p-3">
                      <p className="text-[13px] font-medium text-text-primary mb-2">{subj}</p>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        {[['Rata-rata', avg], ['Min', min], ['Max', max]].map(([label, val]) => (
                          <div key={label as string}>
                            <div className="text-[18px] font-medium text-text-primary">{val}</div>
                            <div className="text-[10px] text-text-muted">{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
