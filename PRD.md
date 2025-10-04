## **Product Requirements Document (PRD): Bukpot Downloader Plus Custom Masa v2.0**

**Dokumen:** PRD Bukpot Downloader Plus Custom Masa Pajak  
**Tanggal:** 3 Oktober 2025  
**Penulis:** Gemini  
**Status:** Draf

### **1. Pendahuluan & Visi Produk**

**Bukpot Downloader Plus Custom Masa** adalah Chrome Extension yang dirancang untuk membantu para profesional pajak dan akuntan dalam mengotomatisasi tugas-tugas repetitif di portal CoreTax DJP. Versi 1.0 sukses dalam memfasilitasi pengunduhan multi-dokumen secara massal berdasarkan pilihan pengguna.

**Visi untuk v2.0** adalah untuk meningkatkan efisiensi secara signifikan dengan mengotomatisasi alur kerja yang lebih lengkap, dimulai dari perubahan filter masa pajak hingga pengunduhan semua dokumen yang relevan, semuanya dari antarmuka *sidebar* yang modern dan persisten.

### **2. Latar Belakang & Masalah yang Diselesaikan**

Saat ini, pengguna harus melakukan beberapa langkah manual sebelum dapat mengunduh dokumen:

1.  Login ke portal CoreTax.
2.  **Secara manual**, mengubah filter "Masa Pajak" ke bulan dan tahun yang diinginkan.
3.  Menunggu halaman memuat ulang data.
4.  **Secara manual**, mencentang kotak untuk setiap dokumen yang ingin diunduh.
5.  Membuka popup extension dan mengklik tombol "Download Selected".

Proses ini, terutama perubahan masa pajak yang berulang-ulang, memakan waktu dan rentan terhadap kesalahan. **v2.0 bertujuan untuk mengotomatisasi langkah 2, 3, dan 4**, mengubah alur kerja multi-langkah menjadi satu klik.

### **3. Tujuan & Sasaran**

| Tujuan Utama | Sasaran Spesifik (Deliverables) |
| :--- | :--- |
| Meningkatkan efisiensi dan pengalaman pengguna secara drastis. | 1. Mengganti antarmuka `popup` dengan `sidebar` yang lebih fungsional. |
| | 2. Mengimplementasikan fitur pemilihan Bulan dan Tahun pada sidebar. |
| | 3. Mengintegrasikan logika dari `FITUR_UBAH_MASA.md` untuk mengubah filter masa pajak secara otomatis. |
| | 4. Membuat alur kerja terpadu: **Pilih Masa Pajak → Klik Tombol → Filter Berubah → Semua Dokumen Terunduh.** |

### **4. Target Pengguna**

  * Staf Pajak Perusahaan
  * Konsultan Pajak
  * Akuntan
  * Siapa saja yang secara rutin mengunduh bukti potong (bukpot) dari portal CoreTax DJP.

### **5. Fitur Utama & User Stories**

#### **Fitur 1: Antarmuka Sidebar**

  * **User Story:** Sebagai pengguna, saya ingin mengakses fungsionalitas extension melalui sidebar agar saya dapat melihat dan berinteraksi dengan kontrol (seperti pilihan bulan) tanpa antarmuka tersebut hilang setelah diklik.

#### **Fitur 2: Filter Masa Pajak Otomatis**

  * **User Story:** Sebagai pengguna, saya ingin dapat memilih bulan dan tahun langsung dari sidebar, sehingga extension dapat secara otomatis menerapkan filter tersebut pada halaman CoreTax untuk saya.

#### **Fitur 3: Alur Kerja Sekali Klik**

  * **User Story:** Sebagai pengguna, saya ingin menekan satu tombol "Terapkan Filter & Unduh Semua" yang akan secara otomatis mengubah masa pajak sesuai pilihan saya, menunggu halaman dimuat, lalu mengunduh semua dokumen yang tersedia pada periode tersebut untuk menghemat waktu saya.

### **6. Alur Kerja Pengguna (User Flow)**

1.  Pengguna membuka halaman CoreTax yang berisi daftar bukti potong.
2.  Pengguna mengklik ikon **Bukpot Downloader Plus Custom Masa** di toolbar Chrome.
3.  **Sidebar** akan muncul di sisi kanan halaman.
4.  Di dalam sidebar, pengguna melihat dua dropdown: "Pilih Bulan" dan "Pilih Tahun".
5.  Pengguna memilih "Juli" pada dropdown bulan dan "2025" pada dropdown tahun.
6.  Pengguna mengklik tombol utama: **"Terapkan & Unduh Semua"**.
7.  Extension memulai proses:
    a. Script disuntikkan ke halaman untuk secara otomatis mengubah filter masa pajak ke "Juli 2025" (menggunakan logika dari `FITUR_UBAH_MASA.md`).
    b. Pengguna melihat halaman CoreTax memuat ulang data sesuai filter baru.
    c. Setelah data dimuat, extension menunggu 2 detik (sesuai spesifikasi `FITUR_UBAH_MASA.md`).
    d. Script pengunduhan (`downloader.js`) secara otomatis dijalankan untuk mengunduh **semua** bukti potong yang muncul di halaman.
8.  Sebuah modal *overlay* (dari `injector.js`) muncul di halaman utama, menampilkan progres unduhan: "Downloading 1 of 50...".
9.  Setelah selesai, modal menampilkan ringkasan: "Download Complete\! 50 file(s) successfully downloaded."

### **7. Desain Antarmuka (UI/UX) - Sidebar**

