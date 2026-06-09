# Eduva — Phase 4: Mobile

## Overview
Phase 4 membawa seluruh fitur Eduva ke platform mobile (iOS & Android). Dengan React Native + Expo, codebase web bisa digunakan kembali secara signifikan. Mobile membuka kemampuan baru seperti scan QR via kamera dan mode offline untuk absensi.

**Estimasi waktu:** 4–6 minggu (tanpa Claude Code) / 1–2 minggu (dengan Claude Code)  
**Prasyarat:** Phase 1–3 selesai di web

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Mobile framework | React Native + Expo |
| Navigation | React Navigation |
| QR Scanner | expo-camera + expo-barcode-scanner |
| Offline storage | AsyncStorage / SQLite (expo-sqlite) |
| Push notification | Expo Notifications (opsional) |
| Build & deploy | Expo EAS Build |

---

## Features

### 📱 Core (Port dari Web)
- [ ] Semua fitur Phase 1 tersedia di mobile
- [ ] Semua fitur Phase 2 tersedia di mobile
- [ ] Semua fitur Phase 3 tersedia di mobile
- [ ] Responsive & touch-friendly untuk semua ukuran layar

### 📷 QR Code Scanner
- [ ] Siswa scan QR Code absensi langsung via kamera HP
- [ ] Konfirmasi visual setelah berhasil scan (animasi ✅)
- [ ] Handling error: QR expired, sudah absen, dsb.

### 📶 Offline Mode
- [ ] Guru bisa buka sesi absensi tanpa internet
- [ ] Data absensi tersimpan lokal, sync otomatis saat online
- [ ] Indikator status koneksi yang jelas di UI

### 🔔 Push Notification (Opsional)
- [ ] Notifikasi ke guru saat ada smart alert baru
- [ ] Reminder deadline tugas untuk siswa

---

## Design Direction — Eduva Mobile Visual Style

> Design system Eduva tetap konsisten antara web dan mobile. Adaptasi khusus mobile:

### Layout
```
Padding horizontal  : 16px
Card border-radius  : 16px (sedikit lebih besar dari web)
Bottom nav height   : 64px
Header height       : 56px
Touch target min    : 44x44px (Apple HIG standard)
```

### Navigasi
```
Bottom tab bar      : 5 item utama
  - Dashboard
  - Kelas
  - Absensi
  - Nilai
  - Profil
Warna aktif tab     : #4CAF50
Warna nonaktif tab  : #9CA3AF
Background tab bar  : #FFFFFF, border-top 0.5px #E5E7EB
```

### Efek Interaktif di Mobile
```
Tidak ada hover state di mobile — diganti dengan:
- activeOpacity: 0.75 (TouchableOpacity)
- Haptic feedback ringan pada aksi penting (absen berhasil, submit nilai)
- Ripple effect pada Android (TouchableNativeFeedback)
```

### Warna & Hierarki
> Sama persis dengan web — mengacu pada design system Phase 1

---

## Database / API
- Mobile menggunakan **API yang sama** dengan web (Node.js + Express)
- Tidak ada backend baru — hanya konsumsi endpoint yang sudah ada
- Tambahan endpoint untuk **sync offline data**:

```
POST /api/attendance/sync
Body: { sessions: [...offline_records] }
```

---

## Catatan
- Gunakan **Expo Go** untuk testing cepat selama development
- Build APK/IPA menggunakan **Expo EAS Build** (free tier tersedia)
- Push notification **opsional** di fase ini karena butuh konfigurasi tambahan (FCM/APNs)
- Prioritaskan **Android first** karena mayoritas pengguna SMK di Indonesia menggunakan Android
