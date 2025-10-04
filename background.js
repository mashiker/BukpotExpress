// Bukpot Downloader With Filter Masa Pajak - Chrome Extension
// Version 2.0
// Automated tax document downloader with period filtering

let isDownloading = false;
let downloadTabId = null;

function executeScriptOnTab(tabId, fileToExecute) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: [fileToExecute]
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let tabId = request.tabId || (sender.tab ? sender.tab.id : null);
    if (!tabId) return;

    switch (request.type) {
        case "START_DOWNLOAD_PROCESS":
            if (!isDownloading) {
                isDownloading = true;
                downloadTabId = tabId;
                console.log("BG: Process started. Injecting setup scripts.");
                executeScriptOnTab(tabId, 'injector.js');
                executeScriptOnTab(tabId, 'collector.js');
            }
            break;

        case "DOWNLOAD_STARTED":
            console.log("BG: Collector finished. Starting first download task.");
            executeScriptOnTab(tabId, 'downloader.js');
            break;

        case "CONTINUE_DOWNLOAD":
            if (isDownloading && tabId === downloadTabId) {
                console.log(`BG: Continuing to next download in ${request.delay / 1000}s.`);
                setTimeout(() => executeScriptOnTab(tabId, 'downloader.js'), request.delay);
            }
            break;

        case "DOWNLOAD_COMPLETE":
            console.log("BG: All tasks complete. Resetting state.");
            isDownloading = false;
            downloadTabId = null;
            break;

        case "APPLY_FILTER_AND_DOWNLOAD":
            if (!isDownloading) {
                isDownloading = true;
                downloadTabId = tabId;
                console.log("BG: Starting filter and download process. Month:", request.month, "Year:", request.year);

                // Update status in sidebar
                sendStatusUpdate("Menerapkan filter masa pajak...");

                // Inject filter changer script
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['filter_changer.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("BG: Error injecting filter_changer.js:", chrome.runtime.lastError);
                        isDownloading = false;
                        downloadTabId = null;
                        sendStatusUpdate("Error: " + chrome.runtime.lastError.message, true);
                        return;
                    }

                    console.log("BG: Filter changer injected. Applying filter...");

                    // Send message to filter_changer to apply filter
                    chrome.tabs.sendMessage(tabId, {
                        action: 'applyTaxPeriodFilter',
                        bulan: request.month,
                        tahun: request.year
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error("BG: Error applying filter:", chrome.runtime.lastError);
                            isDownloading = false;
                            downloadTabId = null;
                            sendStatusUpdate("Error: " + chrome.runtime.lastError.message, true);
                            return;
                        }

                        if (response && response.success) {
                            console.log("BG: Filter applied successfully. Starting download process...");
                            sendStatusUpdate("Filter berhasil diterapkan. Memulai proses unduh otomatis...");

                            // Wait 2 seconds for data to load, then start download
                            setTimeout(() => {
                                console.log("BG: Starting automatic download process...");
                                sendStatusUpdate("Mengunduh semua dokumen...");
                                startAutomaticDownload(tabId);
                            }, 2000);
                        } else {
                            console.error("BG: Filter application failed:", response ? response.message : "Unknown error");
                            isDownloading = false;
                            downloadTabId = null;
                            sendStatusUpdate("Gagal menerapkan filter: " + (response ? response.message : "Unknown error"), true);
                        }
                    });
                });
            }
            break;
    }
    return true;
});

// Function to send status updates to sidebar
function sendStatusUpdate(status, complete = false) {
    chrome.runtime.sendMessage({
        type: 'UPDATE_STATUS',
        status: status,
        complete: complete
    }).catch(error => {
        // Ignore errors when sidebar is not open
        console.log("BG: Could not send status update (sidebar might be closed):", error.message);
    });
}

// Function to start automatic download
function startAutomaticDownload(tabId) {
    // Inject injector.js for modal setup
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['injector.js']
    }, () => {
        if (chrome.runtime.lastError) {
            console.error("BG: Error injecting injector.js:", chrome.runtime.lastError);
            isDownloading = false;
            downloadTabId = null;
            sendStatusUpdate("Error: " + chrome.runtime.lastError.message, true);
            return;
        }

        // Execute automatic download script
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: runAutomaticDownload
        }, (result) => {
            if (chrome.runtime.lastError) {
                console.error("BG: Error executing download:", chrome.runtime.lastError);
                isDownloading = false;
                downloadTabId = null;
                sendStatusUpdate("Error: " + chrome.runtime.lastError.message, true);
                return;
            }

            console.log("BG: Automatic download started");
            sendStatusUpdate("Proses unduh otomatis sedang berjalan...");

            // Complete after some time (since automatic download doesn't send messages back)
            setTimeout(() => {
                isDownloading = false;
                downloadTabId = null;
                sendStatusUpdate("Proses unduh selesai!", true);
            }, 10000); // Estimate 10 seconds for download to complete
        });
    });
}

// Function to execute in content script for automatic download
function runAutomaticDownload() {
    console.log('Content script: === STARTING AUTOMATIC DOWNLOAD ===');

    const buttons = document.querySelectorAll('#DownloadButton');
    let delay = 2000; // 2 seconds delay between downloads

    console.log(`Content script: Found ${buttons.length} download buttons`);
    console.log(`Content script: Starting download with ${delay}ms delay between clicks`);

    if (buttons.length === 0) {
        console.log('Content script: No download buttons found');
        return { success: false, message: 'No download buttons found' };
    }

    let completedDownloads = 0;

    buttons.forEach((button, index) => {
        setTimeout(() => {
            console.log(`Content script: Clicking button ${index + 1}/${buttons.length}`);
            button.click();
            console.log(`Content script: Download ${index + 1} initiated`);

            completedDownloads++;

            if (completedDownloads === buttons.length) {
                console.log('Content script: All downloads initiated');
                // Send completion message to background
                chrome.runtime.sendMessage({
                    type: 'AUTOMATIC_DOWNLOAD_COMPLETE',
                    totalDownloads: buttons.length
                });
            }
        }, delay * index);
    });

    return { success: true, message: `Started downloading ${buttons.length} files` };
}