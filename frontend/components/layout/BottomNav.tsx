'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const mainItems = [
  {
    href: '/dashboard',
    label: 'Beranda',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  },
  {
    href: '/attendance',
    label: 'Absensi',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
  },
  {
    href: '/classes',
    label: 'Kelas',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    href: '/content',
    label: 'Materi',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  },
]

const moreItems = [
  { href: '/grades', label: 'Nilai', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
  { href: '/heatmap', label: 'Heatmap', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="4" height="4" rx="0.5" /><rect x="10" y="3" width="4" height="4" rx="0.5" /><rect x="17" y="3" width="4" height="4" rx="0.5" /><rect x="3" y="10" width="4" height="4" rx="0.5" /><rect x="10" y="10" width="4" height="4" rx="0.5" /><rect x="17" y="10" width="4" height="4" rx="0.5" /><rect x="3" y="17" width="4" height="4" rx="0.5" /><rect x="10" y="17" width="4" height="4" rx="0.5" /><rect x="17" y="17" width="4" height="4" rx="0.5" /></svg> },
  { href: '/journals', label: 'Jurnal', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg> },
  { href: '/reports', label: 'Laporan', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg> },
  { href: '/alerts', label: 'Alert', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    api.get<{ unresolved_alerts: number }>('/analytics/summary')
      .then((d) => setAlertCount(d?.unresolved_alerts ?? 0))
      .catch(() => {})
  }, [])

  return (
    <>
      {/* More panel */}
      {showMore && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMore(false)} />
          <div className="fixed bottom-[64px] left-0 right-0 bg-bg-surface border-t border-border-default z-50 md:hidden p-3">
            <div className="grid grid-cols-5 gap-1">
              {moreItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                const isAlert = item.href === '/alerts'
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={[
                      'flex flex-col items-center gap-1 py-2 px-1 rounded-[10px] transition-all',
                      active ? 'bg-primary-muted text-[#16A34A]' : 'text-text-muted',
                    ].join(' ')}
                  >
                    <div className="relative">
                      {item.icon}
                      {isAlert && alertCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-[14px] h-[14px] bg-[#DC2626] rounded-full text-white text-[8px] flex items-center justify-center font-medium">
                          {alertCount > 9 ? '9+' : alertCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
            <div className="border-t border-border-muted mt-2 pt-2">
              <button
                onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-danger-text text-[13px] font-medium hover:bg-danger-bg transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Keluar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-bg-surface border-t border-border-default flex items-center z-50 md:hidden safe-bottom">
        {mainItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setShowMore(false)}
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
        {/* More button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={[
            'flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-all',
            showMore ? 'text-[#16A34A]' : 'text-text-muted',
          ].join(' ')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
          </svg>
          <span className="text-[10px] font-medium">Lainnya</span>
        </button>
      </nav>
    </>
  )
}
