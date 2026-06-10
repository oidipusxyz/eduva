'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const adminItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
  { href: '/admin/teachers', label: 'Kelola Guru', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { href: '/admin/reports', label: 'Laporan Sekolah', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg> },
]

const teacherItems = [
  { href: '/dashboard', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
  { href: '/classes', label: 'Kelas', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { href: '/attendance', label: 'Absensi', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg> },
  { href: '/content', label: 'Materi', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
  { href: '/grades', label: 'Nilai', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
  { href: '/heatmap', label: 'Heatmap', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="4" height="4" rx="0.5" /><rect x="10" y="3" width="4" height="4" rx="0.5" /><rect x="17" y="3" width="4" height="4" rx="0.5" /><rect x="3" y="10" width="4" height="4" rx="0.5" /><rect x="10" y="10" width="4" height="4" rx="0.5" /><rect x="17" y="10" width="4" height="4" rx="0.5" /><rect x="3" y="17" width="4" height="4" rx="0.5" /><rect x="10" y="17" width="4" height="4" rx="0.5" /><rect x="17" y="17" width="4" height="4" rx="0.5" /></svg> },
  { href: '/journals', label: 'Jurnal', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg> },
  { href: '/reports', label: 'Laporan Kelas', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg> },
  { href: '/alerts', label: 'Alert', showAlertDot: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    api.get<{ unresolved_alerts: number }>('/analytics/summary')
      .then((d) => setAlertCount(d?.unresolved_alerts ?? 0))
      .catch(() => {})
  }, [])

  const renderItem = (item: { href: string; label: string; icon: React.ReactNode; showAlertDot?: boolean }) => {
    const active = pathname === item.href || pathname.startsWith(item.href + '/')
    const showDot = item.showAlertDot && alertCount > 0
    return (
      <Link
        key={item.href}
        href={item.href}
        title={item.label}
        className={[
          'relative flex items-center gap-3 px-3 h-[40px] rounded-[10px] transition-all',
          active
            ? 'bg-primary-muted text-[#16A34A]'
            : 'text-text-muted hover:bg-border-muted hover:text-text-secondary',
        ].join(' ')}
      >
        <span className="flex-shrink-0">{item.icon}</span>
        <span className="hidden lg:block text-[13px] font-medium">{item.label}</span>
        {showDot && (
          <span className="absolute top-2 left-[26px] lg:static lg:ml-auto min-w-[18px] h-[18px] bg-[#DC2626] rounded-full flex items-center justify-center text-white text-[10px] font-medium px-1">
            {alertCount > 9 ? '9+' : alertCount}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-[72px] lg:w-[220px] bg-bg-surface border-r border-border-default flex-col py-4 z-50 transition-all">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-3">
        <div className="w-9 h-9 rounded-[10px] bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[15px] font-medium">E</span>
        </div>
        <div className="hidden lg:block">
          <div className="text-[15px] font-semibold text-text-primary leading-tight">Eduva</div>
          <div className="text-[10px] text-primary font-medium tracking-wide uppercase">Admin</div>
        </div>
      </div>
      {/* Admin badge tablet only */}
      <div className="lg:hidden text-[8px] text-primary font-medium tracking-wide uppercase text-center mb-2">Admin</div>

      <nav className="flex flex-col gap-0.5 flex-1 px-2 overflow-y-auto">
        {/* Section label */}
        <div className="hidden lg:block text-[10px] text-text-muted font-medium uppercase tracking-wider px-3 py-1.5">Admin</div>
        {adminItems.map(renderItem)}

        <div className="mx-2 border-t border-border-muted my-2" />
        <div className="hidden lg:block text-[10px] text-text-muted font-medium uppercase tracking-wider px-3 py-1.5">Kelas Saya</div>

        {teacherItems.map(renderItem)}
      </nav>

      <div className="px-2">
        <button
          title="Keluar"
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}
          className="w-full flex items-center gap-3 px-3 h-[40px] rounded-[10px] text-text-muted hover:bg-border-muted hover:text-text-secondary transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="hidden lg:block text-[13px] font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  )
}