Sidebar akan memiliki desain yang bersih dan fungsional, konsisten dengan `popup.css` yang ada.

  * **Header:**
      * Logo Sinergi Konsultan (`skilogo48.png`).
      * Judul: "Bukpot Downloader Plus".
  * **Konten Utama:**
      * **Label:** "Pilih Masa Pajak".
      * **Dropdown Bulan:** Berisi daftar bulan (Januari - Desember).
      * **Dropdown Tahun:** Berisi daftar tahun (misal, 5 tahun terakhir).
      * **Tombol Aksi Utama:**
          * Teks: `Terapkan & Unduh Semua`
          * Ikon: Ikon unduh (mirip dengan yang ada di `popup.html`).
          * Status: Tombol akan *disabled* hingga bulan dan tahun dipilih.
  * **Status Area:**
      * Sebuah area teks (mirip `statusArea`) untuk memberikan feedback singkat, misal: "Siap untuk memulai." atau "Proses sedang berjalan...".
  * **Footer:**
      * Versi (`v2.0`).
      * Link "Contact Us".

### **8. Persyaratan Teknis & Rencana Implementasi**

#### **Langkah 1: Migrasi ke Sidebar**

  * **`manifest.json`**:
      * Ubah `action` menjadi `side_panel`.
      * Tambahkan izin `"sidePanel"`.
      * Tentukan `default_path` ke file HTML baru, misal `"sidebar.html"`.
    <!-- end list -->
    ```json
    "permissions": ["activeTab", "scripting", "sidePanel"],
    "side_panel": {
        "default_path": "sidebar.html"
    }
    ```
  * **Buat file baru**:
      * `sidebar.html`: Struktur HTML untuk sidebar (dropdown bulan/tahun, tombol).
      * `sidebar.css`: Styling untuk sidebar (bisa mengadaptasi dari `popup.css`).
      * `sidebar.js`: Logika untuk sidebar. Mengirim pesan ke `background.js` saat tombol diklik, dengan membawa data bulan dan tahun yang dipilih.

#### **Langkah 2: Integrasi Fitur Ubah Masa Pajak**

  * **Ubah `background.js`**:

      * Buat *message listener* baru, misalnya `APPLY_FILTER_AND_DOWNLOAD`.
      * Listener ini akan menerima `bulan` dan `tahun` dari `sidebar.js`.
      * Alur kerja di *background script*:
        1.  Saat menerima pesan, pertama-tama suntikkan script baru yang berisi logika dari `FITUR_UBAH_MASA.md`. Sebut saja `filter_changer.js`.
        2.  `filter_changer.js` akan menjalankan fungsi `setupFilterMasaPajak()` dan mengirim pesan kembali ke `background.js` jika berhasil (`{success: true}`).
        3.  **Setelah** menerima konfirmasi sukses, `background.js` kemudian melanjutkan alur kerja yang sudah ada: menyuntikkan `injector.js` dan `collector.js`.

  * **Buat script baru: `filter_changer.js`**

      * Pindahkan semua fungsi dari `FITUR_UBAH_MASA.md` (`setupFilterMasaPajak`, `findTaxPeriodDropdown`, `openDropdown`, dll.) ke dalam file ini.
      * Pastikan script ini dapat menerima `bulan` dan `tahun` sebagai parameter.
      * Fungsi `runSimpleDownloadScript()` di dalamnya akan menjadi pemicu untuk memulai proses unduh massal setelah filter berhasil. Atau, lebih baik lagi, ia mengirim pesan kembali ke `background.js` untuk menandakan filter selesai, agar `background.js` tetap menjadi orkestrator utama.

#### **Langkah 3: Modifikasi Alur Kerja Pengunduhan**

  * **`collector.js`**:

      * Fungsi ini awalnya dirancang untuk mengumpulkan item dari baris yang *sudah dicentang* (`div.p-highlight`).
      * Untuk alur kerja baru ("Unduh Semua"), `collector.js` perlu dimodifikasi atau didahului oleh script yang **mencentang semua checkbox yang tersedia** di halaman setelah filter diterapkan. Alternatifnya, fungsi `runSimpleDownloadScript` dari `FITUR_UBAH_MASA.md` yang langsung mengklik semua tombol `#DownloadButton` dapat digunakan sebagai pengganti `collector.js` dan `downloader.js` untuk alur kerja ini.
      * **Rekomendasi:** Gunakan pendekatan dari `runSimpleDownloadScript` untuk kesederhanaan, karena ini sesuai dengan permintaan "Unduh Semua".

  * **`downloader.js` & `injector.js`**:

      * Logika di `downloader.js` dan `injector.js` mungkin perlu disesuaikan jika kita beralih ke `runSimpleDownloadScript`, tetapi konsep modal progres tetap sangat relevan dan harus dipertahankan untuk memberikan feedback kepada pengguna.

### **9. Metrik Keberhasilan**

  * **Pengurangan Waktu Tugas:** Waktu yang dibutuhkan untuk mengunduh semua bukti potong dari satu masa pajak berkurang minimal 80%.
  * **Adopsi Fitur:** Mayoritas pengguna aktif menggunakan alur kerja "Terapkan & Unduh Semua".
  * **Feedback Pengguna:** Umpan balik kualitatif yang positif melalui email "Contact Us" atau ulasan di Chrome Web Store.

### **10. Pertimbangan Masa Depan (Post v2.0)**

  * **Unduh Multi-Bulan:** Memungkinkan pengguna memilih rentang masa pajak (misal: Juli - September 2025) dan mengunduh semuanya dalam satu sesi.
  * **Penamaan File Otomatis:** Memberikan opsi untuk mengganti nama file yang diunduh secara otomatis dengan format yang lebih informatif (misal: `Bukpot_NPWP_MasaPajak_Nomor.pdf`).
  * **Dukungan Jenis Dokumen Lain:** Memperluas fungsionalitas untuk mengunduh jenis dokumen lain yang tersedia di CoreTax.