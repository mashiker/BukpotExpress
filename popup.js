// Bukpot Downloader With Filter Masa Pajak - Chrome Extension
// Version 2.0
// Automated tax document downloader with period filtering

// DOM Elements - akan diinisialisasi setelah DOM dimuat
let loadingOverlay, mainSection, bulanSelect, tahunSelect;
let filterBtn, statusLog, clearLogBtn, stopBtn, hardForceStopBtn;
let downloadModeRadios;

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
        console.log('Stop button clicked!');
        updateAndSaveStatus("⏹️ Tombol stop ditekan, menghentikan proses download...");
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                console.log('Sending STOP_DOWNLOAD message for tab:', tabs[0].id);
                chrome.runtime.sendMessage({
                    type: "STOP_DOWNLOAD",
                    tabId: tabs[0].id
                });
            } else {
                console.log('No active tabs found');
                updateAndSaveStatus("❌ Tidak ada tab aktif ditemukan");
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
            updateAndSaveStatus("🔄 Force closing browser in 3 seconds...");
            console.log('Force close confirmed - Closing browser...');

            // Show countdown
            let countdown = 3;
            const countdownInterval = setInterval(() => {
                updateAndSaveStatus(`Closing browser in ${countdown} seconds...`);
                countdown--;

                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    updateAndSaveStatus("✅ Browser closed successfully.");

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
        }
    }
});

// Initialize saat DOM dimuat
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    populateYearSelect();
    setupEventListeners();
    setupTutorialToggle();
    setupPromotionalCards();

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
    const coffeeCard = document.getElementById('coffee-card');

    // Add click event listeners for promotional cards
    if (efakturCard) {
        efakturCard.addEventListener('click', function() {
            chrome.tabs.create({ url: 'https://chromewebstore.google.com/detail/e-faktur-automation/hjimkdiphhenkofkbbicaejhflmoicpg' });
        });
    }

    if (coffeeCard) {
        coffeeCard.addEventListener('click', function() {
            chrome.tabs.create({ url: 'https://trakteer.id/alatpajakid/tip' });
        });
    }
}