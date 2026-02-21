// Bukpot Express - Download Prepaid Bukpot Feature Script
// Handles prepaid bukpot download functionality

// DOM Elements
let loadingOverlay, statusLog, clearLogBtn;
let downloadPrepaidBtn, stopBtn, hardForceStopBtn;

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
    downloadPrepaidBtn = document.getElementById('downloadPrepaidBtn');
    stopBtn = document.getElementById('stopBtn');
    hardForceStopBtn = document.getElementById('hardForceStopBtn');
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
                chrome.storage.local.set({ isDownloading: true, stopRequested: false });
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

    // Force Close Browser Button
    if (hardForceStopBtn) {
        hardForceStopBtn.addEventListener('click', () => {
            const confirmed = confirm(
                "Force Close Browser\n\n" +
                "Ini akan menutup seluruh browser Chrome.\n" +
                "Semua download akan berhenti.\n\n" +
                "Lanjutkan?"
            );

            if (confirmed) {
                updateAndSaveStatus("Menutup browser secara paksa...");

                chrome.windows.getAll({}, (windows) => {
                    windows.forEach(window => {
                        chrome.windows.remove(window.id);
                    });
                });
            } else {
                updateAndSaveStatus("Force close dibatalkan.");
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
            chrome.storage.local.set({ isDownloading: false });
        } else {
            setDownloadButtonState(true);
            chrome.storage.local.set({ isDownloading: true });
        }
    }
});
