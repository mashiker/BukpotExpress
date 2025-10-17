// Bukpot Downloader With Filter Masa Pajak - Chrome Extension
// Version 2.0
// Automated tax document downloader with period filtering

// DOM Elements - akan diinisialisasi setelah DOM dimuat
let loadingOverlay, mainSection, bulanSelect, tahunSelect;
let filterBtn, statusLog, clearLogBtn, stopBtn, hardForceStopBtn;
let downloadModeRadios, filterSection, modeInfo, filterHelper;

// Inisialisasi DOM elements
function initializeElements() {
    loadingOverlay = document.getElementById('loading-overlay');
    mainSection = document.getElementById('main-section');
    bulanSelect = document.getElementById('bulanSelect');
    tahunSelect = document.getElementById('tahunSelect');
    filterBtn = document.getElementById('filterBtn');
    stopBtn = document.getElementById('stopBtn');
    hardForceStopBtn = document.getElementById('hardForceStopBtn');
    statusLog = document.getElementById('statusLog');
    clearLogBtn = document.getElementById('clearLogBtn');
    downloadModeRadios = document.querySelectorAll('input[name="downloadMode"]');
    filterSection = document.querySelector('.filter-section');
    modeInfo = document.getElementById('modeInfo');
    filterHelper = document.getElementById('filterHelper');
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

// Input validation functions
function validateMonthYear(month, year) {
    // Validate month (01-12)
    const monthNum = parseInt(month);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return { valid: false, error: "Bulan tidak valid. Pilih antara Januari-Desember." };
    }

    // Validate year (reasonable range)
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > currentYear + 1) {
        return { valid: false, error: `Tahun tidak valid. Masukkan tahun antara 2000-${currentYear + 1}.` };
    }

    return { valid: true };
}

function validateDownloadMode(mode) {
    const validModes = ['single', 'all'];
    if (!validModes.includes(mode)) {
        return { valid: false, error: "Mode download tidak valid." };
    }
    return { valid: true };
}

function updateModeUI() {
    if (!bulanSelect || !tahunSelect) {
        return;
    }

    const selectedMode = getSelectedDownloadMode();
    const isSingleMode = selectedMode === 'single';

    bulanSelect.disabled = isSingleMode;
    tahunSelect.disabled = isSingleMode;

    if (isSingleMode) {
        bulanSelect.setAttribute('aria-disabled', 'true');
        tahunSelect.setAttribute('aria-disabled', 'true');
        if (filterSection) {
            filterSection.classList.add('disabled');
        }
        if (modeInfo) {
            modeInfo.textContent = 'Download Satu Halaman mengunduh halaman yang sedang tampil tanpa mengganti filter.';
        }
        if (filterHelper) {
            filterHelper.textContent = 'Filter dinonaktifkan untuk mode ini. Sistem akan menggunakan filter yang sudah aktif di halaman Coretax.';
        }
    } else {
        bulanSelect.removeAttribute('aria-disabled');
        tahunSelect.removeAttribute('aria-disabled');
        if (filterSection) {
            filterSection.classList.remove('disabled');
        }
        if (modeInfo) {
            modeInfo.textContent = 'Download Semua Halaman menerapkan filter masa pajak yang dipilih dan melanjutkan sampai halaman terakhir.';
        }
        if (filterHelper) {
            filterHelper.textContent = 'Pilih bulan dan tahun masa pajak sebelum memulai download.';
        }
    }
}

