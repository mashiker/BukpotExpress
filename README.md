# 📋 Bukpot Express

[![Version](https://img.shields.io/badge/version-2.0-blue.svg)](https://github.com/username/BukpotExpress)
[![Chrome Extension](https://img.shields.io/badge/chrome-extension-green.svg)](https://chrome.google.com/webstore)
[![License](https://img.shields.io/badge/license-Apache%202.0%20%2B%20Commons%20Clause-orange.svg)](LICENSE)

**Bukpot Express** adalah ekstensi Chrome yang dirancang khusus untuk mengotomatisasi proses pengunduhan dokumen perpajakan (bukti potong) dari portal CoreTax DJP (Direktorat Jenderal Pajak) Indonesia.

## ✨ Fitur Utama

### 🚀 Fitur Unggulan yang Membuat Hidup Lebih Mudah!

- **⚡ Download 100+ Dokumen SEKALI KLIK** - Berhenti klik satu per satu! Cukup pilih bulan/tahun, klik tombol, dan semua bukti potong akan terunduh otomatis. ** hemat waktu berjam-jam!**

- **🎯 Interface Sidebar yang Smart** - Tetap bekerja di CoreTax sambil ekstensi terbuka di samping! Tidak perlu lagi pindah-pindah tab yang bikin pusing.

- **🔄 Filter Otomatis Anti Ribet** - Lupakan scroll-scroll mencari periode pajak! Cukup pilih bulan & tahun dari dropdown, ekstensi yang akan mengatur semuanya.

- **🛡️ Anti Error & Auto Recovery** - Sistem cerdas yang secara otomatis memperbaiki error dan melanjutkan download dari mana berhenti. **No more frustasi!**

- **📊 Progres Real-time yang Memuaskan** - Pantau setiap file yang diunduh dengan status update yang jelas. Tahu persis kapan pekerjaan selesai!

- **💡 Tips & Trik Terintegrasi** - Panduan lengkap langsung di ekstensi! Dari cara reload hingga solusi masalah, semua ada tanpa perlu browsing.

- **⏹️ Stop Button yang Andal** - Tombol STOP yang berfungsi dengan baik, menampilkan jumlah file yang berhasil diunduh saat proses dihentikan.

- **📄 Multi-Page Download** - Kemampuan mengunduh dokumen dari beberapa halaman secara otomatis dengan navigasi pintar.

- **⏰ Waktu Terbaik Penggunaan** - Tips optimal untuk menggunakan ekstensi saat CoreTax sedang lancar.

### 🔧 Kemampuan Teknis Canggih di Balik Kemudahan
- ✅ **Manifest V3 Compatible** - Teknologi terbaru Chrome yang lebih aman dan cepat
- ✅ **Side Panel API** - Interface modern yang tidak mengganggu workflow
- ✅ **Smart Injection** - Sistem cerdas yang bekerja sempurna di halaman CoreTax
- ✅ **Auto Recovery System** - Bangkit sendiri dari error tanpa perlu restart
- ✅ **Queue Processing** - Download rapih teratur seperti antrian bank
- ✅ **Permission Management** - Tidak perlu setting manual, semua otomatis
- ✅ **Enhanced Stop Functionality** - Stop button dengan accurate progress reporting
- ✅ **Multi-Page Navigation** - Navigasi otomatis antar halaman dengan konfirmasi perubahan
- ✅ **Frame Broadcasting** - Pengiriman perintah ke semua frame untuk reliability
- ✅ **Message Port Handling** - Penanganan error komunikasi async yang robust

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
4. **⚙️ Pilih Mode Download**:
   - **Single Page**: Download semua dokumen dari halaman saat ini
   - **Multi-Page**: Download dari semua halaman yang tersedia
5. **▶️ Mulai Proses**: Klik tombol "Filter & Download"
6. **📊 Monitor Progres**: Amati area status untuk update real-time
7. **⏹️ Stop Kapan Saja**: Klik tombol "STOP Download" untuk menghentikan proses
8. **✅ Unduh Selesai**: Semua dokumen akan otomatis terunduh ke folder Downloads

### Flow Proses

```
Pilih Bulan/Tahun → Pilih Mode Download → Klik Tombol → Filter Diterapkan → Halaman Refresh → Auto-Download Mulai → File Terunduh
```

## 🖥️ Antarmuka Pengguna

### Komponen Utama

- **🎨 Logo**: Branding Bukpot Express dengan versi
- **📖 Cara Penggunaan**: Tutorial interaktif yang dapat di-expand/collapse (default minimized)
- **💡 Tips Penting**: Panduan troubleshooting, tips penggunaan optimal, dan informasi reload manual (default minimized)
- **🔍 Filter Section**: Dropdown selector bulan dan tahun
- **⚙️ Mode Download**: Pilihan antara Single Page dan Multi-Page download
- **⚡ Action Buttons**: Tombol "Filter & Download" dengan tombol "STOP Download" yang andal
- **📊 Status Area**: Pesan progres dan status real-time dengan update yang jelas
- **🚀 Promosi Banner**: Informasi tentang E-faktur Automation dan donasi
- **ℹ️ Footer**: Informasi pendukung dan kredit

### Panduan Sections

#### 📖 Cara Penggunaan (Default Minimized)
- **Langkah 1**: Persiapan - Login ke CoreTax DJP dan buka halaman Bukti Potong
- **Langkah 2**: Pilih Masa Pajak - Pilih bulan dan tahun
- **Langkah 3**: Mulai Download - Klik tombol download
- **Langkah 4**: Tunggu Proses - Download otomatis dengan jeda

#### 💡 Tips Penting (Default Minimized)
- **⏰ Waktu Terbaik Penggunaan**: Tips optimal menggunakan ekstensi saat CoreTax lancar
- **🔄 Cara Reload Ekstensi Manual**: Langkah-langkah jika ekstensi tidak merespon
- **⏹️ Cara Menghentikan Download**: Metode STOP button yang andal dan alternatif
- **🔧 Solusi Masalah Umum**: Troubleshooting untuk berbagai isu

### Pesan Status

- **🟢 Siap**: "Siap untuk memulai unduh otomatis."
- **🟡 Memfilter**: "Menerapkan filter masa pajak..."
- **🔥 Berhasil**: "Filter berhasil diterapkan. Memulai proses unduh otomatis..."
- **💪 Mengunduh**: "Mengunduh semua dokumen..." / "📥 Mengunduh halaman X dari beberapa halaman..."
- **⏹️ Dihentikan**: "⏹️ Download dihentikan oleh user" dengan jumlah file yang berhasil diunduh
- **✅ Selesai**: "Proses unduh selesai!" / "Download multi-halaman selesai! Total: X file dari Y halaman"
- **❌ Error**: Pesan error deskriptif
- **⚠️ Timeout**: "Multi-page download timeout - process may still be running"

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
└── 📄 LICENSE                # Apache 2.0 + Commons Clause
```

## 🔐 Izin & Keamanan

### Permissions yang Diperlukan

- **`activeTab`**: Akses ke tab yang sedang aktif
- **`scripting`**: Menyuntikkan skrip ke halaman web
- **`sidePanel`**: Membuka dan mengelola antarmuka sidebar
- **`storage`**: Menyimpan preferensi dan state ekstensi
- **`tabs`**: Membuka tab baru untuk link promosi

### Host Permissions

- **`https://coretax.pajak.go.id/*`**: Portal CoreTax DJP
- **`https://*.coretax.pajak.go.id/*`**: Subdomain Coretax
- **`https://coretaxdjp.pajak.go.id/*`**: Portal Coretax DJP Alternative
- **`https://*.coretaxdjp.pajak.go.id/*`**: Subdomain Coretax DJP Alternative

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
- ✅ Klik tombol **STOP** untuk menghentikan proses (akan menampilkan jumlah file yang berhasil diunduh)
- ✅ Jika tombol tidak berfungsi, tutup browser Chrome
- ✅ Mulai kembali dengan filter yang sama
- ✅ Multi-page download memiliki safety timeout 60 detik untuk mencegah stuck state

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
   - `Downloader:` (Single page download logs)
   - `Multi-page downloader:` (Multi-page download logs)
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

### v2.0 (2025-10-09)
- 🐛 **FIX**: Stop button sekarang menampilkan jumlah file yang benar saat dihentikan (sebelumnya selalu 0)
- 🐛 **FIX**: Multi-page download error "message port closed before a response was received" telah diatasi
- 🐛 **FIX**: Enhanced stop functionality dengan frame broadcasting untuk reliability
- ✨ **NEW**: Multi-page download dengan navigasi otomatis antar halaman
- ✨ **NEW**: Mode download pilihan antara Single Page dan Multi-Page
- ✨ **NEW**: Tips "Waktu Terbaik Penggunaan" untuk optimal performance
- ✨ **NEW**: Safety timeout 60 detik untuk mencegah stuck state di multi-page download
- ✨ **NEW**: Enhanced logging system untuk debugging yang lebih baik
- 🔧 **IMPROVEMENT**: Message port handling untuk komunikasi async yang robust
- 🔧 **IMPROVEMENT**: Enhanced error handling dengan automatic recovery
- 🔧 **IMPROVEMENT**: Additional host permissions untuk broader CoreTax compatibility
- 🔧 **IMPROVEMENT**: UI improvements dengan proper z-index dan pointer events
- 🔧 **IMPROVEMENT**: Better status reporting untuk multi-page download progress

### v1.0 (2025-10-08)
- ✨ **NEW**: Sidebar interface yang persisten dengan Side Panel API
- ✨ **NEW**: Filter periode pajak otomatis dengan dropdown bulan/tahun
- ✨ **NEW**: One-click download functionality untuk kemudahan pengguna
- ✨ **NEW**: Enhanced error handling dengan automatic recovery
- ✨ **NEW**: Clean interface dengan sections yang default minimized
- ✨ **NEW**: Tips Section dengan panduan troubleshooting terintegrasi
- ✨ **NEW**: Promosi cards untuk E-faktur Automation dan Buy Me Coffee donation
- ✨ **NEW**: Modern UI/UX design dengan gradient dan smooth animations
- 🔧 **IMPROVEMENT**: Manifest V3 compatibility
- 🔧 **IMPROVEMENT**: Enhanced permission recovery system
- 🔧 **IMPROVEMENT**: Comprehensive logging system
- 🔧 **IMPROVEMENT**: Better error handling dan user feedback
- 🔧 **IMPROVEMENT**: Update license ke Apache 2.0 + Commons Clause
- 🐛 **FIX**: Single page download sekarang mengunduh semua file, bukan hanya file pertama
- 🗑️ **REMOVED**: Hard Refresh button (diganti dengan panduan manual On/Off)

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