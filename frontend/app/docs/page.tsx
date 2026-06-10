'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const sections = [
  { id: 'pengenalan', label: 'Pengenalan' },
  { id: 'infrastruktur', label: 'Infrastruktur & Layanan' },
  { id: 'akun', label: 'Akun & Akses' },
  { id: 'admin', label: 'Panduan Admin' },
  { id: 'guru', label: 'Panduan Guru' },
  { id: 'siswa', label: 'Panduan Siswa' },
  { id: 'teknis', label: 'Dokumentasi Teknis' },
  { id: 'phase5', label: 'Roadmap Phase 5' },
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

          {/* ── INFRASTRUKTUR ── */}
          <Section id="infrastruktur" title="Infrastruktur & Layanan">

            <SubSection title="Vercel — Frontend Hosting">
              <div className="bg-bg-surface border border-border-default rounded-[12px] p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[18px]">▲</span>
                  <span className="text-[14px] font-medium text-text-primary">Vercel</span>
                  <Badge color="green">Gratis (Hobby)</Badge>
                </div>
                <p className="text-[13px] text-text-secondary mb-3">
                  Hosting untuk aplikasi Next.js. Setiap push ke GitHub otomatis trigger deployment baru.
                </p>
                <Table
                  headers={['Fitur', 'Free (Hobby)', 'Pro ($20/bln)']}
                  rows={[
                    ['Deployment', 'Unlimited', 'Unlimited'],
                    ['Bandwidth', '100 GB/bln', '1 TB/bln'],
                    ['Custom Domain', '✓', '✓'],
                    ['Team Collaboration', '✗', '✓'],
                    ['Masa berlaku', 'Selamanya', 'Per bulan'],
                  ]}
                />
                <InfoBox type="tip">Free tier cukup untuk production selama traffic tidak melebihi 100GB/bulan. Untuk SMK dengan ratusan siswa, Free tier sudah lebih dari cukup.</InfoBox>
              </div>
            </SubSection>

            <SubSection title="Railway — Backend Hosting">
              <div className="bg-bg-surface border border-border-default rounded-[12px] p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[18px]">🚂</span>
                  <span className="text-[14px] font-medium text-text-primary">Railway</span>
                  <Badge color="blue">Hobby $5/bln</Badge>
                </div>
                <p className="text-[13px] text-text-secondary mb-3">
                  Hosting untuk Express.js backend API. Build otomatis dari GitHub menggunakan Nixpacks.
                </p>
                <Table
                  headers={['Paket', 'Harga', 'Keterangan']}
                  rows={[
                    ['Trial', 'Gratis ($5 kredit)', 'Kredit habis = service mati. Hanya untuk coba-coba.'],
                    ['Hobby', '$5/bln', '$5 kredit usage/bln. App kecil biasanya < $2/bln, sisa kredit hangus.'],
                    ['Pro', '$20/bln', 'Untuk traffic tinggi dan tim'],
                  ]}
                />
                <InfoBox type="warning">Saat ini Eduva menggunakan paket <strong>Hobby ($5/bln)</strong>. Untuk server Express.js sederhana, biaya aktual biasanya $1–2/bulan — jauh di bawah kredit $5 yang disediakan.</InfoBox>
              </div>
            </SubSection>

            <SubSection title="Supabase — Database">
              <div className="bg-bg-surface border border-border-default rounded-[12px] p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[18px]">⚡</span>
                  <span className="text-[14px] font-medium text-text-primary">Supabase</span>
                  <Badge color="green">Gratis (Free)</Badge>
                </div>
                <p className="text-[13px] text-text-secondary mb-3">
                  Database PostgreSQL cloud. Digunakan sebagai penyimpanan utama seluruh data — guru, siswa, kelas, absensi, nilai, dll.
                </p>
                <Table
                  headers={['Fitur', 'Free', 'Pro ($25/bln)']}
                  rows={[
                    ['Database storage', '500 MB', '8 GB'],
                    ['Jumlah project aktif', '2 project', 'Unlimited'],
                    ['Bandwidth', '5 GB/bln', '250 GB/bln'],
                    ['Inaktivitas', 'Paused setelah 7 hari tidak ada request', 'Tidak pernah paused'],
                    ['Backup', 'Manual', 'Otomatis harian'],
                  ]}
                />
                <InfoBox type="warning">
                  <strong>Perhatian:</strong> Supabase Free akan <strong>mem-pause project</strong> jika tidak ada request selama 7 hari berturut-turut. Untuk production, pastikan ada request rutin atau upgrade ke Pro ($25/bln).
                </InfoBox>
                <InfoBox type="tip">
                  500 MB cukup untuk ratusan hingga ribuan siswa. Estimasi: 1 siswa ≈ 2–5 KB data. Artinya 500 MB bisa menampung ~100.000+ siswa sebelum perlu upgrade.
                </InfoBox>
                <p className="text-[13px] text-text-secondary mt-3 mb-2 font-medium">Cara Eduva menggunakan Supabase:</p>
                <ul className="list-disc list-inside text-[13px] text-text-secondary space-y-1">
                  <li>Backend terhubung menggunakan <strong>Service Role Key</strong> (akses penuh, tanpa RLS)</li>
                  <li>RLS (Row Level Security) dinonaktifkan — keamanan ditangani oleh JWT di backend</li>
                  <li>Tidak menggunakan Supabase Auth — autentikasi custom dengan bcrypt + JWT</li>
                  <li>Tidak menggunakan Realtime — semua data di-fetch secara manual</li>
                </ul>
              </div>
            </SubSection>

            <SubSection title="Ringkasan Biaya">
              <Table
                headers={['Layanan', 'Paket Saat Ini', 'Biaya/Bulan', 'Upgrade Diperlukan Saat']}
                rows={[
                  ['Vercel', 'Hobby (Free)', 'Rp 0', 'Traffic > 100GB/bln atau butuh kolaborasi tim'],
                  ['Railway', 'Hobby', '$5 (~Rp 82.000)', 'CPU/RAM tidak cukup untuk traffic tinggi'],
                  ['Supabase', 'Free', 'Rp 0', 'DB > 500MB atau butuh tidak pernah paused'],
                ]}
              />
              <p className="text-[13px] text-text-secondary"><strong>Total biaya saat ini: ~$5/bulan (~Rp 82.000)</strong> untuk semua layanan production.</p>
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
                  <div className="text-[13px] font-medium text-text-primary mb-2">▲ Vercel (Frontend)</div>
                  <ul className="text-[12px] text-text-muted space-y-1">
                    <li>• Root directory: <code>frontend/</code></li>
                    <li>• Framework: Next.js (auto-detect)</li>
                    <li>• Deploy otomatis saat push ke main</li>
                  </ul>
                </div>
                <div className="bg-bg-surface border border-border-default rounded-[10px] p-4">
                  <div className="text-[13px] font-medium text-text-primary mb-2">🚂 Railway (Backend)</div>
                  <ul className="text-[12px] text-text-muted space-y-1">
                    <li>• Root directory: <code>backend/</code></li>
                    <li>• Build: <code>npm install && npm run build</code></li>
                    <li>• Start: <code>npm start</code></li>
                    <li>• Node.js 20+ diperlukan</li>
                  </ul>
                </div>
              </div>
            </SubSection>

            <SubSection title="Paket & Dependensi">
              <p className="text-[13px] text-text-secondary font-medium mb-2">Frontend (Next.js)</p>
              <Table
                headers={['Paket', 'Versi', 'Fungsi']}
                rows={[
                  ['next', '16.2.7', 'Framework React dengan App Router dan Turbopack'],
                  ['react', '19.2.4', 'UI library utama'],
                  ['tailwindcss', '^4', 'Utility-first CSS dengan CSS custom properties'],
                  ['@ducanh2912/next-pwa', '^10.2.9', 'Progressive Web App — install ke homescreen, offline support'],
                  ['recharts', '^3.8.1', 'Grafik interaktif (line chart, bar chart di dashboard)'],
                  ['react-calendar-heatmap', '^1.10.0', 'Visualisasi kalender kehadiran (heatmap)'],
                  ['react-qr-code', '^2.1.1', 'Generate QR Code untuk PIN absensi (sisi guru)'],
                  ['html5-qrcode', '^2.3.8', 'Scan QR Code via kamera HP (sisi siswa)'],
                  ['jspdf + jspdf-autotable', '^4 / ^5', 'Export laporan ke PDF'],
                  ['xlsx', '^0.18.5', 'Export data ke Excel (.xlsx)'],
                  ['@supabase/supabase-js', '^2.108.0', 'Tidak dipakai langsung di frontend — hanya di backend'],
                ]}
              />
              <p className="text-[13px] text-text-secondary font-medium mb-2 mt-4">Backend (Express.js)</p>
              <Table
                headers={['Paket', 'Versi', 'Fungsi']}
                rows={[
                  ['express', '^5.2.1', 'Web framework untuk REST API'],
                  ['typescript', '^6.0.3', 'Type safety dan compile-time checking'],
                  ['@supabase/supabase-js', '^2.108.0', 'Koneksi ke database PostgreSQL Supabase'],
                  ['bcryptjs', '^3.0.3', 'Hash password guru dan siswa'],
                  ['jsonwebtoken', '^9.0.3', 'Generate dan verifikasi JWT token autentikasi'],
                  ['cors', '^2.8.6', 'Izinkan request dari domain Vercel (CORS policy)'],
                  ['dotenv', '^17.4.2', 'Load environment variables dari file .env'],
                  ['multer', '^2.1.1', 'Middleware multipart/form-data (diinstall, belum dipakai aktif)'],
                ]}
              />
            </SubSection>

          </Section>

          {/* ── PHASE 5 ── */}
          <Section id="phase5" title="Roadmap Phase 5 — Scale">
            <InfoBox type="info">Phase 5 dieksekusi hanya jika ada <strong>demand nyata</strong> dari pengguna aktif. Prioritas utama tetap simplicity — jangan over-engineer sebelum ada kebutuhan nyata.</InfoBox>

            <SubSection title="Kapan Perlu Upgrade?">
              <Table
                headers={['Kondisi', 'Tindakan']}
                rows={[
                  ['Supabase project sering paused (inaktif)', 'Upgrade Supabase ke Pro ($25/bln)'],
                  ['DB mendekati 500MB', 'Upgrade Supabase ke Pro → 8GB'],
                  ['Banyak sekolah mau pakai Eduva', 'Implementasi arsitektur multi-sekolah'],
                  ['Backend butuh lebih banyak RAM/CPU', 'Upgrade Railway ke Pro ($20/bln)'],
                  ['Traffic frontend > 100GB/bln', 'Upgrade Vercel ke Pro ($20/bln)'],
                ]}
              />
            </SubSection>

            <SubSection title="Fitur yang Direncanakan">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {[
                  {
                    icon: '🏫',
                    title: 'Multi-Sekolah',
                    items: [
                      'Satu instance Eduva untuk banyak sekolah',
                      'Isolasi data antar sekolah (Row-Level Security)',
                      'Admin per-sekolah kelola semua guru',
                    ],
                  },
                  {
                    icon: '🤖',
                    title: 'AI Features (Claude API)',
                    items: [
                      'Auto-generate soal dari materi',
                      'Rangkuman materi otomatis',
                      'Analisis pola belajar siswa',
                    ],
                  },
                  {
                    icon: '🔗',
                    title: 'Integrasi',
                    items: [
                      'SSO Google Workspace for Education',
                      'Sinkronisasi data dengan Dapodik',
                      'Notifikasi WhatsApp/email ke orang tua',
                    ],
                  },
                  {
                    icon: '⚙️',
                    title: 'Technical Hardening',
                    items: [
                      'Rate limiting & security hardening',
                      'Backup otomatis harian',
                      'Monitoring error (Sentry)',
                      'Analytics pengguna (PostHog)',
                    ],
                  },
                ].map((card) => (
                  <div key={card.title} className="bg-bg-surface border border-border-default rounded-[12px] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[20px]">{card.icon}</span>
                      <span className="text-[13px] font-medium text-text-primary">{card.title}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-[12px] text-text-muted">
                          <span className="text-border-muted mt-0.5">○</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="Tech Stack Tambahan (Phase 5)">
              <Table
                headers={['Kebutuhan', 'Teknologi', 'Estimasi Biaya']}
                rows={[
                  ['Generate soal AI', 'Anthropic Claude API', 'Pay per token (~$3/1M token input)'],
                  ['Multi-tenant DB', 'PostgreSQL Row-Level Security', 'Sudah ada di Supabase'],
                  ['CDN / file storage', 'Cloudflare R2 atau AWS S3', '$0.015/GB/bln'],
                  ['Error monitoring', 'Sentry', 'Free tier: 5.000 error/bln'],
                  ['Product analytics', 'PostHog', 'Free tier: 1 juta event/bln'],
                ]}
              />
            </SubSection>

            <SubSection title="Model Arsitektur Multi-Sekolah">
              <Code>{`-- Tabel tambahan
schools (id, name, address, city, subscription_tier)
teacher_schools (id, teacher_id, school_id, role)

-- Semua tabel existing ditambah kolom school_id
-- Row-Level Security memastikan isolasi data antar sekolah

-- Contoh RLS policy
CREATE POLICY "teachers see own school data"
ON classes FOR ALL
USING (school_id = current_setting('app.school_id')::uuid);`}</Code>
            </SubSection>

            <SubSection title="Model Pricing (Usulan)">
              <Table
                headers={['Tier', 'Harga', 'Kapasitas']}
                rows={[
                  ['Free', 'Rp 0', '1 guru, 1 kelas, 50 siswa'],
                  ['Basic', 'Rp 99.000/bln', '5 guru, unlimited kelas'],
                  ['Pro', 'Rp 299.000/bln', 'Unlimited guru + AI features'],
                  ['Enterprise', 'Negosiasi', 'Multi-sekolah + integrasi Dapodik'],
                ]}
              />
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
