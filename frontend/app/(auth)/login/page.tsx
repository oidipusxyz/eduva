'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'
import { setToken, parseJwt } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post<{ token: string }>('/auth/login', form)
      setToken(res.token)
      const payload = parseJwt(res.token)
      router.push(payload?.role === 'admin' ? '/admin/dashboard' : '/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[360px]">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-[10px] bg-primary flex items-center justify-center">
          <span className="text-white text-[16px] font-medium">E</span>
        </div>
        <span className="text-[18px] font-medium text-text-primary">Eduva</span>
      </div>

      <div className="bg-bg-surface border border-border-default rounded-[14px] p-6">
        <h1 className="text-[18px] font-medium text-text-primary mb-1">Masuk</h1>
        <p className="text-[13px] text-text-muted mb-6">Masuk ke akun guru Anda</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="guru@sekolah.sch.id"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
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
        Belum punya akun?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Daftar sekarang
        </Link>
      </p>
    </div>
  )
}
