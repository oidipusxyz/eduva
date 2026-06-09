# Eduva — Phase 3: Engagement

## Overview
Phase 3 berfokus pada keterlibatan siswa. Dengan gamifikasi, siswa lebih termotivasi untuk hadir dan mengerjakan tugas. QR Code mempercepat proses absensi, dan heatmap memberikan gambaran visual pola kehadiran yang lebih intuitif.

**Estimasi waktu:** 3–4 minggu (tanpa Claude Code) / 3–5 hari (dengan Claude Code)  
**Prasyarat:** Phase 2 selesai

---

## Tech Stack Tambahan

| Kebutuhan | Teknologi |
|-----------|-----------|
| QR Code generate | react-qr-code |
| Heatmap kalender | react-calendar-heatmap |

---

## Features

### 🎮 Gamifikasi
- [ ] Siswa mendapat poin dari kehadiran
- [ ] Siswa mendapat poin dari mengumpulkan tugas tepat waktu
- [ ] Badge pencapaian (misal: "Hadir 30 hari berturut-turut")
- [ ] Streak kehadiran per siswa 🔥
- [ ] Leaderboard kehadiran per kelas (visible ke siswa)

### 📱 QR Code Absensi
- [ ] Guru generate QR Code sebagai alternatif PIN
- [ ] QR Code ditampilkan di layar / proyektor
- [ ] Siswa scan QR via kamera HP untuk absen
- [ ] QR Code memiliki durasi berlaku yang sama dengan PIN

### 📊 Heatmap & Visualisasi
- [ ] Heatmap kehadiran per siswa (tampilan kalender)
- [ ] Heatmap kehadiran per kelas
- [ ] Guru bisa lihat pola absensi siswa secara visual

### 📄 Laporan Lanjutan
- [ ] Laporan rekap kelas siap kirim ke kepala sekolah
- [ ] Format laporan rapi dan profesional (PDF)
- [ ] Laporan bisa difilter per periode

---

## Design Direction — Eduva Visual Style

> Mengacu pada design system Eduva (lihat Phase 1). Tambahan khusus Phase 3:

### Komponen Baru

**Badge Gamifikasi**
```
Streak aktif  : background #FFFBEB, border #FDE68A, text #92400E
Badge earned  : background #F0FDF4, border #BBF7D0, text #15803D
Badge locked  : background #F9FAFB, border #E5E7EB, text #9CA3AF
```

**Leaderboard Item**
```
Rank 1        : accent left-border 3px solid #FBBF24 (gold)
Rank 2        : accent left-border 3px solid #D1D5DB (silver)
Rank 3        : accent left-border 3px solid #D97706 (bronze)
Lainnya       : border-left: none, background default
```

**Heatmap Cell**
```
Hadir         : #4ADE80 (hijau)
Izin          : #93C5FD (biru)
Sakit         : #FCD34D (amber)
Alpha         : #FCA5A5 (merah)
Tidak ada data: #F3F4F6 (abu)
```

**QR Card**
```
Background    : #F0FDF4
Border        : 0.5px solid #BBF7D0
QR code area  : putih, padding 16px, border-radius 12px
Timer pill    : background #DCFCE7, text #15803D
```

---

## Database Schema Tambahan (Phase 3)

```sql
-- Poin & Gamifikasi
student_points (
  id, student_id, class_id,
  points, source [attendance|assignment],
  earned_at
)

-- Badge
badges (id, name, description, icon, condition_type, condition_value)

student_badges (id, student_id, badge_id, earned_at)

-- Streak
attendance_streaks (
  id, student_id, class_id,
  current_streak, longest_streak, last_updated
)
```

---

## Catatan
- **Gamifikasi bersifat per kelas**, bukan lintas sekolah — menghindari kompetisi tidak sehat
- Leaderboard hanya menampilkan **kehadiran**, bukan nilai, untuk menjaga privasi akademik
- QR Code dan PIN **berjalan paralel** — guru bebas memilih metode mana yang digunakan
