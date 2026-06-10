'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const sections = [
  { id: 'pengenalan', label: 'Pengenalan' },
  { id: 'akun', label: 'Akun & Akses' },
  { id: 'admin', label: 'Panduan Admin' },
  { id: 'guru', label: 'Panduan Guru' },
  { id: 'siswa', label: 'Panduan Siswa' },
  { id: 'teknis', label: 'Dokumentasi Teknis' },
]

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <h2 className="text-[22px] font-semibold text-text-primary mb-6 pb-3 border-b border-border-default">{title}</h2>
      {children}
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-[16px] font-medium text-text-primary mb-3">{title}</h3>
      {children}
    </div>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 mb-3">
      <div className="w-6 h-6 rounded-full bg-primary text-white text-[12px] font-medium flex items-center justify-center flex-shrink-0 mt-0.5">{n}</div>
      <div className="text-[14px] text-text-secondary leading-relaxed">{children}</div>
    </div>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="bg-bg-surface">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-2.5 font-medium text-text-secondary border border-border-default">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-bg-page'}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-text-secondary border border-border-default">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-[#1E1E1E] text-[#D4D4D4] rounded-[10px] px-4 py-3 text-[13px] overflow-x-auto mb-4 leading-relaxed">
      <code>{children}</code>
    </pre>
  )
}

