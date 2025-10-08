// Bukpot Downloader With Filter Masa Pajak - Chrome Extension
// Version 2.0
// Automated tax document downloader with period filtering

let isDownloading = false;
let downloadTabId = null;

// Open sidebar when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
    try {
        await chrome.sidePanel.open({ tabId: tab.id });
        console.log('Sidebar opened for tab:', tab.id);
    } catch (error) {
        console.error('Error opening sidebar:', error);
    }
});

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
                const downloadMode = request.downloadMode || 'single';
                console.log("BG: Starting filter and download process. Month:", request.month, "Year:", request.year, "Mode:", downloadMode);

                // Check if this is quick download (no filter)
                if (!request.month || !request.year) {
                    console.log("BG: Quick download mode (no filter), Mode:", downloadMode);
                    if (downloadMode === 'all') {
                        sendStatusUpdate("Memulai download multi-halaman tanpa filter...");
                        startMultiPageDownload(tabId);
                    } else {
                        sendStatusUpdate("Memulai download cepat...");
                        startAutomaticDownload(tabId);
                    }
                    return;
                }

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

                        let errorMessage = chrome.runtime.lastError.message;
                        if (errorMessage.includes("permission")) {
                            errorMessage = "❌ Permission Error!\n\n📋 Langkah perbaikan:\n1. Buka chrome://extensions/\n2. Cari 'Bukpot Downloader'\n3. Klik tombol 🔄 Reload\n4. Refresh halaman Coretax\n5. Coba kembali";
                        } else {
                            errorMessage = "Error: " + errorMessage;
                        }

                        sendStatusUpdate(errorMessage, true);
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
                            const modeText = downloadMode === 'all' ? 'multi-halaman' : 'satu halaman';
                            sendStatusUpdate(`Filter berhasil diterapkan. Memulai proses unduh ${modeText}...`);

                            // Wait 2 seconds for data to load, then start download
                            setTimeout(() => {
                                console.log("BG: Starting download process... Mode:", downloadMode);
                                if (downloadMode === 'all') {
                                    sendStatusUpdate("Memulai download multi-halaman...");
                                    startMultiPageDownload(tabId);
                                } else {
                                    sendStatusUpdate("Mengunduh semua dokumen...");
                                    startAutomaticDownload(tabId);
                                }
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

        case "STOP_DOWNLOAD":
            console.log("BG: Stop download requested for tab:", tabId);
            if (isDownloading && downloadTabId === tabId) {
                console.log("BG: Stopping download process...");
                isDownloading = false;
                downloadTabId = null;

                // Send stop message to content scripts
                chrome.tabs.sendMessage(tabId, {
                    action: 'stopDownload'
                });

                sendStatusUpdate("⏹️ Download dihentikan oleh user", true);
            }
            break;

        case "RELOAD_EXTENSION":
            console.log("BG: Extension reload requested");
            sendResponse({ success: true, message: "Extension reload initiated" });

            // Use Chrome's runtime API to reload the extension
            chrome.runtime.reload();
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

// Function to start automatic download (single page)
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

            let errorMessage = chrome.runtime.lastError.message;
            if (errorMessage.includes("permission")) {
                errorMessage = "❌ Permission denied! Please reload the extension and try again.";
            } else {
                errorMessage = "Error: " + errorMessage;
            }

            sendStatusUpdate(errorMessage, true);
            return;
        }

        // Now inject collector.js to collect downloadable items
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['collector.js']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error("BG: Error injecting collector.js:", chrome.runtime.lastError);
                isDownloading = false;
                downloadTabId = null;

                let errorMessage = chrome.runtime.lastError.message;
                if (errorMessage.includes("permission")) {
                    errorMessage = "❌ Permission denied! Please reload the extension and try again.";
                } else {
                    errorMessage = "Error: " + errorMessage;
                }

                sendStatusUpdate(errorMessage, true);
                return;
            }

            console.log("BG: Collector injected, waiting for DOWNLOAD_STARTED message");
            sendStatusUpdate("Mengumpulkan daftar dokumen...");
        });
    });
}

// Function to start multi-page download
function startMultiPageDownload(tabId) {
    console.log("BG: Starting multi-page download process");

    // Inject injector.js for modal setup
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['injector.js']
    }, () => {
        if (chrome.runtime.lastError) {
            console.error("BG: Error injecting injector.js for multi-page:", chrome.runtime.lastError);
            isDownloading = false;
            downloadTabId = null;

            let errorMessage = chrome.runtime.lastError.message;
            if (errorMessage.includes("permission")) {
                errorMessage = "❌ Permission denied! Please reload the extension and try again.";
            } else {
                errorMessage = "Error: " + errorMessage;
            }

            sendStatusUpdate(errorMessage, true);
            return;
        }

        console.log("BG: Injector loaded for multi-page download");

        // Inject multi-page downloader
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['multi_page_downloader.js']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error("BG: Error injecting multi_page_downloader.js:", chrome.runtime.lastError);
                isDownloading = false;
                downloadTabId = null;

                let errorMessage = chrome.runtime.lastError.message;
                if (errorMessage.includes("permission")) {
                    errorMessage = "❌ Permission denied! Please reload the extension and try again.";
                } else {
                    errorMessage = "Error: " + errorMessage;
                }

                sendStatusUpdate(errorMessage, true);
                return;
            }

            console.log("BG: Multi-page downloader injected, starting process");

            // Send message to start multi-page download (expecting immediate response)
            chrome.tabs.sendMessage(tabId, {
                action: 'startMultiPageDownload'
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("BG: Error starting multi-page download:", chrome.runtime.lastError);
                    isDownloading = false;
                    downloadTabId = null;
                    sendStatusUpdate("Error starting multi-page download: " + chrome.runtime.lastError.message, true);
                    return;
                }

                if (response && response.success) {
                    console.log("BG: Multi-page download started successfully");
                    // Don't reset state here - wait for completion message
                    sendStatusUpdate("Multi-page download in progress...");
                } else {
                    console.error("BG: Failed to start multi-page download");
                    isDownloading = false;
                    downloadTabId = null;
                    sendStatusUpdate("Gagal memulai multi-page download", true);
                }
            });
        });
    });
}

// Listen for automatic download completion
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let tabId = message.tabId || (sender.tab ? sender.tab.id : null);
    if (!tabId) return;

    switch (message.type) {
        // ... existing cases ...

        case "AUTOMATIC_DOWNLOAD_COMPLETE":
            console.log("BG: Automatic download completed");
            isDownloading = false;
            downloadTabId = null;
            sendStatusUpdate(`Download selesai! Total: ${message.totalDownloads} file`, true);
            break;

        case "MULTI_PAGE_DOWNLOAD_COMPLETE":
            console.log("BG: Multi-page download completed");
            isDownloading = false;
            downloadTabId = null;
            sendStatusUpdate(`Download multi-halaman selesai! Total: ${message.totalFiles} file dari ${message.totalPages} halaman`, true);
            break;

        case "MULTI_PAGE_NAVIGATION_UPDATE":
            console.log("BG: Multi-page navigation update:", message.status);
            sendStatusUpdate(message.status, false);
            break;
    }
    return true;
});