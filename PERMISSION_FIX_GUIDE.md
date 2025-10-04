# 🚨 Panduan Perbaikan Permission Error

## Masalah
```
Cannot access contents of the page. Extension manifest must request permission to access the respective host.
```

## ✅ Solusi Cepat (Langkah demi Langkah)

### 1. Reload Extension
1. Buka **chrome://extensions/** di address bar
2. Cari **"Bukpot Downloader With Filter Masa Pajak"**
3. Klik tombol **🔄 Reload** (icon segitiga melingkar)

### 2. Refresh Halaman
1. Kembali ke halaman **Coretax DJP**
2. Tekan **F5** atau **Ctrl+R** untuk refresh halaman

### 3. Coba Kembali
1. Klik ikon ekstensi di toolbar Chrome
2. Pilih mode download
3. Klik tombol download

## 🔍 Penyebab Masalah
- Manifest.json telah diperbarui dengan host permissions yang diperlukan
- Chrome Extension perlu di-reload untuk menerapkan perubahan manifest
- Halaman web perlu di-refresh agar extension bisa mengaksesnya

## ⚡ Tips Tambahan
- Pastikan Anda berada di halaman **https://coretax.pajak.go.id/**
- Jika masalah berlanjut, coba **restart Chrome browser**
- Pastikan ekstensi dalam status **"On"** (tidak disabled)

## 📋 Fitur yang Tersedia Setelah Fix
- ✅ Download Satu Halaman (mode existing)
- ✅ Download Semua Halaman (multi-halaman baru)
- ✅ Filter Masa Pajak
- ✅ Progress Indicator dan Status Log