function Badge({ color, children }: { color: 'green' | 'blue' | 'purple'; children: React.ReactNode }) {
  const cls = {
    green: 'bg-positive-bg text-positive-text border-positive-border',
    blue: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
    purple: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
  }[color]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${cls}`}>{children}</span>
  )
}

function InfoBox({ type, children }: { type: 'info' | 'warning' | 'tip'; children: React.ReactNode }) {
  const styles = {
    info: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]',
    warning: 'bg-warning-bg border-warning-border text-warning-text',
    tip: 'bg-positive-bg border-positive-border text-positive-text',
  }[type]
  const icons = { info: 'ℹ️', warning: '⚠️', tip: '💡' }
  return (
    <div className={`rounded-[10px] border px-4 py-3 mb-4 flex gap-3 text-[13px] ${styles}`}>
      <span className="flex-shrink-0">{icons[type]}</span>
      <div>{children}</div>
    </div>
  )
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('pengenalan')
  const [menuOpen, setMenuOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-bg-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-surface border-b border-border-default px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] bg-primary flex items-center justify-center">
              <span className="text-white text-[13px] font-medium">E</span>
            </div>
            <span className="text-[15px] font-semibold text-text-primary">Eduva</span>
          </Link>
          <span className="text-text-muted text-[14px] hidden sm:block">/ Dokumentasi</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[13px] text-text-muted hover:text-text-primary transition-colors hidden sm:block">
            Masuk ke App →
          </Link>
          <button
            className="md:hidden p-1.5 rounded-[8px] hover:bg-border-muted text-text-muted"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden bg-bg-surface border-b border-border-default px-4 py-3">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 px-3 rounded-[8px] text-[13px] mb-0.5 ${activeSection === s.id ? 'bg-primary-muted text-[#16A34A] font-medium' : 'text-text-muted'}`}
            >
              {s.label}
            </a>
          ))}
        </div>
      )}

      <div className="flex max-w-[1200px] mx-auto">
        {/* Sidebar */}
        <aside className="hidden md:block w-[220px] flex-shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto py-8 px-4">
          <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-3 px-3">Isi Dokumen</p>
          <nav className="flex flex-col gap-0.5">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={[
                  'block py-1.5 px-3 rounded-[8px] text-[13px] transition-all',
                  activeSection === s.id
                    ? 'bg-primary-muted text-[#16A34A] font-medium'
                    : 'text-text-muted hover:text-text-secondary hover:bg-border-muted',
                ].join(' ')}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main ref={contentRef} className="flex-1 min-w-0 px-4 md:px-10 py-10">

          {/* ── PENGENALAN ── */}
          <Section id="pengenalan" title="Pengenalan">
            <p className="text-[15px] text-text-secondary leading-relaxed mb-6">
              <strong>Eduva</strong> adalah aplikasi manajemen kelas berbasis web untuk guru SMK. Diakses lewat browser — desktop maupun HP — tanpa perlu install aplikasi.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { icon: '👩‍🏫', label: 'Admin', desc: 'Kelola seluruh guru, pantau kehadiran sekolah, export laporan' },
                { icon: '📋', label: 'Guru', desc: 'Kelola kelas, absensi, materi, nilai, dan jurnal mengajar' },
                { icon: '🎓', label: 'Siswa', desc: 'Input absensi, lihat materi, kumpul tugas, dan pantau poin' },
              ].map((r) => (
                <div key={r.label} className="bg-bg-surface border border-border-default rounded-[12px] p-4">
                  <div className="text-[28px] mb-2">{r.icon}</div>
                  <div className="text-[14px] font-medium text-text-primary mb-1">{r.label}</div>
                  <div className="text-[12px] text-text-muted">{r.desc}</div>
                </div>
              ))}
            </div>
            <SubSection title="Teknologi">
              <Table
                headers={['Komponen', 'Teknologi', 'Hosting']}
                rows={[
                  ['Frontend', 'Next.js 16, Tailwind CSS v4', 'Vercel'],
                  ['Backend', 'Express.js + TypeScript', 'Railway'],
                  ['Database', 'PostgreSQL (Supabase)', 'Supabase'],
                ]}
              />
            </SubSection>
            <SubSection title="URL Produksi">
              <Table
                headers={['Layanan', 'URL']}
                rows={[
                  ['Aplikasi (Frontend)', 'https://eduva-gamma.vercel.app'],
                  ['API (Backend)', 'https://eduva-production.up.railway.app/api'],
                  ['Database', 'Supabase Dashboard'],
                ]}
              />
            </SubSection>
          </Section>

          {/* ── AKUN & AKSES ── */}
          <Section id="akun" title="Akun & Akses">
            <Table
              headers={['Role', 'Login di', 'Dibuat oleh', 'Format Password']}
              rows={[
                ['Admin', '/login', 'Upgrade via SQL', 'Bebas (min. 8 karakter)'],
                ['Guru', '/login', 'Daftar sendiri atau dibuat Admin', 'Bebas (min. 8 karakter)'],
                ['Siswa', '/student/login', 'Guru (di halaman kelas)', 'edu + 4 angka (contoh: edu4821)'],
              ]}
            />

            <SubSection title="Membuat Akun Admin Pertama">
              <Step n={1}>Daftar akun guru biasa di <code className="bg-border-muted px-1.5 py-0.5 rounded text-[12px]">/register</code></Step>
              <Step n={2}>Buka Supabase → SQL Editor, jalankan:</Step>
              <Code>{`UPDATE teachers\nSET role = 'admin'\nWHERE email = 'emailmu@sekolah.sch.id';`}</Code>
              <Step n={3}>Login di <code className="bg-border-muted px-1.5 py-0.5 rounded text-[12px]">/login</code> — sistem otomatis redirect ke <code className="bg-border-muted px-1.5 py-0.5 rounded text-[12px]">/admin/dashboard</code></Step>
            </SubSection>

            <SubSection title="Login Siswa">
              <Step n={1}>Buka <code className="bg-border-muted px-1.5 py-0.5 rounded text-[12px]">/student/login</code></Step>
              <Step n={2}>Masukkan <strong>Nama Lengkap</strong> dan <strong>Password</strong></Step>
              <Step n={3}>Password default siswa: <code className="bg-border-muted px-1.5 py-0.5 rounded text-[12px]">edu</code> + 4 angka dari username (ditampilkan saat guru menambah siswa)</Step>
              <InfoBox type="tip">Password siswa bisa dilihat guru saat pertama kali menambahkan siswa ke kelas. Catat dan bagikan ke siswa yang bersangkutan.</InfoBox>
            </SubSection>
          </Section>

          {/* ── PANDUAN ADMIN ── */}
          <Section id="admin" title="Panduan Admin">
            <InfoBox type="info">Admin memiliki akses penuh: semua fitur guru + manajemen akun guru + laporan sekolah.</InfoBox>

            <SubSection title="Dashboard Admin (/admin/dashboard)">
              <p className="text-[13px] text-text-secondary mb-3">Tampilan ringkasan seluruh sekolah:</p>
              <ul className="list-disc list-inside text-[13px] text-text-secondary space-y-1.5 mb-3">
                <li>Total guru, kelas, siswa aktif</li>
                <li>Rata-rata kehadiran 30 hari terakhir</li>
                <li>Alert siswa dengan absensi bermasalah</li>
                <li>Tabel performa kehadiran per kelas</li>
              </ul>
            </SubSection>

            <SubSection title="Kelola Guru (/admin/teachers)">
              <p className="text-[13px] text-text-secondary mb-3">Dari halaman ini admin bisa:</p>
              <ul className="list-disc list-inside text-[13px] text-text-secondary space-y-1.5 mb-3">
                <li>Melihat semua guru beserta jumlah kelas dan sesi yang diajar</li>
                <li>Menambah guru baru (nama, email, password)</li>
                <li>Menonaktifkan/mengaktifkan akun guru</li>
              </ul>
              <InfoBox type="warning">Akun dengan role <strong>admin</strong> tidak bisa dinonaktifkan untuk mencegah hilangnya akses.</InfoBox>
            </SubSection>

            <SubSection title="Laporan Sekolah (/admin/reports)">
              <ul className="list-disc list-inside text-[13px] text-text-secondary space-y-1.5 mb-3">
                <li>Tabel kehadiran per kelas dengan progress bar</li>
                <li>Export ke <strong>PDF</strong> (via jsPDF)</li>
                <li>Export ke <strong>Excel</strong></li>
              </ul>
            </SubSection>

            <SubSection title="Fitur Guru (Admin juga bisa)">
              <p className="text-[13px] text-text-secondary">Admin memiliki akses ke semua menu guru. Lihat <a href="#guru" className="text-primary underline">Panduan Guru</a> untuk detail fitur-fitur tersebut.</p>
            </SubSection>
          </Section>

          {/* ── PANDUAN GURU ── */}
          <Section id="guru" title="Panduan Guru">

            <SubSection title="Dashboard (/dashboard)">
              <ul className="list-disc list-inside text-[13px] text-text-secondary space-y-1.5">
                <li>Ringkasan: sesi hari ini, tugas aktif, total siswa, jumlah alert</li>
                <li>Grafik tren kehadiran dan perkembangan nilai per kelas</li>
                <li>Progress kehadiran per kelas</li>
              </ul>
            </SubSection>

            <SubSection title="Manajemen Kelas (/classes)">
              <Step n={1}>Klik <strong>+ Kelas Baru</strong>, isi nama kelas dan tingkat (contoh: XI RPL 1)</Step>
              <Step n={2}>Klik <strong>Kelola</strong> untuk masuk ke detail kelas</Step>
              <Step n={3}>Di dalam kelas: tambah siswa dengan nama lengkap. Sistem otomatis generate username dan password default</Step>
              <InfoBox type="tip">Password siswa ditampilkan sekali saat pertama dibuat. Catat dan bagikan ke siswa.</InfoBox>
            </SubSection>

            <SubSection title="Absensi (/attendance)">
              <p className="text-[13px] text-text-secondary mb-3">Guru membuat <strong>sesi absensi</strong> per kelas:</p>
              <Step n={1}>Pilih kelas → Klik <strong>Mulai Sesi Absensi</strong></Step>
              <Step n={2}>Sistem generate <strong>PIN 6 digit</strong> yang berlaku selama sesi</Step>
              <Step n={3}>Bagikan PIN ke siswa — atau klik <strong>Tampilkan QR Code</strong> untuk mode scan</Step>
              <Step n={4}>Siswa input PIN atau scan QR di portal mereka</Step>
              <Step n={5}>Klik <strong>Tutup Sesi</strong> jika sudah selesai</Step>
              <InfoBox type="info">PIN otomatis kadaluarsa saat sesi ditutup. Siswa yang belum absen setelah sesi ditutup tercatat <strong>Absen</strong>.</InfoBox>
            </SubSection>

            <SubSection title="Materi & Tugas (/content)">
              <ul className="list-disc list-inside text-[13px] text-text-secondary space-y-1.5 mb-3">
                <li>Tambah materi dengan judul, deskripsi, dan link eksternal (Google Drive, YouTube, dll)</li>
                <li>Tandai item sebagai <strong>Tugas</strong> dan set deadline</li>
                <li>Siswa mendapat <strong>+15 poin</strong> jika kumpul tepat waktu, <strong>+5 poin</strong> jika terlambat</li>
              </ul>
              <InfoBox type="info">Tidak ada upload file langsung — semua materi menggunakan link eksternal.</InfoBox>
            </SubSection>

            <SubSection title="Nilai (/grades)">
              <ul className="list-disc list-inside text-[13px] text-text-secondary space-y-1.5">
                <li>Input nilai per siswa per mata pelajaran</li>
                <li>Tabel rekapitulasi nilai semua siswa</li>
              </ul>
            </SubSection>

            <SubSection title="Heatmap Kehadiran (/heatmap)">
              <ul className="list-disc list-inside text-[13px] text-text-secondary space-y-1.5">
                <li><strong>Per Kelas</strong>: visualisasi tingkat kehadiran harian selama 6 bulan</li>
                <li><strong>Per Siswa</strong>: pilih siswa untuk melihat pola kehadiran individual</li>
              </ul>
            </SubSection>

            <SubSection title="Jurnal Mengajar (/journals)">
              <p className="text-[13px] text-text-secondary">Catat jurnal harian per kelas: tanggal, mata pelajaran, topik yang diajarkan, dan catatan tambahan.</p>
            </SubSection>

            <SubSection title="Laporan (/reports)">
              <ul className="list-disc list-inside text-[13px] text-text-secondary space-y-1.5">
                <li>Rekap kehadiran per kelas dalam rentang tanggal tertentu</li>
                <li>Export PDF atau Excel</li>
              </ul>
            </SubSection>

            <SubSection title="Alert Siswa (/alerts)">
              <p className="text-[13px] text-text-secondary">Sistem otomatis mendeteksi siswa yang absen <strong>3 kali berturut-turut</strong> atau memiliki kehadiran di bawah ambang batas. Guru bisa tandai alert sebagai selesai ditangani.</p>
            </SubSection>
          </Section>

          {/* ── PANDUAN SISWA ── */}
          <Section id="siswa" title="Panduan Siswa">
            <InfoBox type="info">Siswa mengakses portal di <code className="bg-white px-1.5 py-0.5 rounded text-[12px]">/student/login</code> — bisa dibuka di browser HP tanpa install apapun (PWA).</InfoBox>

            <SubSection title="Login">
              <Step n={1}>Buka browser → ketik alamat app → pilih <strong>Login Siswa</strong></Step>
              <Step n={2}>Masukkan <strong>Nama Lengkap</strong> (harus sama persis, tidak case-sensitive)</Step>
              <Step n={3}>Masukkan <strong>Password</strong> yang diberikan guru (format: edu + 4 angka)</Step>
            </SubSection>

            <SubSection title="Input Absensi (/student/attendance)">
              <p className="text-[13px] text-text-secondary mb-3">Ada dua cara input absensi:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div className="bg-bg-surface border border-border-default rounded-[10px] p-4">
                  <div className="text-[13px] font-medium text-text-primary mb-2">🔢 Input PIN</div>
                  <p className="text-[12px] text-text-muted">Masukkan PIN 6 digit yang diberikan guru, klik Kirim.</p>
                </div>
                <div className="bg-bg-surface border border-border-default rounded-[10px] p-4">
                  <div className="text-[13px] font-medium text-text-primary mb-2">📷 Scan QR Code</div>
                  <p className="text-[12px] text-text-muted">Klik Scan QR Code, arahkan kamera ke QR yang ditampilkan guru.</p>
                </div>
              </div>
              <p className="text-[13px] text-text-secondary">Tab <strong>Riwayat</strong> menampilkan heatmap kehadiran 6 bulan terakhir dan daftar sesi.</p>
            </SubSection>

            <SubSection title="Materi & Tugas (/student/content)">
              <ul className="list-disc list-inside text-[13px] text-text-secondary space-y-1.5">
                <li>Lihat semua materi yang dibagikan guru</li>
                <li>Klik link untuk membuka materi eksternal</li>
                <li>Tugas: klik <strong>Kumpul Tugas (+15 poin)</strong> untuk submit tepat waktu</li>
                <li>Setelah deadline: tombol berubah jadi <strong>+5 poin</strong> (terlambat)</li>
              </ul>
            </SubSection>

            <SubSection title="Sistem Gamifikasi">
              <Table
                headers={['Aktivitas', 'Poin', 'Keterangan']}
                rows={[
                  ['Absensi hadir', '+10 poin', 'Setiap sesi'],
                  ['Kumpul tugas tepat waktu', '+15 poin', 'Sebelum deadline'],
                  ['Kumpul tugas terlambat', '+5 poin', 'Setelah deadline'],
                  ['Streak kehadiran', 'Streak 🔥', '3 hari berturut-turut'],
                ]}
              />
            </SubSection>

            <SubSection title="Badge (/student/badges)">
              <p className="text-[13px] text-text-secondary mb-3">Badge diberikan otomatis saat siswa memenuhi kondisi tertentu:</p>
              <Table
                headers={['Badge', 'Kondisi']}
                rows={[
                  ['🎯 Hadir Perdana', 'Hadir pertama kali'],
                  ['🔥 Streak 3 Hari', 'Hadir 3 hari berturut-turut'],
                  ['⭐ 50 Poin', 'Kumpulkan 50 poin'],
                  ['🏆 100 Poin', 'Kumpulkan 100 poin'],
                  ['📚 Rajin Belajar', 'Submit 5 tugas'],
                ]}
              />
            </SubSection>

            <SubSection title="Leaderboard (/student/leaderboard)">
              <p className="text-[13px] text-text-secondary">Peringkat poin seluruh siswa di kelas yang sama. Top 3 mendapat emoji medali 🥇🥈🥉. Posisi kamu sendiri ditandai dengan chip <Badge color="green">Kamu</Badge>.</p>
            </SubSection>
          </Section>

          {/* ── TEKNIS ── */}
          <Section id="teknis" title="Dokumentasi Teknis">

            <SubSection title="Arsitektur">
              <Code>{`Browser (Next.js PWA)
    ↕ HTTPS (REST API + JWT)
Express.js API (Railway)
    ↕ Supabase JS Client
PostgreSQL (Supabase)`}</Code>
              <Table
                headers={['Folder', 'Isi']}
                rows={[
                  ['frontend/', 'Next.js 16 App Router, Tailwind CSS v4'],
                  ['backend/', 'Express.js + TypeScript, compiled ke dist/'],
                  ['backend/src/routes/', 'Route handler per fitur'],
                  ['backend/src/db/', 'Supabase client + SQL schema files'],
                  ['frontend/app/', 'Pages (dashboard, admin, student, auth)'],
                  ['frontend/components/', 'UI components + layout components'],
                  ['frontend/lib/', 'API client, auth helpers, types'],
                ]}
              />
            </SubSection>

            <SubSection title="Setup Lokal">
              <p className="text-[13px] text-text-secondary font-medium mb-2">1. Clone & install</p>
              <Code>{`git clone https://github.com/oidipusxyz/eduva.git
cd eduva

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install`}</Code>

              <p className="text-[13px] text-text-secondary font-medium mb-2">2. Environment variables</p>
              <p className="text-[13px] text-text-secondary mb-2">Buat <code className="bg-border-muted px-1.5 py-0.5 rounded text-[12px]">backend/.env</code>:</p>
              <Code>{`PORT=4000
JWT_SECRET=random-string-minimal-32-karakter
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
FRONTEND_URL=http://localhost:3000`}</Code>

              <p className="text-[13px] text-text-secondary mb-2">Buat <code className="bg-border-muted px-1.5 py-0.5 rounded text-[12px]">frontend/.env.local</code>:</p>
              <Code>{`NEXT_PUBLIC_API_URL=http://localhost:4000/api`}</Code>

              <p className="text-[13px] text-text-secondary font-medium mb-2">3. Jalankan</p>
              <Code>{`# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev`}</Code>
              <p className="text-[13px] text-text-muted">Frontend: http://localhost:3000 · Backend: http://localhost:4000</p>
            </SubSection>

            <SubSection title="Database Schema">
              <p className="text-[13px] text-text-secondary mb-3">File SQL ada di <code className="bg-border-muted px-1.5 py-0.5 rounded text-[12px]">backend/src/db/</code>. Jalankan berurutan di Supabase SQL Editor:</p>
              <Table
                headers={['File', 'Isi']}
                rows={[
                  ['schema.sql', 'Tabel utama: teachers, classes, students, contents, grades, attendance_sessions, attendance_records'],
                  ['schema-phase2.sql', 'Tabel: journals, alerts, student_points, student_badges, badges'],
                  ['schema-phase3.sql', 'Tabel: gamification (streaks, leaderboard views)'],
                  ['schema-phase3-part2.sql', 'Tabel: student_submissions'],
                  ['schema-phase5-admin.sql', 'Kolom: teachers.role, teachers.is_active'],
                ]}
              />
              <InfoBox type="warning">Semua tabel menggunakan <strong>RLS dinonaktifkan</strong> — akses dikontrol lewat JWT di backend, bukan Supabase policies.</InfoBox>
            </SubSection>

            <SubSection title="Environment Variables Produksi">
              <p className="text-[13px] text-text-secondary font-medium mb-2">Railway (Backend):</p>
              <Table
                headers={['Key', 'Keterangan']}
                rows={[
                  ['PORT', 'Otomatis diset Railway (jangan hardcode)'],
                  ['JWT_SECRET', 'Random string panjang, jaga kerahasiaan'],
                  ['SUPABASE_URL', 'URL project Supabase'],
                  ['SUPABASE_SERVICE_KEY', 'Service role key (bukan anon key)'],
                  ['FRONTEND_URL', 'URL Vercel (dengan https://)'],
                ]}
              />
              <p className="text-[13px] text-text-secondary font-medium mb-2 mt-4">Vercel (Frontend):</p>
              <Table
                headers={['Key', 'Keterangan']}
                rows={[
                  ['NEXT_PUBLIC_API_URL', 'URL Railway + /api (contoh: https://xxx.up.railway.app/api)'],
                ]}
              />
            </SubSection>

            <SubSection title="Autentikasi">
              <p className="text-[13px] text-text-secondary mb-3">Sistem menggunakan <strong>JWT (JSON Web Token)</strong>:</p>
              <Table
                headers={['Role', 'JWT Payload', 'Storage']}
                rows={[
                  ['Guru/Admin', '{ id, role: "teacher"|"admin" }', 'localStorage → key: token'],
                  ['Siswa', '{ id, role: "student", class_id }', 'localStorage → key: student_token'],
                ]}
              />
              <p className="text-[13px] text-text-secondary mt-3">Token berlaku <strong>30 hari</strong>. Middleware backend memvalidasi token di setiap request protected.</p>
            </SubSection>

            <SubSection title="Deployment">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-bg-surface border border-border-default rounded-[10px] p-4">
                  <div className="text-[13px] font-medium text-text-primary mb-2">🔵 Vercel (Frontend)</div>
                  <ul className="text-[12px] text-text-muted space-y-1">
                    <li>• Root directory: <code>frontend/</code></li>
                    <li>• Framework: Next.js (auto-detect)</li>
                    <li>• Deploy otomatis saat push ke main</li>
                  </ul>
                </div>
                <div className="bg-bg-surface border border-border-default rounded-[10px] p-4">
                  <div className="text-[13px] font-medium text-text-primary mb-2">🟣 Railway (Backend)</div>
                  <ul className="text-[12px] text-text-muted space-y-1">
                    <li>• Root directory: <code>backend/</code></li>
                    <li>• Build: <code>npm install && npm run build</code></li>
                    <li>• Start: <code>npm start</code></li>
                    <li>• Node.js 20+ diperlukan</li>
                  </ul>
                </div>
              </div>
            </SubSection>

          </Section>

          <div className="border-t border-border-default pt-6 text-center text-[12px] text-text-muted">
            Eduva v1.0 · Dibuat untuk SMK Indonesia
          </div>

        </main>
      </div>
    </div>
  )
}
