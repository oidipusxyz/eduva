# Eduva — Phase 2: Enhancement

## Overview
Phase 2 membuat Eduva lebih pintar dan informatif. Guru mendapat insight yang actionable dari data kelas, dan sistem mulai bekerja secara proaktif melalui smart alert dan laporan otomatis.

**Estimasi waktu:** 3–4 minggu (tanpa Claude Code) / 3–5 hari (dengan Claude Code)  
**Prasyarat:** Phase 1 selesai dan sudah diuji dengan pengguna nyata

---

## Tech Stack Tambahan

| Kebutuhan | Teknologi |
|-----------|-----------|
| Grafik & chart | Recharts |
| Export PDF | jsPDF |
| Kalkulasi statistik | Native JS / lodash |

---

## Features

### 📊 Dashboard Analytics
- [ ] Ringkasan aktivitas harian guru (kelas hari ini, tugas aktif, alert)
- [ ] Statistik kehadiran per kelas dalam bentuk progress bar
- [ ] Grafik perkembangan nilai siswa dari waktu ke waktu
- [ ] Grafik performa kelas (rata-rata nilai per periode)

### 🔔 Smart Alert
- [ ] Deteksi otomatis siswa yang absen 3x berturut-turut
- [ ] Notifikasi in-app untuk guru saat alert terpicu
- [ ] Daftar siswa bermasalah yang perlu perhatian guru

### 📅 Rekap & Laporan
- [ ] Rekap absensi mingguan & bulanan per kelas
- [ ] Auto-generate laporan mengajar bulanan guru
- [ ] Laporan siap cetak / export PDF untuk kepala sekolah

### 📝 Jurnal Mengajar
- [ ] Guru catat aktivitas pembelajaran per pertemuan
- [ ] Riwayat jurnal tersimpan per kelas
- [ ] Jurnal otomatis masuk ke laporan bulanan

---

## Design Direction — Eduva Visual Style

> Mengacu pada design system Eduva (lihat Phase 1). Tambahan khusus Phase 2:

### Komponen Baru

**Stat Card** — metric summary dengan warna semantik
```
Background : #FFFFFF
Border     : 0.5px solid #E5E7EB
Border-bottom (hover) : 4px solid sesuai warna semantik
  - Positif/hijau : #86EFAC
  - Info/biru     : #93C5FD
  - Warning/amber : #FCD34D
  - Danger/merah  : #FCA5A5
```

**Smart Alert Item**
```
Background : #FFFBEB
Border     : 0.5px solid #FDE68A
Border-bottom (hover) : 3px solid #F59E0B
Text       : #78350F
Icon       : #D97706
```

**Progress Bar**
```
Track      : #F3F4F6
Fill hijau : #4ADE80  (kehadiran ≥ 90%)
Fill amber : #FBBF24  (kehadiran 75–89%)
Fill merah : #F87171  (kehadiran < 75%)
Height     : 8px, border-radius: 20px
```

---

## Database Schema Tambahan (Phase 2)

```sql
-- Jurnal Mengajar
teaching_journals (
  id, teacher_id, class_id,
  session_date, topic, activity_notes,
  created_at
)

-- Smart Alert Log
attendance_alerts (
  id, student_id, class_id,
  consecutive_absences, alerted_at, resolved
)
```

---

## Catatan
- Grafik menggunakan **Recharts** (gratis, React-native)
- PDF export menggunakan **jsPDF** (gratis, client-side)
- Smart alert berjalan sebagai **background check** setiap kali sesi absensi ditutup — tidak butuh cron job eksternal di fase ini
