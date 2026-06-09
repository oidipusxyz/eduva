'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, isAdmin } from '@/lib/auth'
import AdminSidebar from '@/components/layout/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return }
    if (!isAdmin()) { router.replace('/dashboard') }
  }, [router])

  return (
    <div className="flex min-h-screen bg-bg-page">
      <AdminSidebar />
      <main className="flex-1 ml-[72px] p-6 max-w-[1200px]">
        {children}
      </main>
    </div>
  )
}
