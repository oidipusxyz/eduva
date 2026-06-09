'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/admin/dashboard',
    label: 'Overview',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  },
  {
    href: '/admin/teachers',
    label: 'Guru',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    href: '/admin/reports',
    label: 'Laporan',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-0 left-0 h-screen w-[72px] bg-bg-surface border-r border-border-default flex flex-col items-center py-4 gap-1 z-50">
      <div className="w-10 h-10 rounded-[12px] bg-primary flex items-center justify-center mb-1">
        <span className="text-white text-[15px] font-medium">E</span>
      </div>
      <div className="text-[8px] text-primary font-medium mb-3 tracking-wide uppercase">Admin</div>

      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={[
                'w-[46px] h-[46px] rounded-[12px] flex items-center justify-center transition-all',
                active
                  ? 'bg-primary-muted text-[#16A34A]'
                  : 'text-text-muted hover:bg-border-muted hover:text-text-secondary',
              ].join(' ')}
            >
              {item.icon}
            </Link>
          )
        })}
      </nav>

      <button
        className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-text-muted hover:bg-border-muted hover:text-text-secondary transition-all"
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
