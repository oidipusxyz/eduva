'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import { isAuthenticated } from '@/lib/auth'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login')
    }
  }, [router])

  return (
    <div className="flex min-h-screen bg-bg-page">
      <Sidebar />
      <main className="flex-1 md:ml-[72px] px-4 md:px-6 pt-4 md:pt-6 pb-24 md:pb-6 max-w-full md:max-w-[1200px]">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