// Event listeners
function setupEventListeners() {
    // Filter button - filter by tax period then download
    filterBtn.addEventListener('click', () => {
        const downloadMode = getSelectedDownloadMode();
        const modeValidation = validateDownloadMode(downloadMode);
        if (!modeValidation.valid) {
            updateAndSaveStatus(`Mode download tidak valid: ${modeValidation.error}`);
            return;
        }

        const selectedMonth = bulanSelect.value;
        const selectedYear = tahunSelect.value;

        if (downloadMode === 'all') {
            if (!selectedMonth || !selectedYear) {
                updateAndSaveStatus('Silakan pilih bulan dan tahun terlebih dahulu.');
                return;
            }

            const monthValidation = validateMonthYear(selectedMonth, selectedYear);
            if (!monthValidation.valid) {
                updateAndSaveStatus(`Terjadi kesalahan: ${monthValidation.error}`);
                return;
            }
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                updateAndSaveStatus('Tidak ada tab aktif ditemukan.');
                return;
            }

            const tabUrl = tabs[0].url;
            const isValidDomain = tabUrl && (
                tabUrl.includes('coretax.pajak.go.id') ||
                tabUrl.includes('.coretax.pajak.go.id') ||
                tabUrl.includes('coretaxdjp.pajak.go.id') ||
                tabUrl.includes('.coretaxdjp.pajak.go.id')
            );

            if (!isValidDomain) {
                updateAndSaveStatus('Pastikan Anda berada di halaman CoreTax DJP yang valid.');
                return;
            }

            showLoading();
            setDownloadButtonState(true);
            chrome.storage.local.set({ isDownloading: true, stopRequested: false });

            const payload = {
                type: 'APPLY_FILTER_AND_DOWNLOAD',
                tabId: tabs[0].id,
                downloadMode: downloadMode
            };

            if (downloadMode === 'all') {
                const monthOption = bulanSelect.options[bulanSelect.selectedIndex];
                const monthName = monthOption ? monthOption.text : selectedMonth;
                updateAndSaveStatus(`Menerapkan filter: ${monthName} ${selectedYear} (mode: semua halaman).`);
                payload.month = selectedMonth.trim();
                payload.year = selectedYear.trim();
            } else {
                updateAndSaveStatus('Mengunduh halaman aktif tanpa mengubah filter masa pajak.');
            }

            chrome.runtime.sendMessage(payload);
        });
    });

    downloadModeRadios.forEach((radio) => {
        radio.addEventListener('change', () => {
            updateModeUI();
        });
    });

    // Stop button - stop download
    stopBtn.addEventListener('click', () => {
        console.log('Stop button clicked!');
        updateAndSaveStatus("Tombol STOP ditekan, menghentikan proses download...");
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                console.log('Sending STOP_DOWNLOAD message for tab:', tabs[0].id);
                chrome.runtime.sendMessage({
                    type: "STOP_DOWNLOAD",
                    tabId: tabs[0].id
                });
                chrome.storage.local.set({ isDownloading: false });
                setDownloadButtonState(false);
            } else {
                console.log('No active tabs found');
                updateAndSaveStatus("Tidak ada tab aktif ditemukan");
            }
        });
    });

    // Force Close Browser button - alternative stop method
    hardForceStopBtn.addEventListener('click', () => {
        console.log('Force Close Browser button clicked!');

        // Show confirmation dialog
        const confirmed = confirm(
            "Force Close Browser\n\n" +
            "This will close the entire Chrome browser window.\n" +
            "All downloads will stop immediately.\n\n" +
            "You can reopen the browser and continue later.\n\n" +
            "Continue with force close?"
        );

        if (confirmed) {
            updateAndSaveStatus("Menutup browser secara paksa dalam 3 detik...");
            console.log('Force close confirmed - Closing browser...');

            // Show countdown
            let countdown = 3;
            const countdownInterval = setInterval(() => {
                updateAndSaveStatus(`Closing browser in ${countdown} seconds...`);
                countdown--;

                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    updateAndSaveStatus("Browser berhasil ditutup.");

                    // Close the browser window
                    setTimeout(() => {
                        window.close();
                    }, 500);
                }
            }, 1000);

            // Try to close all browser windows using Chrome API
            chrome.windows.getAll({}, (windows) => {
                windows.forEach(window => {
                    chrome.windows.remove(window.id);
                });
            });
        } else {
            updateAndSaveStatus("Force close cancelled.");
            console.log('Force close cancelled by user');
        }
    });

    // Hard refresh button has been removed and replaced with Tips section

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
            chrome.storage.local.set({ isDownloading: false });
        } else {
            setDownloadButtonState(true);
            chrome.storage.local.set({ isDownloading: true });
        }
    }
});

// Theme Management Functions
function initializeTheme() {
    // Load saved theme preference
    chrome.storage.local.get(['theme'], (result) => {
        const theme = result.theme || 'light';
        applyTheme(theme);
    });
}

function applyTheme(theme) {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');

    if (theme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.textContent = '☀️';
    } else {
        body.removeAttribute('data-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
    }

    // Save theme preference
    chrome.storage.local.set({ theme: theme });
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

// Theme toggle event listener setup
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Initialize saat DOM dimuat
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    populateYearSelect();
    setupEventListeners();
    setupTutorialToggle();
    setupPromotionalCards();
    setupThemeToggle();
    initializeTheme();
    updateModeUI();

    // Restore downloading state if any (keep stop visible on reopen)
    chrome.storage.local.get(['isDownloading'], (result) => {
        if (result && result.isDownloading) {
            setDownloadButtonState(true);
        } else {
            setDownloadButtonState(false);
        }
    });

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
    let isTutorialExpanded = false; // Start collapsed

    if (tutorialToggle && tutorialContent && toggleIcon) {
        // Set initial state to collapsed
        tutorialContent.classList.add('collapsed');
        toggleIcon.classList.add('collapsed');
        toggleIcon.textContent = '▶';

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

    // Tips toggle functionality
    const tipsToggle = document.getElementById('tipsToggle');
    const tipsContent = document.getElementById('tipsContent');
    const tipsToggleIcon = document.getElementById('tipsToggleIcon');
    let isTipsExpanded = false; // Start collapsed

    if (tipsToggle && tipsContent && tipsToggleIcon) {
        // Set initial state to collapsed
        tipsContent.classList.add('collapsed');
        tipsToggleIcon.classList.add('collapsed');
        tipsToggleIcon.textContent = '▶';

        tipsToggle.addEventListener('click', function() {
            isTipsExpanded = !isTipsExpanded;

            if (isTipsExpanded) {
                tipsContent.classList.remove('collapsed');
                tipsToggleIcon.classList.remove('collapsed');
                tipsToggleIcon.textContent = '▼';
            } else {
                tipsContent.classList.add('collapsed');
                tipsToggleIcon.classList.add('collapsed');
                tipsToggleIcon.textContent = '▶';
            }
        });
    }
}

// Promotional cards setup functionality
function setupPromotionalCards() {
    const efakturCard = document.getElementById('efaktur-card');
    const perplexityCard = document.getElementById('perplexity-card');
    const coffeeCard = document.getElementById('coffee-card');

    // Add click event listeners for promotional cards
    if (efakturCard) {
        efakturCard.addEventListener('click', function() {
            chrome.tabs.create({ url: 'https://chromewebstore.google.com/detail/e-faktur-automation/hjimkdiphhenkofkbbicaejhflmoicpg' });
        });
    }

    if (perplexityCard) {
        perplexityCard.addEventListener('click', function() {
            chrome.tabs.create({ url: 'https://pplx.ai/archisight' });
        });
    }

    if (coffeeCard) {
        coffeeCard.addEventListener('click', function() {
            chrome.tabs.create({ url: 'https://trakteer.id/alatpajakid/tip' });
        });
    }
}

