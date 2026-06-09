# Eduva — Phase 1: MVP (Foundation)

## Overview
Phase 1 membangun fondasi utama Eduva. Tujuannya adalah menghasilkan app yang sudah bisa dipakai guru untuk kebutuhan dasar sehari-hari: mengelola kelas, mencatat kehadiran, mendistribusikan materi, dan merekap nilai.

**Estimasi waktu:** 4–6 minggu (tanpa Claude Code) / 1–2 minggu (dengan Claude Code)

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend Web | Next.js (React) |
| Backend | Node.js + Express |
| Database | PostgreSQL (via Supabase) |
| Auth | JWT (JSON Web Token) |
| Storage | Supabase Storage |
| Hosting Web | Vercel (gratis) |
| Hosting Backend | Railway / Render (gratis tier) |

---

## Features

### 🔐 Authentication
- [ ] Guru register dengan email + password
- [ ] Guru login dengan email + password
- [ ] Siswa login dengan nama lengkap + password
- [ ] Logout

### 🏫 Manajemen Kelas
- [ ] Buat kelas baru
- [ ] Edit & hapus kelas
- [ ] Tambah siswa ke kelas (manual oleh guru)
- [ ] Auto-generate username & password default siswa
- [ ] Export daftar akun siswa (untuk dibagikan ke siswa)

### ✅ Absensi
- [ ] Guru buka sesi absensi → PIN otomatis dibuat
- [ ] Set durasi PIN berlaku (default 15 menit)
- [ ] Siswa input PIN untuk absen
- [ ] Manual override absensi oleh guru
- [ ] Rekap absensi per pertemuan
- [ ] Export rekap absensi ke Excel

### 📚 Konten Kelas
- [ ] Attach link materi per kelas
- [ ] Upload file materi (PDF, PPT, dll)
- [ ] Buat tugas + deadline
- [ ] Siswa lihat & download materi kapan saja

### 📊 Penilaian
- [ ] Input nilai per siswa
- [ ] Rekap nilai per kelas
- [ ] Export nilai ke Excel

---

## Design Direction — Eduva Visual Style

> Semua UI mengacu pada design system Eduva berikut.

### Warna
| Token | Nilai | Penggunaan |
|-------|-------|------------|
| Background | `#F7F8FA` | Page background |
| Surface | `#FFFFFF` | Card, sidebar |
| Border default | `#E5E7EB` | Semua border card |
| Primary | `#4CAF50` | Aksi utama, logo, aktif |
| Primary muted | `#F0FDF4` | Background badge aktif |
| Text primary | `#111827` | Judul, angka utama |
| Text secondary | `#374151` | Label card |
| Text muted | `#9CA3AF` | Subtitle, meta info |

### Prinsip Desain
- **Background netral** — halaman menggunakan `#F7F8FA`, card putih bersih
- **Hierarki warna** — warna hanya untuk makna (hijau = positif/aktif, biru = info, kuning = warning, merah = alert/danger)
- **Efek 3D via border-bottom** — komponen interaktif memiliki `border-bottom: 3–4px` yang muncul **hanya saat hover**
- **Tidak ada transform/translate** — hover tidak menggeser posisi komponen, hanya mengubah warna border dan `filter: brightness`
- **Border radius** — card `14px`, button `10px`, badge `20px` (pill)
- **Typography** — font-weight hanya `400` dan `500`, tidak menggunakan `600` atau `700`

### Komponen Interaktif — Hover State
```css
/* Card */
.card:hover {
  border-bottom: 4px solid #86EFAC;
  filter: brightness(0.97);
}

/* Button */
.btn:hover {
  border-bottom: 3px solid #86EFAC;
  filter: brightness(0.95);
}

/* List item */
.list-item:hover {
  background: #F9FAFB;
  border-bottom: 2px solid #D1D5DB;
}
```

---

## Database Schema (Phase 1)

```sql
-- Users (Guru)
teachers (id, name, email, password_hash, created_at)

-- Kelas
classes (id, teacher_id, name, grade, created_at)

-- Siswa
students (id, class_id, full_name, username, password_hash, created_at)

-- Sesi Absensi
attendance_sessions (id, class_id, pin, expires_at, created_at)

-- Record Absensi
attendance_records (id, session_id, student_id, status, created_at)

-- Materi & Tugas
contents (id, class_id, type [material|assignment], title, file_url, link_url, deadline, created_at)

-- Nilai
grades (id, student_id, class_id, subject, score, created_at)
```

---

## Catatan
- File materi besar (video) sebaiknya menggunakan **attach link** (YouTube, Google Drive) daripada upload langsung untuk menghemat storage Supabase free tier (1 GB)
- Free tier Supabase cukup untuk **~50–150 siswa** sebelum perlu upgrade
