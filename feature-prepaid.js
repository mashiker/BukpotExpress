// Bukpot Express - Download Prepaid Bukpot Feature Script
// Handles prepaid bukpot download functionality

// DOM Elements
let loadingOverlay, statusLog, clearLogBtn, downloadLogBtn;
let downloadPrepaidBtn, stopBtn, hardForceStopBtn;
let progressSection, progressBarFill, progressCounter, progressStatus;

const PREPAID_DOWNLOAD_LOG_KEY = 'prepaidDownloadLog';

document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    initializeTheme();
    setupThemeToggle();
    setupNavigation();
    setupEventListeners();
    setupCollapsibles();
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
    downloadLogBtn = document.getElementById('downloadLogBtn');
    downloadPrepaidBtn = document.getElementById('downloadPrepaidBtn');
    stopBtn = document.getElementById('stopBtn');
    hardForceStopBtn = document.getElementById('hardForceStopBtn');
    progressSection = document.getElementById('progressSection');
    progressBarFill = document.getElementById('progressBarFill');
    progressCounter = document.getElementById('progressCounter');
    progressStatus = document.getElementById('progressStatus');
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
// COLLAPSIBLE SECTIONS
// ============================================

function setupCollapsibles() {
    // Tutorial toggle
    setupCollapsible('tutorialToggle', 'tutorialContent', 'tutorialIcon');

    // Tips toggle
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

function escapeCsvValue(value) {
    const text = value === null || value === undefined ? '' : String(value);
    return `"${text.replace(/"/g, '""')}"`;
}

function formatDateForFilename(date = new Date()) {
    const pad = (value) => String(value).padStart(2, '0');
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate())
    ].join('') + '-' + [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join('');
}

function buildDownloadLogCsv(log) {
    const entries = Array.isArray(log?.entries) ? log.entries : [];
    const totalDetected = Number(log?.totalDetected ?? entries.length);
    const successCount = Number(log?.successCount ?? entries.filter(item => item.status === 'BERHASIL').length);
    const failedCount = Number(log?.failedCount ?? entries.filter(item => item.status === 'GAGAL').length);
    const summaryRows = [
        ['Ringkasan Download Prepaid Bukpot'],
        ['Mulai', log?.startedAt || ''],
        ['Selesai', log?.completedAt || ''],
        ['Total Bukpot', totalDetected],
        ['Berhasil', successCount],
        ['Gagal', failedCount],
        ['Total Halaman', log?.totalPages || ''],
        []
    ];

    const detailHeader = [
        'No',
        'Halaman',
        'Urutan di Halaman',
        'Nomor Dokumen',
        'Tanggal Dokumen',
        'Judul Dokumen',
        'Jenis Dokumen',
        'Nomor Kasus',
        'Tanggal Pembuatan',
        'Pengguna Pembuatan',
        'Status',
        'Percobaan',
        'Alasan',
        'Waktu Log'
    ];

    const detailRows = entries.map((entry, index) => [
        entry.no || index + 1,
        entry.page || '',
        entry.pageIndex || '',
        entry.documentNumber || '',
        entry.documentDate || '',
        entry.documentTitle || '',
        entry.documentType || '',
        entry.caseNumber || '',
        entry.createdAt || '',
        entry.createdBy || '',
        entry.status || '',
        entry.attempts || '',
        entry.reason || '',
        entry.loggedAt || ''
    ]);

    return [...summaryRows, detailHeader, ...detailRows]
        .map(row => row.map(escapeCsvValue).join(','))
        .join('\r\n');
}

function downloadTextFile(filename, content, mimeType = 'text/csv;charset=utf-8') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadPrepaidLog() {
    chrome.storage.local.get({ [PREPAID_DOWNLOAD_LOG_KEY]: null }, (result) => {
        const log = result[PREPAID_DOWNLOAD_LOG_KEY];
        const entries = Array.isArray(log?.entries) ? log.entries : [];

        if (!log || entries.length === 0) {
            updateAndSaveStatus('Belum ada log hasil download Prepaid Bukpot.');
            return;
        }

        const csv = buildDownloadLogCsv(log);
        const filename = `prepaid-bukpot-log-${formatDateForFilename()}.csv`;
        downloadTextFile(filename, `\uFEFF${csv}`);
        updateAndSaveStatus(`Log download dibuat: ${entries.length} bukpot, ${log.successCount || 0} berhasil, ${log.failedCount || 0} gagal.`);
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
// BUTTON STATE MANAGEMENT
// ============================================

function setDownloadButtonState(isDownloading) {
    if (downloadPrepaidBtn && stopBtn) {
        if (isDownloading) {
            downloadPrepaidBtn.classList.add('hidden');
            stopBtn.classList.remove('hidden');
        } else {
            downloadPrepaidBtn.classList.remove('hidden');
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
    // Download Prepaid Bukpot Button
    if (downloadPrepaidBtn) {
        downloadPrepaidBtn.addEventListener('click', () => {
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
                chrome.storage.local.set({ isDownloading: true, stopRequested: false, [PREPAID_DOWNLOAD_LOG_KEY]: null });
                updateAndSaveStatus('Memulai proses Download Prepaid Bukpot...');

                chrome.runtime.sendMessage({
                    type: 'START_BPPU_DOWNLOAD',
                    tabId: tabs[0].id
                });
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
            chrome.storage.local.set({ efakturLogs: [], [PREPAID_DOWNLOAD_LOG_KEY]: null }, () => {
                renderLogs([]);
                updateAndSaveStatus("Log telah dibersihkan");
            });
        });
    }

    // Download Log Button
    if (downloadLogBtn) {
        downloadLogBtn.addEventListener('click', downloadPrepaidLog);
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

    // Handle real-time navigation/status updates from multi_page_downloader.js
    if (message.type === 'MULTI_PAGE_NAVIGATION_UPDATE') {
        updateAndSaveStatus(message.status);
    }
});
