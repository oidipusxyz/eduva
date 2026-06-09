'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'

export default function StudentLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post<{ token: string }>('/student/login', form)
      localStorage.setItem('student_token', res.token)
      router.push('/student/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center p-4">
      <div className="w-full max-w-[360px]">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-[10px] bg-primary flex items-center justify-center">
            <span className="text-white text-[16px] font-medium">E</span>
          </div>
          <div>
            <span className="text-[18px] font-medium text-text-primary">Eduva</span>
            <span className="text-[12px] text-text-muted ml-2">Portal Siswa</span>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-default rounded-[14px] p-6">
          <h1 className="text-[18px] font-medium text-text-primary mb-1">Masuk Siswa</h1>
          <p className="text-[13px] text-text-muted mb-6">Masuk dengan nama lengkap dan password kamu</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nama Lengkap"
              id="full_name"
              placeholder="Ahmad Fauzi"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            {error && (
              <p className="text-[12px] text-danger-text bg-danger-bg border border-danger-border rounded-[8px] px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-1">
              Masuk
            </Button>
          </form>
        </div>

        <p className="text-center text-[12px] text-text-muted mt-4">
          Kamu guru?{' '}
          <a href="/login" className="text-primary hover:underline">Masuk sebagai guru</a>
        </p>
      </div>
    </div>
  )
}
