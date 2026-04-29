// Bukpot Express - Download BPPU Feature Script
// Handles BPPU download with tax period filtering

// DOM Elements
let loadingOverlay, statusLog, clearLogBtn;
let bulanSelect, tahunSelect, filterBtn, stopBtn, hardForceStopBtn;
let modeRadioGroup, modeInfo, filterHelper;
let progressSection, progressBarFill, progressCounter, progressStatus;

document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    initializeTheme();
    setupThemeToggle();
    setupNavigation();
    setupEventListeners();
    setupCollapsibles();
    setupRadioGroup();
    populateYearSelect();
    updateModeUI();
    restoreState();
    loadExistingLogs();
});

// ============================================
// INITIALIZATION
// ============================================

function initializeElements() {
    loadingOverlay = document.getElementById('loading-overlay');
    statusLog = document.getElementById('statusLog');
    clearLogBtn = document.getElementById('clearLogBtn');
    bulanSelect = document.getElementById('bulanSelect');
    tahunSelect = document.getElementById('tahunSelect');
    filterBtn = document.getElementById('filterBtn');
    stopBtn = document.getElementById('stopBtn');
    hardForceStopBtn = document.getElementById('hardForceStopBtn');
    modeRadioGroup = document.getElementById('modeRadioGroup');
    modeInfo = document.getElementById('modeInfo');
    filterHelper = document.getElementById('filterHelper');
    progressSection = document.getElementById('progressSection');
    progressBarFill = document.getElementById('progressBarFill');
    progressCounter = document.getElementById('progressCounter');
    progressStatus = document.getElementById('progressStatus');
}

function populateYearSelect() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5;

    for (let year = currentYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year.toString();
        option.textContent = year.toString();
        tahunSelect.appendChild(option);
    }
}

// ============================================
// THEME MANAGEMENT
// ============================================

function initializeTheme() {
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
        if (themeIcon) themeIcon.innerHTML = '&#9728;'; // Sun
    } else {
        body.removeAttribute('data-theme');
        if (themeIcon) themeIcon.innerHTML = '&#127769;'; // Moon
    }

    chrome.storage.local.set({ theme: theme });
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// ============================================
// NAVIGATION
// ============================================

function setupNavigation() {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'popup.html';
        });
    }
}

// ============================================
// RADIO GROUP MANAGEMENT
// ============================================

function setupRadioGroup() {
    const radioOptions = document.querySelectorAll('.radio-option');

    radioOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected from all
            radioOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected to clicked
            option.classList.add('selected');
            // Check the radio input
            const radio = option.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            // Update UI
            updateModeUI();
        });
    });
}

function getSelectedDownloadMode() {
    const selectedOption = document.querySelector('.radio-option.selected');
    if (selectedOption) {
        return selectedOption.getAttribute('data-value');
    }
    return 'all'; // default
}

function updateModeUI() {
    const selectedMode = getSelectedDownloadMode();
    const isSingleMode = selectedMode === 'single';

    if (bulanSelect && tahunSelect) {
        bulanSelect.disabled = isSingleMode;
        tahunSelect.disabled = isSingleMode;
    }

    if (modeInfo) {
        if (isSingleMode) {
            modeInfo.textContent = 'Download Satu Halaman mengunduh halaman yang sedang tampil tanpa mengganti filter.';
        } else {
            modeInfo.textContent = 'Download Semua Halaman menerapkan filter masa pajak yang dipilih dan melanjutkan sampai halaman terakhir.';
        }
    }

    if (filterHelper) {
        if (isSingleMode) {
            filterHelper.textContent = 'Filter dinonaktifkan untuk mode ini. Sistem akan menggunakan filter yang sudah aktif di halaman Coretax.';
        } else {
            filterHelper.textContent = 'Pilih bulan dan tahun masa pajak sebelum memulai download.';
        }
    }
}

// ============================================
// COLLAPSIBLE SECTIONS
// ============================================

function setupCollapsibles() {
    setupCollapsible('tutorialToggle', 'tutorialContent', 'tutorialIcon');
    setupCollapsible('tipsToggle', 'tipsContent', 'tipsIcon');
}

function setupCollapsible(toggleId, contentId, iconId) {
    const toggle = document.getElementById(toggleId);
    const content = document.getElementById(contentId);
    const icon = document.getElementById(iconId);

    if (toggle && content && icon) {
        toggle.addEventListener('click', () => {
            const isCollapsed = content.classList.contains('collapsed');

            if (isCollapsed) {
                content.classList.remove('collapsed');
                icon.classList.remove('collapsed');
            } else {
                content.classList.add('collapsed');
                icon.classList.add('collapsed');
            }
        });
    }
}

// ============================================
// STATUS LOG
// ============================================

function renderLogs(logs = []) {
    if (statusLog) {
        if (logs.length === 0) {
            statusLog.innerHTML = 'Menunggu perintah...';
        } else {
            statusLog.innerHTML = logs.join('<br>');
        }
        statusLog.scrollTop = statusLog.scrollHeight;
    }
}

