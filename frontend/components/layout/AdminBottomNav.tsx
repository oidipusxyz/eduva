'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/admin/dashboard',
    label: 'Overview',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  },
  {
    href: '/admin/teachers',
    label: 'Guru',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    href: '/admin/reports',
    label: 'Laporan',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>,
  },
  {
    href: '/login',
    label: 'Keluar',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    logout: true,
  },
]

export default function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-bg-surface border-t border-border-default flex items-center z-50 md:hidden">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        if (item.logout) {
          return (
            <button
              key={item.href}
              onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full text-danger-text"
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-all',
              active ? 'text-[#16A34A]' : 'text-text-muted',
            ].join(' ')}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
