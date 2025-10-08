// Bukpot Downloader With Filter Masa Pajak - Chrome Extension
// Version 2.0
// Automated tax document downloader with period filtering

// DOM Elements - akan diinisialisasi setelah DOM dimuat
let loadingOverlay, mainSection, bulanSelect, tahunSelect;
let filterBtn, statusLog, clearLogBtn, stopBtn, hardRefreshBtn;
let downloadModeRadios;

// Inisialisasi DOM elements
function initializeElements() {
    loadingOverlay = document.getElementById('loading-overlay');
    mainSection = document.getElementById('main-section');
    bulanSelect = document.getElementById('bulanSelect');
    tahunSelect = document.getElementById('tahunSelect');
    filterBtn = document.getElementById('filterBtn');
    stopBtn = document.getElementById('stopBtn');
    hardRefreshBtn = document.getElementById('hardRefreshBtn');
    statusLog = document.getElementById('statusLog');
    clearLogBtn = document.getElementById('clearLogBtn');
    downloadModeRadios = document.querySelectorAll('input[name="downloadMode"]');
}

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
    if (loadingOverlay) {
        // Don't show the loading overlay that blocks the stop button
        // The stop button should remain accessible during download
        console.log('showLoading: Skipping overlay to keep stop button accessible');
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        // Hide after transition
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 300);
    }
}

// Populate tahun select dengan tahun-tahun terkini
function populateYearSelect() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5; // 5 tahun ke belakang

    for (let year = currentYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year.toString();
        option.textContent = year.toString();
        tahunSelect.appendChild(option);
    }
}

// Fungsi untuk mendapatkan mode download yang dipilih
function getSelectedDownloadMode() {
    for (let radio of downloadModeRadios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return 'single'; // default value
}

// Fungsi untuk mengatur tampilan tombol download/stop
function setDownloadButtonState(isDownloading) {
    if (filterBtn && stopBtn) {
        if (isDownloading) {
            filterBtn.style.display = 'none';
            stopBtn.style.display = 'flex';
        } else {
            filterBtn.style.display = 'flex';
            stopBtn.style.display = 'none';
        }
    }
}

// Event listeners
function setupEventListeners() {
    // Filter button - filter by tax period then download
    filterBtn.addEventListener('click', () => {
        const selectedMonth = bulanSelect.value;
        const selectedYear = tahunSelect.value;

        if (!selectedMonth || !selectedYear) {
            updateAndSaveStatus("⚠️ Silakan pilih bulan dan tahun terlebih dahulu");
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                const downloadMode = getSelectedDownloadMode();
                const monthName = bulanSelect.options[bulanSelect.selectedIndex].text;
                const modeText = downloadMode === 'single' ? 'satu halaman' : 'semua halaman';
                updateAndSaveStatus(`Menerapkan filter: ${monthName} ${selectedYear} (mode: ${modeText})`);
                showLoading();
                setDownloadButtonState(true);

                chrome.runtime.sendMessage({
                    type: "APPLY_FILTER_AND_DOWNLOAD",
                    tabId: tabs[0].id,
                    month: selectedMonth,
                    year: selectedYear,
                    downloadMode: downloadMode
                });
            }
        });
    });

    // Stop button - stop download
    stopBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                updateAndSaveStatus("⏹️ Menghentikan proses download...");
                chrome.runtime.sendMessage({
                    type: "STOP_DOWNLOAD",
                    tabId: tabs[0].id
                });
            }
        });
    });

    // Hard refresh button - reload extension
    hardRefreshBtn.addEventListener('click', () => {
        updateAndSaveStatus("🔄 Melakukan hard refresh extension...");

        // Show loading state
        hardRefreshBtn.disabled = true;
        hardRefreshBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon spinning">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            <span>Refreshing...</span>
        `;

        // Send message to background script to reload extension
        chrome.runtime.sendMessage({
            type: "RELOAD_EXTENSION"
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error reloading extension:", chrome.runtime.lastError);
                updateAndSaveStatus("❌ Gagal reload extension: " + chrome.runtime.lastError.message);

                // Reset button state
                hardRefreshBtn.disabled = false;
                hardRefreshBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
                    <span>Hard Refresh</span>
                `;
            } else {
                updateAndSaveStatus("✅ Extension berhasil di-reload");

                // Extension will reload, popup will close automatically
                setTimeout(() => {
                    window.close();
                }, 1000);
            }
        });
    });

    // Clear log button
    clearLogBtn.addEventListener('click', () => {
        chrome.storage.local.set({ efakturLogs: [] }, () => {
            renderLogs([]);
            updateAndSaveStatus("Log telah dibersihkan");
        });
    });
}

// Listen for status updates from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'UPDATE_STATUS') {
        updateAndSaveStatus(message.status);

        if (message.complete) {
            hideLoading();
            setDownloadButtonState(false);
        }
    }
});

// Initialize saat DOM dimuat
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    populateYearSelect();
    setupEventListeners();
    setupTutorialToggle();

    // Load existing logs dari storage
    chrome.storage.local.get({ efakturLogs: [] }, (result) => {
        renderLogs(result.efakturLogs);
    });
});

// Tutorial toggle functionality
function setupTutorialToggle() {
    const tutorialToggle = document.getElementById('tutorialToggle');
    const tutorialContent = document.getElementById('tutorialContent');
    const toggleIcon = document.getElementById('toggleIcon');
    let isTutorialExpanded = true; // Start expanded

    if (tutorialToggle && tutorialContent && toggleIcon) {
        tutorialToggle.addEventListener('click', function() {
            isTutorialExpanded = !isTutorialExpanded;

            if (isTutorialExpanded) {
                tutorialContent.classList.remove('collapsed');
                toggleIcon.classList.remove('collapsed');
                toggleIcon.textContent = '▼';
            } else {
                tutorialContent.classList.add('collapsed');
                toggleIcon.classList.add('collapsed');
                toggleIcon.textContent = '▶';
            }
        });
    }
}