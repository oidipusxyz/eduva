# Eduva — Phase 5: Scale

## Overview
Phase 5 mempersiapkan Eduva untuk tumbuh melampaui satu sekolah. Arsitektur multi-sekolah, dashboard admin, dan potensi integrasi AI membuka jalan untuk Eduva menjadi platform yang bisa digunakan secara luas di Indonesia.

**Estimasi waktu:** TBD — bergantung pada traction dan kebutuhan pengguna  
**Prasyarat:** Phase 1–4 selesai, sudah ada pengguna aktif nyata

---

## Tech Stack Tambahan (Potensial)

| Kebutuhan | Teknologi |
|-----------|-----------|
| AI generate soal | Anthropic API (Claude) |
| Multi-tenant DB | PostgreSQL Row-Level Security |
| CDN file besar | Cloudflare R2 / AWS S3 |
| Monitoring | Sentry (error), Posthog (analytics) |
| Database upgrade | Supabase Pro ($25/bln) jika >150 siswa |

---

## Features

### 🏫 Multi-Sekolah
- [ ] Satu instance Eduva bisa digunakan banyak sekolah
- [ ] Setiap sekolah terisolasi datanya (row-level security)
- [ ] Admin sekolah bisa manage semua guru di sekolahnya

### 👑 Dashboard Admin Sekolah
- [ ] Overview kehadiran seluruh kelas
- [ ] Rekap performa semua guru
- [ ] Export laporan level sekolah
- [ ] Manage akun guru (tambah, nonaktif)

### 🤖 AI Features (Jika Budget Ada)
- [ ] Auto-generate soal dari materi yang diupload (Claude API)
- [ ] Rangkuman materi otomatis
- [ ] Analisis pola belajar siswa

### 🔗 Integrasi
- [ ] SSO dengan sistem sekolah (Google Workspace for Education)
- [ ] Sinkronisasi data dengan Dapodik (sistem data pokok pendidikan)

### ⚙️ Technical Scale
- [ ] Upgrade database jika pengguna >150 siswa per sekolah
- [ ] Rate limiting & security hardening
- [ ] Backup otomatis data sekolah

---

## Design Direction — Eduva Visual Style

> Design system Eduva tetap sama. Tambahan khusus Phase 5:

### Admin Dashboard
```
Warna aksen admin   : tetap #4CAF50 (konsisten dengan guru)
Role badge guru     : background #EFF6FF, text #1D4ED8
Role badge admin    : background #F0FDF4, text #15803D
Role badge superadmin: background #FFF1F2, text #BE123C
```

### Data Scale Indicators
```
Sekolah kecil (<100 siswa)  : badge hijau "Sehat"
Sekolah sedang (100–500)    : badge amber "Normal"
Sekolah besar (>500)        : badge biru "Enterprise"
```

---

## Database Schema Tambahan (Phase 5)

```sql
-- Sekolah
schools (
  id, name, address, city,
  subscription_tier [free|pro|enterprise],
  created_at
)

-- Relasi guru ke sekolah
teacher_schools (id, teacher_id, school_id, role [teacher|admin])

-- Semua tabel existing ditambah kolom school_id
-- Row-Level Security di PostgreSQL memastikan isolasi data
```

---

## Pricing Model (Usulan)

| Tier | Harga | Kapasitas |
|------|-------|-----------|
| Free | Rp 0 | 1 guru, 1 kelas, 50 siswa |
| Basic | Rp 99.000/bln | 5 guru, unlimited kelas |
| Pro | Rp 299.000/bln | Unlimited guru + AI features |
| Enterprise | Custom | Multi-sekolah + integrasi Dapodik |

---

## Catatan
- Phase 5 hanya dieksekusi jika **ada demand nyata** dari pengguna Phase 1–4
- Prioritas utama tetap **simplicity** — jangan over-engineer sebelum ada kebutuhan nyata
- AI features bergantung pada **budget** — Anthropic API dikenakan biaya per token
