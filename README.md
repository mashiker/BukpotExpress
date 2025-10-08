# 📋 Bukpot Express

[![Version](https://img.shields.io/badge/version-2.0-blue.svg)](https://github.com/username/BukpotExpress)
[![Chrome Extension](https://img.shields.io/badge/chrome-extension-green.svg)](https://chrome.google.com/webstore)
[![License](https://img.shields.io/badge/license-Apache%202.0%20%2B%20Commons%20Clause-orange.svg)](LICENSE)

**Bukpot Express** adalah ekstensi Chrome yang dirancang khusus untuk mengotomatisasi proses pengunduhan dokumen perpajakan (bukti potong) dari portal CoreTax DJP (Direktorat Jenderal Pajak) Indonesia.

## ✨ Fitur Utama

### 🚀 Yang Baru di v2.0
- **📱 Dual Interface**: Pilihan antara Popup dan Sidebar interface untuk pengalaman pengguna yang fleksibel
- **🔄 Filter Otomatis**: Secara otomatis mengubah filter periode pajak (bulan/tahun)
- **⚡ One-Click Download**: Terapkan filter dan unduh semua dokumen dengan satu klik
- **📊 Status Update**: Informasi progres real-time selama proses berlangsung
- **🛡️ Enhanced Error Handling**: Pesan error yang lebih baik dan mekanisme pemulihan otomatis
- **💡 Tips Section**: Panduan penggunaan dan solusi masalah yang terintegrasi
- **🎯 Clean Interface**: Antarmuka yang minimalis dengan sections yang dapat di-expand/collapse
- **🚀 Cross-Promotion**: Informasi tentang tools pajak lainnya dari AlatPajakID

### 🔧 Kemampuan Teknis
- ✅ **Manifest V3 Compatible**: Mendukung standar ekstensi Chrome terbaru
- ✅ **Side Panel API**: Integrasi dengan API Sidebar Chrome
- ✅ **Smart Injection**: Penyuntikan skrip yang lebih baik ke halaman web
- ✅ **State Management**: Manajemen status yang ditingkatkan
- ✅ **Comprehensive Logging**: Logging detail untuk debugging
- ✅ **Permission Recovery**: Pemulihan izin otomatis untuk kemudahan pengguna
- ✅ **Queue Processing**: Pengolahan antrian download yang lebih andal

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

1. **🌐 Buka CoreTax**: Masuk ke portal CoreTax DJP dan buka halaman "Bukti Potong" (BPPU atau BP series)
2. **📱 Buka Ekstensi**: Klik ikon ekstensi di toolbar Chrome (popup/sidebar akan terbuka)
3. **📅 Pilih Periode Pajak**:
   - Pilih bulan yang diinginkan dari dropdown "Pilih Bulan"
   - Pilih tahun yang diinginkan dari dropdown "Pilih Tahun"
4. **▶️ Mulai Proses**: Klik tombol "Filter & Download" atau "Unduh Semua Bukti Potong"
5. **📊 Monitor Progres**: Amati area status untuk update real-time
6. **✅ Unduh Selesai**: Semua dokumen akan otomatis terunduh ke folder Downloads

### Flow Proses

```
Pilih Bulan/Tahun → Klik Tombol → Filter Diterapkan → Halaman Refresh → Auto-Download Mulai → File Terunduh
```

## 🖥️ Antarmuka Pengguna

### Komponen Utama

- **🎨 Logo**: Branding Bukpot Express dengan versi
- **📖 Cara Penggunaan**: Tutorial interaktif yang dapat di-expand/collapse (default minimized)
- **💡 Tips Penting**: Panduan troubleshooting dan informasi reload manual (default minimized)
- **🔍 Filter Section**: Dropdown selector bulan dan tahun
- **⚡ Action Buttons**: Tombol download dengan tombol STOP untuk menghentikan proses
- **📊 Status Area**: Pesan progres dan status real-time
- **🚀 Promosi Banner**: Informasi tentang E-faktur Automation dan donasi
- **ℹ️ Footer**: Informasi pendukung dan kredit

### Panduan Sections

#### 📖 Cara Penggunaan (Default Minimized)
- **Langkah 1**: Persiapan - Login ke CoreTax DJP dan buka halaman Bukti Potong
- **Langkah 2**: Pilih Masa Pajak - Pilih bulan dan tahun
- **Langkah 3**: Mulai Download - Klik tombol download
- **Langkah 4**: Tunggu Proses - Download otomatis dengan jeda

#### 💡 Tips Penting (Default Minimized)
- **🔄 Cara Reload Ekstensi Manual**: Langkah-langkah jika ekstensi tidak merespon
- **⏹️ Cara Menghentikan Download**: Metode STOP button dan alternatif tutup browser
- **🔧 Solusi Masalah Umum**: Troubleshooting untuk berbagai isu

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
├── 📄 manifest.json           # Konfigurasi ekstensi (Manifest V3)
├── 🎨 popup.html             # Antarmuka popup
├── 🎨 popup.css              # Styling popup
├── ⚙️ popup.js               # Logika popup
├── 🎨 sidebar.html           # Antarmuka sidebar
├── 🎨 sidebar.css            # Styling sidebar
├── ⚙️ sidebar.js             # Logika sidebar
├── 🔧 background.js          # Background service worker dengan permission recovery
├── 🔄 filter_changer.js      # Otomasi filter periode pajak
├── 📥 collector.js           # Logika pengumpulan dokumen
├── 💉 injector.js            # Injeksi modal progres
├── ⬇️ downloader.js          # Koordinasi pengunduhan single page
├── 📄 multi_page_downloader.js # Pengunduhan multi-halaman
├── 🖼️ images/                # Ikon ekstensi
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── 📖 README.md              # Dokumentasi ini
├── ✅ TESTING_CHECKLIST.md   # Daftar periksa pengujian
├── 📄 LICENSE                # Apache 2.0 + Commons Clause
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

### Masalah Umum & Solusi

#### 1. **Ekstensi tidak merespon**
- ✅ **Cara 1**: Buka `chrome://extensions/` → Cari "Bukpot Express" → Klik 🔄 Reload
- ✅ **Cara 2**: Refresh halaman CoreTax dan coba kembali
- ✅ **Cara 3**: Restart browser Chrome

#### 2. **Filter tidak diterapkan**
- ✅ Pastikan berada di halaman CoreTax yang benar dengan daftar dokumen
- ✅ Pastikan dropdown periode pajak terlihat di halaman
- ✅ Coba refresh halaman dan restart proses

#### 3. **Download macet atau error**
- ✅ Klik tombol **STOP** untuk menghentikan proses
- ✅ Jika tombol tidak berfungsi, tutup browser Chrome
- ✅ Mulai kembali dengan filter yang sama

#### 4. **Permission denied error**
- ✅ Reload ekstensi secara manual melalui `chrome://extensions/`
- ✅ Refresh halaman CoreTax
- ✅ Coba proses kembali

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

## 🚀 Tools Lainnya oleh AlatPajakID

### E-faktur Automation
**Cape kreditkan pajak masukan satu-satu? Otomatisasikan dengan E-faktur Automation!**

- 🚀 **Solusi cerdas** untuk efisiensi pajak Anda
- ⚡ **Otomasi lengkap** proses input pajak masukan
- 💡 ** hemat waktu** dan kurangi human error
- 📈 **Tingkatkan produktivitas** tim akuntansi Anda

**[👉 Cek sekarang di alatpajak.id](https://alatpajak.id)**

## 🤝 Dukung Pengembangan

Jika Anda merasa tools ini bermanfaat, dukung pengembangan kami:

- ☕ **[Buy Me Coffee](https://trakteer.id/alatpajakid/tip)** - Dukung developer dengan donasi
- 🌟 **Beri bintang** di repository GitHub
- 🐛 **Report bug** dan berikan feedback
- 📢 **Bagikan** ke rekan kerja Anda

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

### v2.0.1 (2025-01-08)
- ✨ **NEW**: Clean interface dengan sections yang default minimized
- ✨ **NEW**: Tips Section dengan panduan troubleshooting terintegrasi
- ✨ **NEW**: Promosi banner untuk E-faktur Automation
- ✨ **NEW**: Buy Me Coffee donation link
- 🐛 **FIX**: Single page download sekarang mengunduh semua file, bukan hanya file pertama
- 🔧 **IMPROVEMENT**: Update license ke Apache 2.0 + Commons Clause
- 🔧 **IMPROVEMENT**: Enhanced permission recovery system
- 🔧 **IMPROVEMENT**: Better error handling dan user feedback
- 🗑️ **REMOVED**: Hard Refresh button (diganti dengan panduan manual)

### v2.0.0 (2025-01-08)
- ✨ **NEW**: Sidebar interface yang persisten
- ✨ **NEW**: Filter periode pajak otomatis
- ✨ **NEW**: One-click download functionality
- ✨ **NEW**: Enhanced error handling dengan automatic recovery
- 🔧 **IMPROVEMENT**: Manifest V3 compatibility
- 🔧 **IMPROVEMENT**: Better user experience
- 🔧 **IMPROVEMENT**: Comprehensive logging system

### v1.x.x - Legacy Versions
- 📦 Popup interface dasar
- 📦 Seleksi dokumen manual
- 📦 Fungsionalitas batch download

## 📞 Dukungan & Kontak

Untuk dukungan teknis atau pertanyaan:

- 📧 **Email**: support@alatpajak.my.id
- 🌐 **Website**: [alatpajak.id](https://alatpajak.id)
- ☕ **Donasi**: [Trakteer](https://trakteer.id/alatpajakid/tip)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/username/BukpotExpress/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/username/BukpotExpress/discussions)

## ⚖️ Lisensi

Proyek ini dilisensikan di bawah **Apache License 2.0 dengan Commons Clause** - lihat file [LICENSE](LICENSE) untuk detailnya.

### 📋 Ringkasan Lisensi

- ✅ **Penggunaan Gratis**: Untuk keperluan personal dan non-komersial
- ✅ **Modifikasi**: Dapat mengubah source code
- ✅ **Distribusi**: Dapat mendistribusikan untuk non-komersial
- ❌ **Komersial**: Diperlukan izin tertulis untuk penggunaan komersial
- 📞 **Lisensi Komersial**: Hubungi support@alatpajak.my.id

## 🙏 Kredit

- **Direktorat Jenderal Pajak** - Portal CoreTax DJP
- **AlatPajakID Dev Team** - Inisiator dan maintainer
- **Kontributor Komunitas** - Dukungan, feedback, dan testing
- **Pengguna Setia** - Yang terus mendukung pengembangan tools pajak gratis

---

<div align="center">

**[🔝 Kembali ke Atas](#-bukpot-express)**

Made with ❤️ by [AlatPajakId Dev](mailto:support@alatpajak.my.id)

© 2025 Bukpot Express. Licensed under Apache 2.0 + Commons Clause.

</div>