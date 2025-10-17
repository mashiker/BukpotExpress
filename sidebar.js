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

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    setupThemeToggle();
    initializeTheme();

    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    const applyDownloadBtn = document.getElementById('applyDownloadBtn');
    const stopDownloadBtn = document.getElementById('stopDownloadBtn');
    const statusArea = document.getElementById('statusArea');
    const tutorialBtn = document.getElementById('tutorialBtn');

    // Promotional cards click handlers
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

    // Tutorial toggle functionality
    const tutorialToggle = document.getElementById('tutorialToggle');
    const tutorialContent = document.getElementById('tutorialContent');
    const toggleIcon = document.getElementById('toggleIcon');
    let isTutorialExpanded = false; // Start collapsed

    // Tips toggle functionality
    const tipsToggle = document.getElementById('tipsToggle');
    const tipsContent = document.getElementById('tipsContent');
    const tipsToggleIcon = document.getElementById('tipsToggleIcon');
    let isTipsExpanded = false; // Start collapsed

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

    // Stop button click handler
    stopDownloadBtn.addEventListener('click', async function() {
        try {
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab) {
                throw new Error('Tidak dapat menemukan tab aktif.');
            }

            // Send stop message to background script
            chrome.runtime.sendMessage({
                type: 'STOP_DOWNLOAD',
                tabId: tab.id
            }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('Error sending stop message:', chrome.runtime.lastError);
                } else {
                    console.log('Stop message sent successfully');
                }
            });

        } catch (error) {
            console.error('Error in stopDownloadBtn click handler:', error);
        }
    });

    // Populate year dropdown (current year and 4 previous years)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 4; i--) {
        const option = document.createElement('option');
        option.value = i.toString();
        option.textContent = i.toString();
        yearSelect.appendChild(option);
    }

    // Check if both month and year are selected to enable the button
    function updateButtonState() {
        const monthSelected = monthSelect.value !== '';
        const yearSelected = yearSelect.value !== '';
        applyDownloadBtn.disabled = !(monthSelected && yearSelected);

        if (monthSelected && yearSelected) {
            statusArea.textContent = 'Siap untuk memulai unduh otomatis.';
            statusArea.style.color = '#27ae60';
        } else {
            statusArea.textContent = 'Silakan pilih bulan dan tahun terlebih dahulu.';
            statusArea.style.color = '#7f8c8d';
        }
    }

    // Event listeners for dropdown changes
    monthSelect.addEventListener('change', updateButtonState);
    yearSelect.addEventListener('change', updateButtonState);

    // Apply and download button click handler
    applyDownloadBtn.addEventListener('click', async function() {
        const selectedMonth = monthSelect.value;
        const selectedYear = yearSelect.value;

        if (!selectedMonth || !selectedYear) {
            statusArea.textContent = 'Mohon pilih bulan dan tahun.';
            statusArea.style.color = '#e74c3c';
            return;
        }

        // Disable controls during processing
        applyDownloadBtn.disabled = true;
        monthSelect.disabled = true;
        yearSelect.disabled = true;

        // Show stop button
        applyDownloadBtn.style.display = 'none';
        stopDownloadBtn.style.display = 'flex';

        statusArea.textContent = 'Menerapkan filter masa pajak...';
        statusArea.style.color = '#3498db';

        try {
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab) {
                throw new Error('Tidak dapat menemukan tab aktif.');
            }

            // Send message to background script to start the filter and download process
            chrome.runtime.sendMessage({
                type: 'APPLY_FILTER_AND_DOWNLOAD',
                tabId: tab.id,
                month: selectedMonth,
                year: selectedYear,
                downloadMode: 'all'
            }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message:', chrome.runtime.lastError);
                    statusArea.textContent = 'Error: ' + chrome.runtime.lastError.message;
                    statusArea.style.color = '#e74c3c';

                    // Re-enable controls on error
                    applyDownloadBtn.disabled = false;
                    monthSelect.disabled = false;
                    yearSelect.disabled = false;

                    // Hide stop button and show download button
                    applyDownloadBtn.style.display = 'flex';
                    stopDownloadBtn.style.display = 'none';
                }
            });

            // Listen for status updates from background script
            chrome.runtime.onMessage.addListener(function(message) {
                if (message.type === 'UPDATE_STATUS') {
                    statusArea.textContent = message.status;

                    if (message.status.includes('selesai') || message.status.includes('berhasil')) {
                        statusArea.style.color = '#27ae60';
                    } else if (message.status.includes('error') || message.status.includes('gagal')) {
                        statusArea.style.color = '#e74c3c';
                    } else {
                        statusArea.style.color = '#3498db';
                    }

                    // Check if this is a navigation/processing update (not completion)
                    const isNavigationUpdate = message.status && (
                        message.status.includes('Memproses halaman') ||
                        message.status.includes('Bergerak ke halaman') ||
                        message.status.includes('halaman') ||
                        !message.status.includes('selesai') && !message.status.includes('berhasil')
                    );

                    // Re-enable controls when process is complete
                    if (message.complete) {
                        applyDownloadBtn.disabled = false;
                        monthSelect.disabled = false;
                        yearSelect.disabled = false;

                        // Hide stop button and show download button
                        applyDownloadBtn.style.display = 'flex';
                        stopDownloadBtn.style.display = 'none';
                    }
                    // Maintain download state during navigation/processing
                    else if (isNavigationUpdate) {
                        // Ensure controls remain disabled and stop button visible during navigation
                        applyDownloadBtn.disabled = true;
                        monthSelect.disabled = true;
                        yearSelect.disabled = true;
                        applyDownloadBtn.style.display = 'none';
                        stopDownloadBtn.style.display = 'flex';

                        console.log('UI: Maintaining stop button during navigation:', message.status);
                    }
                    // Fallback: Ensure stop button remains visible during any ongoing process
                    else if (!message.complete && (applyDownloadBtn.style.display === 'flex' || !applyDownloadBtn.disabled)) {
                        // Process is ongoing but download button is visible - hide it and show stop button
                        applyDownloadBtn.style.display = 'none';
                        stopDownloadBtn.style.display = 'flex';
                        applyDownloadBtn.disabled = true;
                        monthSelect.disabled = true;
                        yearSelect.disabled = true;
                    }
                }
            });

        } catch (error) {
            console.error('Error in applyDownloadBtn click handler:', error);
            statusArea.textContent = 'Error: ' + error.message;
            statusArea.style.color = '#e74c3c';

            // Re-enable controls on error
            applyDownloadBtn.disabled = false;
            monthSelect.disabled = false;
            yearSelect.disabled = false;

            // Hide stop button and show download button
            applyDownloadBtn.style.display = 'flex';
            stopDownloadBtn.style.display = 'none';
        }
    });

    // Tutorial button click handler
    tutorialBtn.addEventListener('click', function() {
        showTutorialModal();
    });

    // Initialize button state
    updateButtonState();
});

