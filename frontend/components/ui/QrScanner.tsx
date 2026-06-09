'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  onScan: (value: string) => void
  onClose: () => void
}

export default function QrScanner({ onScan, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scanner: any = null

    async function startScanner() {
      const { Html5Qrcode } = await import('html5-qrcode')
      const id = 'qr-reader-container'
      scanner = new Html5Qrcode(id)
      scannerRef.current = scanner

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText: string) => {
            onScan(decodedText)
          },
          () => {}
        )
        setStarted(true)
      } catch {
        setError('Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.')
      }
    }

    startScanner()

    return () => {
      if (scanner) {
        scanner.stop().catch(() => null)
      }
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="bg-bg-surface rounded-[16px] w-full max-w-[360px] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
          <span className="text-[14px] font-medium text-text-primary">Scan QR Code</span>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-danger-text">{error}</p>
              <button onClick={onClose} className="mt-3 text-[12px] text-primary underline">Tutup</button>
            </div>
          ) : (
            <>
              <div
                id="qr-reader-container"
                ref={containerRef}
                className="w-full rounded-[12px] overflow-hidden"
                style={{ minHeight: 260 }}
              />
              {!started && (
                <p className="text-center text-[12px] text-text-muted mt-2">Mengaktifkan kamera...</p>
              )}
              <p className="text-center text-[12px] text-text-muted mt-2">Arahkan kamera ke QR Code absensi</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
