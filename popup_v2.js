document.addEventListener('DOMContentLoaded', function() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    const applyDownloadBtn = document.getElementById('applyDownloadBtn');
    const statusArea = document.getElementById('statusArea');
    const tutorialBtn = document.getElementById('tutorialBtn');

    // Tutorial toggle functionality
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
                year: selectedYear
            }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message:', chrome.runtime.lastError);
                    statusArea.textContent = 'Error: ' + chrome.runtime.lastError.message;
                    statusArea.style.color = '#e74c3c';

                    // Re-enable controls on error
                    applyDownloadBtn.disabled = false;
                    monthSelect.disabled = false;
                    yearSelect.disabled = false;
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

                    // Re-enable controls when process is complete
                    if (message.complete) {
                        applyDownloadBtn.disabled = false;
                        monthSelect.disabled = false;
                        yearSelect.disabled = false;
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
        <h2 style="color: #005A9C; margin-top: 0; text-align: center; font-size: 24px; margin-bottom: 20px;">
            📖 Cara Penggunaan Bukpot Express
        </h2>

        <div style="text-align: left; line-height: 1.6; color: #2c3e50;">
            <h3 style="color: #005A9C; font-size: 18px; margin-top: 20px; margin-bottom: 10px;">🎯 Langkah 1: Persiapan</h3>
            <p style="margin: 0 0 15px 0; font-size: 14px;">
                Pastikan Anda sudah login ke <strong>Coretax DJP</strong> dan berada di halaman <strong>"Bukti Potong" → "Daftar Bukti Potong"</strong>
            </p>

            <h3 style="color: #005A9C; font-size: 18px; margin-top: 20px; margin-bottom: 10px;">📅 Langkah 2: Pilih Masa Pajak</h3>
            <p style="margin: 0 0 15px 0; font-size: 14px;">
                Pilih <strong>bulan</strong> dan <strong>tahun</strong> masa pajak yang ingin diunduh bukti potongnya.
            </p>

            <h3 style="color: #005A9C; font-size: 18px; margin-top: 20px; margin-bottom: 10px;">⬇️ Langkah 3: Mulai Download</h3>
            <p style="margin: 0 0 15px 0; font-size: 14px;">
                Klik tombol <strong>"Unduh Semua Bukti Potong"</strong>. Ekstensi akan:
            </p>
            <ul style="margin: 0 0 15px 20px; font-size: 14px; padding-left: 20px;">
                <li>Mengubah filter masa pajak secara otomatis</li>
                <li>Menunggu halaman dimuat</li>
                <li>Mengunduh semua bukti potong yang tersedia</li>
                <li>Jika ada banyak halaman, akan lanjut ke halaman berikutnya</li>
            </ul>

            <h3 style="color: #005A9C; font-size: 18px; margin-top: 20px; margin-bottom: 10px;">⏱️ Langkah 4: Tunggu Proses Selesai</h3>
            <p style="margin: 0 0 15px 0; font-size: 14px;">
                Download akan berjalan otomatis dengan jeda 1-3 detik antar file untuk menghindari error. Tunggu hingga muncul notifikasi selesai.
            </p>

            <div style="background-color: #f0f8ff; padding: 15px; border-radius: 8px; border-left: 4px solid #005A9C; margin: 20px 0;">
                <h4 style="color: #005A9C; margin: 0 0 10px 0; font-size: 16px;">💡 Tips Penting:</h4>
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
            background-color: #005A9C;
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