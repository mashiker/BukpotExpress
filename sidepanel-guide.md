# Panduan Pengaturan SidePanel pada E-Faktur Automation

## Pendahuluan

SidePanel adalah fitur dari Google Chrome Extension Manifest V3 yang memungkinkan ekstensi menampilkan antarmuka pengguna (UI) di panel samping browser. Pada proyek E-Faktur Automation, SidePanel digunakan untuk menampilkan antarmuka utama aplikasi yang dapat diakses dengan mudah oleh pengguna.

## Konfigurasi di manifest.json

Untuk mengaktifkan SidePanel pada ekstensi Chrome, kita perlu menambahkan beberapa konfigurasi di file `manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "E-Faktur Automation",
  "version": "1.3",
  "description": "Automates E-Faktur processes based on CSV data.",
  "permissions": [
    "activeTab",
    "scripting",
    "storage",
    "offscreen",
    "identity",
    "tabs",
    "sidePanel"
  ],
  "side_panel": {
    "default_path": "popup.html"
  },
  // ... konfigurasi lainnya
}
```

### Elemen Kunci:

1. **`permissions`**: Menambahkan `"sidePanel"` untuk memberikan izin kepada ekstensi menggunakan SidePanel API
2. **`side_panel`**: Konfigurasi SidePanel dengan:
   - `default_path`: Path ke file HTML yang akan ditampilkan di SidePanel

## Struktur HTML SidePanel

File `popup.html` digunakan sebagai antarmuka untuk SidePanel:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Faktur Automation</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="card">
        <div class="header">
            <img src="images/icon48.png" alt="Logo">
            <h2 class="header-title">E-Faktur Automation by alatpajak.id</h2>
        </div>

        <!-- Login Form Section -->
        <div id="login-section" class="container">
            <!-- Konten formulir login -->
        </div>

        <!-- Automation UI Section (awalnya disembunyikan) -->
        <div id="automation-section" class="container" style="display: none;">
            <!-- Konten antarmuka otomasi -->
        </div>
    </div>

    <!-- Loading Overlay -->
    <div id="loading-overlay" class="loading-overlay" style="display: none;">
        <div class="spinner"></div>
    </div>

    <!-- App Scripts -->
    <script src="popup.js"></script>
</body>
</html>
```

## JavaScript untuk SidePanel

File `popup.js` mengandung logika untuk mengoperasikan SidePanel:

```javascript
// DOM Elements - akan diinisialisasi setelah DOM dimuat
let loadingOverlay, loginSection, automationSection, emailInput, passwordInput;
let loginButton, googleLoginButton, switchAccountButton, websiteButton, loginError, logoutButton;
let userEmailSpan, subscriptionStatusSpan, upgradeButton, quotaDisplay;
let csvFileInput, fileNameDisplay, bulanSelect, aksiSelect, startBtn, stopBtn, statusLog, clearLogBtn, downloadTemplateLink, exportLogBtn;

// Fungsi untuk menampilkan log real-time
const renderLogs = (logs = []) => {
    if (logs.length === 0) {
        statusLog.innerHTML = 'Status: Menunggu perintah...';
    } else {
        statusLog.innerHTML = logs.join('<br>');
    }
    statusLog.scrollTop = statusLog.scrollHeight; // Scroll ke bawah untuk log baru
};

// Fungsi untuk memperbarui dan menyimpan status
const updateAndSaveStatus = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLogEntry = `[${timestamp}] ${message}`;

    chrome.storage.local.get({ efakturLogs: [] }, (result) => {
        const logs = result.efakturLogs;
        logs.push(newLogEntry); // Tambahkan ke akhir untuk urutan kronologis
        if (logs.length > 1000) logs.splice(0, logs.length - 1000); // Simpan 1000 log terakhir
        chrome.storage.local.set({ efakturLogs: logs }, () => {
            renderLogs(logs);
        });
    });
};

// Fungsi untuk menampilkan/menyembunyikan loading
function showLoading() {
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    if (loadingOverlay) loadingOverlay.style.display = 'none';
}

// ... fungsi lainnya untuk mengatur autentikasi, otomasi, dll.
```

## Cara Membuka SidePanel

### Secara Manual:

1. Klik kanan pada halaman web
2. Pilih "Inspect" untuk membuka DevTools
3. Klik pada ikon "⛶" (tombol panel samping) di DevTools
4. Pilih ekstensi "E-Faktur Automation" dari dropdown

### Secara Programmatic:

```javascript
// Dari background script atau content script
chrome.sidePanel.open({ tabId: tab.id })
  .then(() => {
    console.log('SidePanel opened');
  })
  .catch(error => {
    console.error('Error opening SidePanel:', error);
  });
```

## Keuntungan Menggunakan SidePanel

1. **Persistensi**: SidePanel tetap terbuka saat pengguna bernavigasi antar tab
2. **Akses Mudah**: Pengguna dapat mengakses fitur ekstensi tanpa perlu membuka popup baru
3. **Ruang Lebih**: SidePanel memiliki ruang yang lebih besar dibandingkan popup biasa
4. **Kontinuitas**: Cocok untuk tugas-tugas yang berjalan dalam waktu lama seperti otomasi

## Best Practices untuk SidePanel

1. **Desain Responsif**: Pastikan antarmuka dapat menyesuaikan dengan lebar SidePanel
2. **Performa**: Optimalkan JavaScript untuk mencegah lag pada panel
3. **Error Handling**: Implementasikan error handling yang baik untuk pengalaman pengguna yang lebih baik
4. **State Management**: Gunakan chrome.storage untuk menyimpan state pengguna antar sesi

## Troubleshooting Umum

### SidePanel tidak muncul:
- Periksa apakah `"sidePanel"` sudah ditambahkan di permissions
- Pastikan `default_path` mengarah ke file yang benar
- Reload ekstensi setelah mengubah manifest.json

### Fungsi tidak berjalan di SidePanel:
- Pastikan semua resource JavaScript dimuat dengan benar
- Periksa console error di DevTools
- Verifikasi permissions yang diperlukan sudah ada di manifest.json

### Styling tidak berfungsi:
- Pastikan file CSS terhubung dengan benar
- Periksa CSS specificity untuk elemen SidePanel
- Gunakan Developer Tools untuk memeriksa styling

## Kesimpulan

SidePanel adalah fitur yang powerful untuk ekstensi Chrome yang membutuhkan antarmuka persisten dan akses mudah. Pada E-Faktur Automation, SidePanel digunakan untuk menampilkan antarmuka utama yang memungkinkan pengguna mengakses fitur otomasi dengan mudah sambil tetap dapat melakukan navigasi pada browser.