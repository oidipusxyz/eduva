'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, isAdmin } from '@/lib/auth'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminBottomNav from '@/components/layout/AdminBottomNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return }
    if (!isAdmin()) { router.replace('/dashboard') }
  }, [router])

  return (
    <div className="flex min-h-screen bg-bg-page">
      <AdminSidebar />
      <main className="flex-1 md:ml-[72px] lg:ml-[220px] px-4 md:px-6 pt-4 md:pt-6 pb-24 md:pb-6 min-w-0">
        <div className="max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
      <AdminBottomNav />
    </div>
  )
}
