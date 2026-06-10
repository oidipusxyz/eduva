'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const adminItems = [
  {
    href: '/admin/dashboard',
    label: 'Overview',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  },
  {
    href: '/admin/teachers',
    label: 'Kelola Guru',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    href: '/admin/reports',
    label: 'Laporan Admin',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>,
  },
]

const teacherItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  },
  {
    href: '/classes',
    label: 'Kelas',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    href: '/attendance',
    label: 'Absensi',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
  },
  {
    href: '/content',
    label: 'Materi',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  },
  {
    href: '/grades',
    label: 'Nilai',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  },
  {
    href: '/heatmap',
    label: 'Heatmap',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="4" height="4" rx="0.5" /><rect x="10" y="3" width="4" height="4" rx="0.5" /><rect x="17" y="3" width="4" height="4" rx="0.5" /><rect x="3" y="10" width="4" height="4" rx="0.5" /><rect x="10" y="10" width="4" height="4" rx="0.5" /><rect x="17" y="10" width="4" height="4" rx="0.5" /><rect x="3" y="17" width="4" height="4" rx="0.5" /><rect x="10" y="17" width="4" height="4" rx="0.5" /><rect x="17" y="17" width="4" height="4" rx="0.5" /></svg>,
  },
  {
    href: '/journals',
    label: 'Jurnal',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
  },
  {
    href: '/reports',
    label: 'Laporan',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>,
  },
  {
    href: '/alerts',
    label: 'Alert',
    showAlertDot: true,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    api.get<{ unresolved_alerts: number }>('/analytics/summary')
      .then((d) => setAlertCount(d?.unresolved_alerts ?? 0))
      .catch(() => {})
  }, [])

  const renderItem = (item: typeof teacherItems[0]) => {
    const active = pathname === item.href || pathname.startsWith(item.href + '/')
    const showDot = 'showAlertDot' in item && item.showAlertDot && alertCount > 0
    return (
      <Link
        key={item.href}
        href={item.href}
        title={item.label}
        className={[
          'relative w-[46px] h-[46px] rounded-[12px] flex items-center justify-center transition-all flex-shrink-0',
          active
            ? 'bg-primary-muted text-[#16A34A]'
            : 'text-text-muted hover:bg-border-muted hover:text-text-secondary',
        ].join(' ')}
      >
        {item.icon}
        {showDot && (
          <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] bg-[#DC2626] rounded-full flex items-center justify-center text-white text-[9px] font-medium px-0.5">
            {alertCount > 9 ? '9+' : alertCount}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-[72px] bg-bg-surface border-r border-border-default flex-col items-center py-4 gap-1 z-50">
      <div className="w-10 h-10 rounded-[12px] bg-primary flex items-center justify-center mb-1">
        <span className="text-white text-[15px] font-medium">E</span>
      </div>
      <div className="text-[8px] text-primary font-medium mb-2 tracking-wide uppercase">Admin</div>

      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-2 overflow-y-auto">
        {adminItems.map(renderItem)}

        <div className="w-8 border-t border-border-muted my-2" />
        <div className="text-[8px] text-text-muted font-medium tracking-wide uppercase mb-1">Kelas</div>

        {teacherItems.map(renderItem)}
      </nav>

      <button
        className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-text-muted hover:bg-border-muted hover:text-text-secondary transition-all flex-shrink-0"
        title="Keluar"
        onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </aside>
  )
}