function updateAndSaveStatus(message) {
    const timestamp = new Date().toLocaleTimeString();
    const newLogEntry = `[${timestamp}] ${message}`;

    chrome.storage.local.get({ efakturLogs: [] }, (result) => {
        const logs = result.efakturLogs;
        logs.push(newLogEntry);
        if (logs.length > 1000) logs.splice(0, logs.length - 1000);
        chrome.storage.local.set({ efakturLogs: logs }, () => {
            renderLogs(logs);
        });
    });
}

function loadExistingLogs() {
    chrome.storage.local.get({ efakturLogs: [] }, (result) => {
        renderLogs(result.efakturLogs);
    });
}

// ============================================
// PROGRESS INDICATOR
// ============================================

function showProgress(current, total) {
    if (progressSection) {
        progressSection.classList.remove('hidden');
    }
    if (progressCounter) {
        progressCounter.textContent = `${current} / ${total}`;
    }
    if (progressBarFill) {
        const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;
        progressBarFill.style.width = `${percent}%`;
    }
    if (progressStatus) {
        progressStatus.textContent = total > 0 ? `Mengunduh... (${Math.round((current / total) * 100)}%)` : 'Mengunduh...';
    }
}

function hideProgress() {
    if (progressSection) {
        progressSection.classList.add('hidden');
    }
    if (progressBarFill) {
        progressBarFill.style.width = '0%';
    }
}

// ============================================
// VALIDATION
// ============================================

function validateMonthYear(month, year) {
    const monthNum = parseInt(month);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return { valid: false, error: "Bulan tidak valid. Pilih antara Januari-Desember." };
    }

    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > currentYear + 1) {
        return { valid: false, error: `Tahun tidak valid. Masukkan tahun antara 2000-${currentYear + 1}.` };
    }

    return { valid: true };
}

// ============================================
// BUTTON STATE MANAGEMENT
// ============================================

function setDownloadButtonState(isDownloading) {
    if (filterBtn && stopBtn) {
        if (isDownloading) {
            filterBtn.classList.add('hidden');
            stopBtn.classList.remove('hidden');
        } else {
            filterBtn.classList.remove('hidden');
            stopBtn.classList.add('hidden');
        }
    }
}

function restoreState() {
    chrome.storage.local.get(['isDownloading'], (result) => {
        if (result && result.isDownloading) {
            setDownloadButtonState(true);
        } else {
            setDownloadButtonState(false);
        }
    });
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Filter & Download Button
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            const downloadMode = getSelectedDownloadMode();
            const selectedMonth = bulanSelect.value;
            const selectedYear = tahunSelect.value;

            if (downloadMode === 'all') {
                if (!selectedMonth || !selectedYear) {
                    updateAndSaveStatus('Silakan pilih bulan dan tahun terlebih dahulu.');
                    return;
                }

                const validation = validateMonthYear(selectedMonth, selectedYear);
                if (!validation.valid) {
                    updateAndSaveStatus(`Terjadi kesalahan: ${validation.error}`);
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
    }

    // Stop Button
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            updateAndSaveStatus("Tombol STOP ditekan, menghentikan proses download...");
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length > 0) {
                    chrome.runtime.sendMessage({
                        type: "STOP_DOWNLOAD",
                        tabId: tabs[0].id
                    });
                    chrome.storage.local.set({ isDownloading: false });
                    setDownloadButtonState(false);
                } else {
                    updateAndSaveStatus("Tidak ada tab aktif ditemukan");
                }
            });
        });
    }

    // Emergency Stop Button - stops download without closing browser
    if (hardForceStopBtn) {
        hardForceStopBtn.addEventListener('click', () => {
            const confirmed = confirm(
                "Emergency Stop\n\n" +
                "Ini akan menghentikan semua proses download secara paksa.\n" +
                "Proses yang sedang berjalan akan dihentikan segera.\n\n" +
                "Lanjutkan?"
            );

            if (confirmed) {
                updateAndSaveStatus("Emergency stop: Menghentikan semua proses...");
                chrome.runtime.sendMessage({ type: "EMERGENCY_STOP" });
                chrome.storage.local.set({ isDownloading: false, stopRequested: true });
                setDownloadButtonState(false);
                hideProgress();
            } else {
                updateAndSaveStatus("Emergency stop dibatalkan.");
            }
        });
    }

    // Clear Log Button
    if (clearLogBtn) {
        clearLogBtn.addEventListener('click', () => {
            chrome.storage.local.set({ efakturLogs: [] }, () => {
                renderLogs([]);
                updateAndSaveStatus("Log telah dibersihkan");
            });
        });
    }
}

// ============================================
// MESSAGE LISTENER
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'UPDATE_STATUS') {
        updateAndSaveStatus(message.status);

        if (message.complete) {
            setDownloadButtonState(false);
            hideProgress();
            chrome.storage.local.set({ isDownloading: false });
        } else {
            setDownloadButtonState(true);
            chrome.storage.local.set({ isDownloading: true });
        }
    }

    if (message.type === 'DOWNLOAD_PROGRESS') {
        showProgress(message.current || 0, message.total || 0);
    }
});
