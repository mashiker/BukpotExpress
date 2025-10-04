document.addEventListener('DOMContentLoaded', function() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    const applyDownloadBtn = document.getElementById('applyDownloadBtn');
    const statusArea = document.getElementById('statusArea');

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

    // Initialize button state
    updateButtonState();
});