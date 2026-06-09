# Eduva — Design System & Visual Direction

> Dokumen ini adalah referensi utama tampilan Eduva. Semua phase mengacu pada panduan ini.

---

## Identitas

**Nama:** Eduva  
**Tagline:** Manajemen kelas yang sederhana untuk guru SMK  
**Karakter:** Bersih, ringan, profesional, tidak berlebihan

---

## Warna

### Palet Utama

| Token | Hex | Penggunaan |
|-------|-----|------------|
| `primary` | `#4CAF50` | Logo, CTA utama, state aktif |
| `primary-muted` | `#F0FDF4` | Background badge aktif, PIN card |
| `primary-border` | `#BBF7D0` | Border elemen hijau |
| `primary-hover` | `#86EFAC` | Border-bottom saat hover |

### Warna Semantik

| Makna | Background | Border | Text |
|-------|-----------|--------|------|
| Positif / Aktif | `#F0FDF4` | `#BBF7D0` | `#15803D` |
| Info / Netral | `#EFF6FF` | `#BFDBFE` | `#1D4ED8` |
| Warning / Deadline | `#FFFBEB` | `#FDE68A` | `#92400E` |
| Danger / Alert | `#FFF1F2` | `#FECDD3` | `#BE123C` |

### Warna Struktural

| Token | Hex | Penggunaan |
|-------|-----|------------|
| `bg-page` | `#F7F8FA` | Background halaman |
| `bg-surface` | `#FFFFFF` | Card, sidebar, modal |
| `bg-subtle` | `#F9FAFB` | Hover list item, input bg |
| `border-default` | `#E5E7EB` | Border card default |
| `border-muted` | `#F3F4F6` | Divider, separator |
| `text-primary` | `#111827` | Judul, angka utama |
| `text-secondary` | `#374151` | Label, card title |
| `text-muted` | `#9CA3AF` | Subtitle, meta, placeholder |

---

## Tipografi

- **Font:** System font stack (mengikuti Anthropic Sans di web, SF Pro di iOS, Roboto di Android)
- **Weight yang digunakan:** hanya `400` (regular) dan `500` (medium) — tidak menggunakan `600` atau `700`
- **Ukuran:**

| Peran | Size | Weight |
|-------|------|--------|
| Page title | 20px | 500 |
| Card title | 13–14px | 500 |
| Body | 13px | 400 |
| Meta / label | 11–12px | 400 |
| Stat number | 22–24px | 500 |

---

## Komponen

### Card
```css
background    : #FFFFFF
border        : 0.5px solid #E5E7EB
border-radius : 14px
padding       : 18px
```

### Card — Hover State
```css
border-bottom : 4px solid #86EFAC  /* atau warna semantik sesuai konteks */
filter        : brightness(0.97)
/* TIDAK menggunakan transform: translateY */
```

### Button Primer
```css
background    : #4CAF50
color         : #FFFFFF
border        : none
border-bottom : 3px solid #2E7D32
border-radius : 10px
padding       : 8px 16px 6px

/* Hover */
filter        : brightness(0.95)
```

### Button Sekunder
```css
background    : #F9FAFB
border        : 0.5px solid #E5E7EB
border-bottom : 3px solid #E5E7EB
border-radius : 10px
color         : #374151

/* Hover */
background    : #F0FDF4
border-color  : #BBF7D0
border-bottom-color : #86EFAC
```

### Badge / Pill
```css
border-radius : 20px
padding       : 3px 10px
font-size     : 11px
font-weight   : 500
/* Warna sesuai konteks semantik */
```

### Progress Bar
```css
track         : height 8px, background #F3F4F6, border-radius 20px
fill-green    : #4ADE80  (≥ 90%)
fill-amber    : #FBBF24  (75–89%)
fill-red      : #F87171  (< 75%)
```

---

## Prinsip Interaksi

### 1. Efek 3D hanya saat hover
Border-bottom tebal (`3–4px`) hanya muncul saat elemen di-hover, bukan di default state. Ini memberi kesan "tombol bisa ditekan" tanpa membuat halaman terasa berat.

### 2. Tidak ada pergeseran layout
Hover **tidak boleh** menggunakan `transform: translateY` atau mengubah dimensi elemen karena akan menggeser komponen sekitar. Gunakan hanya:
- `border-bottom-color` — perubahan warna border
- `filter: brightness()` — sedikit menggelapkan/mencerahkan
- `background-color` — perubahan warna latar

### 3. Warna untuk makna, bukan dekorasi
Warna hanya digunakan ketika ia menyampaikan informasi:
- Hijau = positif, aktif, berhasil
- Biru = informasi, netral
- Amber = perhatian, warning, deadline
- Merah = error, bahaya, perlu tindakan
- Abu = nonaktif, placeholder, struktural

### 4. Hierarki visual yang jelas
- Teks paling penting: `#111827` (hampir hitam)
- Teks pendukung: `#374151`
- Teks sekunder/meta: `#9CA3AF` (abu muted)
- Jangan menggunakan warna terang untuk teks utama

---

## Sidebar Navigasi

```
Lebar         : 72px
Background    : #FFFFFF
Border-right  : 0.5px solid #E5E7EB
Icon size     : 20px
Item size     : 46x46px, border-radius 12px

State default : color #9CA3AF
State hover   : background #F3F4F6, color #374151
State active  : background #F0FDF4, color #16A34A
```

---

## Referensi Inspirasi
- **Duolingo** — gamifikasi, streak, feedback instan
- **Linear** — clean UI, hierarki tipografi
- **Notion** — ketenangan visual, tidak overwhelming
