# 📋 Bukpot Express

[![Version](https://img.shields.io/badge/version-2.0-blue.svg)](https://github.com/username/BukpotExpress)
[![Chrome Extension](https://img.shields.io/badge/chrome-extension-green.svg)](https://chrome.google.com/webstore)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

**Bukpot Express** adalah ekstensi Chrome yang dirancang khusus untuk mengotomatisasi proses pengunduhan dokumen perpajakan (bukti potong) dari portal CoreTax DJP (Direktorat Jenderal Pajak) Indonesia.

## ✨ Fitur Utama

### 🚀 Yang Baru di v2.0
- **📱 Sidebar Interface**: Antarmuka sidebar persisten untuk pengalaman pengguna yang lebih baik
- **🔄 Filter Otomatis**: Secara otomatis mengubah filter periode pajak (bulan/tahun)
- **⚡ One-Click Download**: Terapkan filter dan unduh semua dokumen dengan satu klik
- **📊 Status Update**: Informasi progres real-time selama proses berlangsung
- **🛡️ Enhanced Error Handling**: Pesan error yang lebih baik dan mekanisme pemulihan

### 🔧 Kemampuan Teknis
- ✅ **Manifest V3 Compatible**: Mendukung standar ekstensi Chrome terbaru
- ✅ **Side Panel API**: Integrasi dengan API Sidebar Chrome
- ✅ **Smart Injection**: Penyuntikan skrip yang lebih baik ke halaman web
- ✅ **State Management**: Manajemen状态 yang ditingkatkan
- ✅ **Comprehensive Logging**: Logging detail untuk debugging

## 📋 Persyaratan Sistem

- **Browser**: Google Chrome 114+ (diperlukan untuk Side Panel API)
- **Platform**: Windows, macOS, Linux
- **Akses**: Portal CoreTax DJP Indonesia
- **Koneksi**: Internet yang stabil

## 🛠️ Cara Instalasi

### Metode 1: Load Unpacked (Development)
1. **Download** source code dari repository ini
2. **Buka** Google Chrome
3. **Navigasi** ke `chrome://extensions/`
4. **Aktifkan** "Developer mode" dengan toggle di pojok kanan atas
5. **Klik** tombol "Load unpacked"
6. **Pilih** folder ekstensi yang telah didownload
7. **Icon** ekstensi akan muncul di toolbar Chrome

### Metode 2: Chrome Web Store
*(Coming Soon)*

## 🎯 Cara Penggunaan

### Alur Kerja Dasar

1. **🌐 Buka CoreTax**: Masuk ke portal CoreTax DJP dan buka halaman daftar dokumen
2. **📱 Buka Ekstensi**: Klik ikon ekstensi di toolbar Chrome (sidebar akan terbuka)
3. **📅 Pilih Periode Pajak**:
   - Pilih bulan yang diinginkan dari dropdown "Pilih Bulan"
   - Pilih tahun yang diinginkan dari dropdown "Pilih Tahun"
4. **▶️ Mulai Proses**: Klik tombol "Terapkan & Unduh Semua"
5. **📊 Monitor Progres**: Amati area status untuk update real-time
6. **✅ Unduh Selesai**: Semua dokumen akan otomatis terunduh ke folder Downloads

### Flow Proses

```
Pilih Bulan/Tahun → Klik Tombol → Filter Diterapkan → Halaman Refresh → Auto-Download Mulai → File Terunduh
```

## 🖥️ Antarmuka Pengguna

### Komponen Sidebar

- **🎨 Logo**: Branding Bukpot Express
- **📝 Judul**: "Bukpot Express" dengan informasi versi
- **🔍 Filter Section**: Dropdown selector bulan dan tahun
- **⚡ Action Button**: Tombol "Terapkan & Unduh Semua"
- **📊 Status Area**: Pesan progres dan status real-time
- **ℹ️ Footer**: Nomor versi dan informasi kontak

### Pesan Status

- **🟢 Siap**: "Siap untuk memulai unduh otomatis."
- **🟡 Memfilter**: "Menerapkan filter masa pajak..."
- **🔥 Berhasil**: "Filter berhasil diterapkan. Memulai proses unduh otomatis..."
- **💪 Mengunduh**: "Mengunduh semua dokumen..."
- **✅ Selesai**: "Proses unduh selesai!"
- **❌ Error**: Pesan error deskriptif

## 🏗️ Struktur Kode

```
BukpotExpress/
├── 📄 manifest.json           # Konfigurasi ekstensi
├── 🎨 popup.html             # Antarmuka sidebar
├── 🎨 popup.css              # Styling sidebar
├── ⚙️ popup.js               # Logika sidebar
├── 🔧 background.js          # Background service worker
├── 🔄 filter_changer.js      # Otomasi filter periode pajak
├── 📥 collector.js           # Logika pengumpulan dokumen
├── 💉 injector.js            # Injeksi modal progres
├── ⬇️ downloader.js          # Koordinasi pengunduhan
├── 📄 multi_page_downloader.js # Pengunduhan multi-halaman
├── 🖼️ images/                # Ikon ekstensi
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── 📖 README.md              # Dokumentasi ini
├── ✅ TESTING_CHECKLIST.md   # Daftar periksa pengujian
└── 📄 README_v2.0.md         # Dokumentasi versi lama
```

## 🔐 Izin & Keamanan

### Permissions yang Diperlukan

- **`activeTab`**: Akses ke tab yang sedang aktif
- **`scripting`**: Menyuntikkan skrip ke halaman web
- **`sidePanel`**: Membuka dan mengelola antarmuka sidebar
- **`storage`**: Menyimpan preferensi dan state ekstensi

### Host Permissions

- **`https://coretax.pajak.go.id/*`**: Portal CoreTax DJP
- **`https://*.coretax.pajak.go.id/*`**: Subdomain Coretax

### 🛡️ Keamanan & Privasi

- 🔒 Ekstensi ini **hanya beroperasi** di halaman portal CoreTax DJP
- 🚫 **Tidak ada data** yang dikumpulkan atau dikirim ke pihak ketiga
- 💻 Semua pemrosesan terjadi **lokal di browser** Anda
- 🔓 **Source code terbuka** dan dapat ditinjau ulang

## 🔧 Pemecahan Masalah

### Masalah Umum

#### 1. **Sidebar tidak terbuka**
- ✅ Pastikan menggunakan Chrome 114+ (persyaratan Side Panel API)
- ✅ Pastikan ekstensi dimuat dengan benar
- ✅ Refresh halaman CoreTax dan coba lagi

#### 2. **Filter tidak diterapkan**
- ✅ Pastikan berada di halaman CoreTax yang benar dengan daftar dokumen
- ✅ Pastikan dropdown periode pajak terlihat di halaman
- ✅ Coba refresh halaman dan restart proses

#### 3. **Unduhan tidak dimulai**
- ✅ Pastikan ada dokumen yang tersedia untuk periode yang dipilih
- ✅ Pastikan tombol unduh terlihat di halaman
- ✅ Pastikan tidak ada popup blocker yang mengganggu

#### 4. **Ekstensi tidak berfungsi**
- ✅ Buka Developer Tools (F12) dan periksa Console untuk error
- ✅ Pastikan semua izin telah diberikan
- ✅ Coba nonaktifkan ekstensi lain yang mungkin bentrok

### Debug Information

Ekstensi menyediakan logging detail di browser console. Untuk melihat logs:

1. **Tekan F12** untuk membuka Developer Tools
2. **Pergi ke tab Console**
3. **Cari pesan dengan prefiks**:
   - `BG:` (Background script logs)
   - `Content script:` (Content script logs)
   - `Collector:` (Collector script logs)
   - `FilterChanger:` (Filter automation logs)

## 📊 Kompatibilitas Browser

| Browser | Versi Minimum | Status |
|---------|---------------|---------|
| Google Chrome | 114+ | ✅ Fully Supported |
| Microsoft Edge | 114+ | ⚠️ Test Required |
| Opera | 100+ | ⚠️ Test Required |
| Firefox | - | ❌ Not Supported |

## 🤝 Kontribusi

Kami menyambut kontribusi dari komunitas! Untuk berkontribusi:

1. **Fork** repository ini
2. **Buat branch** baru (`git checkout -b fitur/baru`)
3. **Commit** perubahan Anda (`git commit -am 'Tambah fitur baru'`)
4. **Push** ke branch (`git push origin fitur/baru`)
5. **Buat Pull Request**

### 📝 Panduan Kontribusi

- 🎯 Ikuti style guide yang sudah ada
- 📖 Tambah dokumentasi untuk fitur baru
- ✅ Pastikan semua tes lulus
- 🐛 Report bug dengan jelas

## 📝 Changelog

### v2.0.0 (2025-01-08)
- ✨ **NEW**: Sidebar interface yang persisten
- ✨ **NEW**: Filter periode pajak otomatis
- ✨ **NEW**: One-click download functionality
- 🐛 **FIX**: Enhanced error handling
- 🔧 **IMPROVEMENT**: Better user experience
- 🔧 **IMPROVEMENT**: Manifest V3 compatibility

### v1.x.x - Legacy Versions
- 📦 Popup interface dasar
- 📦 Seleksi dokumen manual
- 📦 Fungsionalitas batch download

## 📞 Dukungan & Kontak

Untuk dukungan teknis atau pertanyaan:

- 📧 **Email**: support@alatpajak.my.id
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/username/BukpotExpress/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/username/BukpotExpress/discussions)

## ⚖️ Lisensi

Proyek ini dilisensikan di bawah **MIT License** - lihat file [LICENSE](LICENSE) untuk detailnya.

## 🙏 Kredit

- **Direktorat Jenderal Pajak** - Portal CoreTax DJP
- **AlatPajakID Dev Team** - Inisiator
- **Kontributor Komunitas** - Dukungan dan feedback

---

<div align="center">

**[🔝 Kembali ke Atas](#-bukpot-express)**

Made with ❤️ by [AlatPajakId Dev](mailto:support@alatpajak.my.id)

© 2025 Bukpot Express. All Rights Reserved.

</div>