function showTutorialModal() {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background-color: white;
        padding: 30px;
        border-radius: 12px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        font-family: 'Poppins', sans-serif;
        position: relative;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    `;

    modalContent.innerHTML = `
        <h2 style="color: #F25F5C; margin-top: 0; text-align: center; font-size: 24px; margin-bottom: 20px;">
            📖 Cara Penggunaan Bukpot Express
        </h2>

        <div style="text-align: left; line-height: 1.6; color: #2c3e50;">
            <h3 style="color: #F25F5C; font-size: 18px; margin-top: 20px; margin-bottom: 10px;">🎯 Langkah 1: Persiapan</h3>
            <p style="margin: 0 0 15px 0; font-size: 14px;">
                Pastikan Anda sudah login ke <strong>Coretax DJP</strong> dan buka halaman <strong>"Bukti Potong" (BPPU atau BP series)</strong>, pada bagian <strong>NITKU/Identity Number: Please Select ID Place of Business Activity Sub Unit Organization</strong>
            </p>

            <h3 style="color: #F25F5C; font-size: 18px; margin-top: 20px; margin-bottom: 10px;">📅 Langkah 2: Pilih Masa Pajak</h3>
            <p style="margin: 0 0 15px 0; font-size: 14px;">
                Pilih <strong>bulan</strong> dan <strong>tahun</strong> masa pajak yang ingin diunduh bukti potongnya.
            </p>

            <h3 style="color: #F25F5C; font-size: 18px; margin-top: 20px; margin-bottom: 10px;">⬇️ Langkah 3: Mulai Download</h3>
            <p style="margin: 0 0 15px 0; font-size: 14px;">
                Klik tombol <strong>"Unduh Semua Bukti Potong"</strong>. Ekstensi akan:
            </p>
            <ul style="margin: 0 0 15px 20px; font-size: 14px; padding-left: 20px;">
                <li>Mengubah filter masa pajak secara otomatis</li>
                <li>Menunggu halaman dimuat</li>
                <li>Mengunduh semua bukti potong yang tersedia</li>
                <li>Jika ada banyak halaman, akan lanjut ke halaman berikutnya</li>
            </ul>

            <h3 style="color: #F25F5C; font-size: 18px; margin-top: 20px; margin-bottom: 10px;">⏱️ Langkah 4: Tunggu Proses Selesai</h3>
            <p style="margin: 0 0 15px 0; font-size: 14px;">
                Download akan berjalan otomatis dengan jeda 1-3 detik antar file untuk menghindari error. Tunggu hingga muncul notifikasi selesai.
            </p>

            <div style="background-color: #ffecee; padding: 15px; border-radius: 8px; border-left: 4px solid #F25F5C; margin: 20px 0;">
                <h4 style="color: #F25F5C; margin: 0 0 10px 0; font-size: 16px;">💡 Tips Penting:</h4>
                <ul style="margin: 0; font-size: 13px; padding-left: 20px;">
                    <li>Pastikan koneksi internet stabil</li>
                    <li>Jangan menutup browser selama proses berlangsung</li>
                    <li>File akan diunduh ke folder default download browser Anda</li>
                    <li>Setiap file diberi jeda untuk menghindari server overload</li>
                </ul>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">⚠️ Catatan:</h4>
                <ul style="margin: 0; font-size: 13px; padding-left: 20px;">
                    <li>Ekstensi hanya berfungsi di halaman resmi Coretax DJP</li>
                    <li> pastikan Anda memiliki izin untuk mengunduh dokumen</li>
                    <li>Jika terjadi error, refresh halaman dan coba kembali</li>
                </ul>
            </div>
        </div>

        <button id="closeTutorialBtn" style="
            background-color: #F25F5C;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            width: 100%;
            margin-top: 20px;
            transition: background-color 0.2s;
        ">
            Tutup Tutorial
        </button>
    `;

    // Add modal to page
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Close modal handlers
    function closeModal() {
        document.body.removeChild(modalOverlay);
    }

    document.getElementById('closeTutorialBtn').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Escape key to close
    const escKeyHandler = function(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escKeyHandler);
        }
    };
    document.addEventListener('keydown', escKeyHandler);
}
