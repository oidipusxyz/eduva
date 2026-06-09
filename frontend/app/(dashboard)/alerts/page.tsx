'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/layout/PageHeader'
import { api } from '@/lib/api'

interface Alert {
  id: string
  student_id: string
  class_id: string
  consecutive_absences: number
  alerted_at: string
  resolved: boolean
  students: { full_name: string }
  classes: { name: string; grade: string }
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState<string | null>(null)

  useEffect(() => {
    api.get<Alert[]>('/alerts')
      .then((data) => setAlerts(Array.isArray(data) ? data : []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleResolve(id: string) {
    setResolving(id)
    try {
      await api.put(`/alerts/${id}/resolve`, {})
      setAlerts((prev) => prev.filter((a) => a.id !== id))
    } catch {
      alert('Gagal menyelesaikan alert')
    } finally {
      setResolving(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Smart Alert"
        subtitle="Siswa yang perlu perhatian guru"
      />

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[80px] bg-border-muted rounded-[14px] animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-[40px] mb-3">✅</div>
          <p className="text-[14px] font-medium text-text-primary">Tidak ada alert aktif</p>
          <p className="text-[13px] text-text-muted mt-1">Semua siswa hadir dengan baik</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Info banner */}
          <div className="bg-warning-bg border border-warning-border rounded-[14px] px-4 py-3 flex items-center gap-3 mb-2">
            <span className="text-[18px]">⚠️</span>
            <p className="text-[13px] text-warning-text">
              <span className="font-medium">{alerts.length} siswa</span> terdeteksi tidak hadir 3x berturut-turut. Segera ambil tindakan.
            </p>
          </div>

          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className="border-warning-border bg-warning-bg hover:brightness-97 transition-all"
              style={{ borderColor: '#FDE68A' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[14px] font-medium text-text-primary">
                      {alert.students?.full_name}
                    </span>
                    <Badge variant="danger">{alert.consecutive_absences}x Absen</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-text-muted">
                    <span>{alert.classes?.name}</span>
                    <span>·</span>
                    <span>{alert.classes?.grade}</span>
                    <span>·</span>
                    <span>
                      {new Date(alert.alerted_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={resolving === alert.id}
                  onClick={() => handleResolve(alert.id)}
                >
                  Tandai Selesai
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
