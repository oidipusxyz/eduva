# Eduva — Panduan Akun & Akses

## Ringkasan Tipe Akun

| Tipe | Login di | Dibuat oleh |
|------|----------|-------------|
| Admin | `/login` (web) | Manual via SQL |
| Guru | `/login` (web) | Daftar sendiri di `/register`, atau dibuat Admin |
| Siswa | `/student/login` (web/PWA) | Guru (di halaman manajemen kelas) |

---

## 1. Akun Admin

Admin adalah guru dengan hak akses tertinggi — bisa lihat semua kelas, kelola akun guru, dan export laporan sekolah.

### Cara membuat Admin pertama

**Langkah 1** — Daftar akun guru biasa di `/register` (atau sudah punya akun guru).

**Langkah 2** — Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Ganti email di bawah dengan email akunmu
UPDATE teachers SET role = 'admin' WHERE email = 'emailmu@sekolah.sch.id';
```

**Langkah 3** — Login di `/login`. Sistem otomatis redirect ke `/admin/dashboard`.

### URL yang bisa diakses Admin
| Halaman | URL |
|---------|-----|
| Dashboard Overview | `/admin/dashboard` |
| Manajemen Guru | `/admin/teachers` |
| Laporan Sekolah | `/admin/reports` |

### Catatan
- Admin **tidak bisa** dinonaktifkan oleh admin lain
- Admin bisa membuat akun guru baru langsung dari `/admin/teachers` (tanpa perlu guru daftar sendiri)
- Satu sekolah bisa punya lebih dari satu admin

---

## 2. Akun Guru

### Cara daftar sendiri
Buka `/register`, isi:
- **Nama lengkap** — contoh: `Budi Santoso`
- **Email** — contoh: `budi@smkn1.sch.id`
- **Password** — minimal 8 karakter

Setelah login, langsung diarahkan ke `/dashboard`.

### Dibuat oleh Admin
Admin buka `/admin/teachers` → klik **Tambah Guru** → isi nama, email, password awal.

Guru bisa ganti password setelah login pertama (fitur ini bisa ditambahkan di Phase 5).

### URL yang bisa diakses Guru
| Halaman | URL |
|---------|-----|
| Dashboard | `/dashboard` |
| Kelas | `/classes` |
| Absensi | `/attendance` |
| Materi & Tugas | `/content` |
| Nilai | `/grades` |
| Heatmap | `/heatmap` |
| Jurnal | `/journals` |
| Laporan | `/reports` |
| Alert | `/alerts` |

---

## 3. Akun Siswa

Akun siswa **tidak bisa daftar sendiri** — hanya bisa dibuat oleh guru di halaman manajemen kelas.

### Cara membuat akun siswa (oleh guru)
1. Buka `/classes` → pilih kelas → klik **Tambah Siswa**
2. Isi **nama lengkap** siswa
3. Sistem otomatis generate:
   - **Username** — dari nama + 4 angka acak, contoh: `budisantoso4821`
   - **Password default** — `edu` + 4 angka yang sama, contoh: `edu4821`
4. Password default **ditampilkan sekali** saat siswa ditambahkan — catat atau export via tombol **Export Akun Siswa**

### Format password default siswa
```
Password = "edu" + [4 angka acak]
Contoh   : edu4821 / edu7392 / edu1056
```

### Login siswa
Siswa login di `/student/login` menggunakan:
- **Nama lengkap** (bukan username) — contoh: `Budi Santoso`
- **Password** — contoh: `edu4821`

> Catatan: Jika ada dua siswa dengan nama yang sama di sekolah yang berbeda kelas, sistem tetap bisa membedakan karena password hash-nya berbeda.

### URL yang bisa diakses Siswa
| Halaman | URL |
|---------|-----|
| Dashboard | `/student/dashboard` |
| Input Absensi + Riwayat | `/student/attendance` |
| Materi & Tugas | `/student/content` |
| Leaderboard Kelas | `/student/leaderboard` |
| Badge Saya | `/student/badges` |

---

## Contoh Akun untuk Testing

Buat akun berikut untuk mencoba semua fitur:

### Admin
| Field | Nilai |
|-------|-------|
| Email | `admin@eduva.test` |
| Password | `admin1234` |
| Cara aktifkan | Daftar di `/register`, lalu jalankan SQL di atas |

### Guru
| Field | Nilai |
|-------|-------|
| Email | `guru@eduva.test` |
| Password | `guru1234` |
| Cara buat | Daftar di `/register` atau dibuat Admin |

### Siswa *(dibuat otomatis saat guru tambah siswa)*
| Field | Nilai |
|-------|-------|
| Nama Lengkap | `Nama Siswa` (sesuai yang diinput guru) |
| Password | `edu` + 4 angka (ditampilkan saat siswa ditambahkan) |

---

## FAQ

**Q: Siswa lupa password, bagaimana reset?**
Saat ini belum ada fitur self-service reset password. Guru bisa hapus dan tambah ulang akun siswa, atau admin bisa update `password_hash` langsung di Supabase.

**Q: Guru bisa lihat kelas guru lain?**
Tidak. Setiap guru hanya melihat kelas yang dia buat sendiri. Admin bisa melihat semua kelas.

**Q: Bagaimana siswa tahu passwordnya?**
Guru yang menyampaikan. Guru bisa export daftar akun siswa (nama + password default) ke Excel dari halaman manajemen kelas.

**Q: Apakah ada sesi yang expire?**
Ya. Token guru dan siswa expire setelah **30 hari**. Setelah itu perlu login ulang.
