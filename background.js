// Bukpot Downloader With Filter Masa Pajak - Chrome Extension
// Version 2.0
// Automated tax document downloader with period filtering

let isDownloading = false;
let downloadTabId = null;

// Input validation function
function validateFilterRequest(request) {
    // Check required fields
    if (!request || typeof request !== 'object') {
        return { valid: false, error: "Request format tidak valid" };
    }

    // Validate tabId
    if (!request.tabId || typeof request.tabId !== 'number') {
        return { valid: false, error: "Tab ID tidak valid" };
    }

    // Validate month if provided
    if (request.month) {
        const monthNum = parseInt(request.month);
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            return { valid: false, error: "Bulan tidak valid. Harus antara 1-12." };
        }
    }

    // Validate year if provided
    if (request.year) {
        const currentYear = new Date().getFullYear();
        const yearNum = parseInt(request.year);
        if (isNaN(yearNum) || yearNum < 2000 || yearNum > currentYear + 1) {
            return { valid: false, error: `Tahun tidak valid. Harus antara 2000-${currentYear + 1}.` };
        }
    }

    // Validate download mode
    const validModes = ['single', 'all'];
    if (request.downloadMode && !validModes.includes(request.downloadMode)) {
        return { valid: false, error: "Mode download tidak valid." };
    }

    return { valid: true };
}

// Function to validate tab state and permissions before injection
function validateTabState(tabId) {
    return new Promise((resolve) => {
        chrome.tabs.get(tabId, (tab) => {
            if (chrome.runtime.lastError) {
                console.error("BG: Tab validation failed:", chrome.runtime.lastError);
                resolve(false);
                return;
            }

            // Check if tab is still accessible and on the right domain
            const isValidTab = tab &&
                              tab.url &&
                              (tab.url.includes('coretax.pajak.go.id') ||
                               tab.url.includes('.coretax.pajak.go.id'));

            console.log(`BG: Tab validation - URL: ${tab.url ? tab.url.substring(0, 100) : 'N/A'}, Status: ${tab.status || 'N/A'}, Valid: ${isValidTab}`);
            resolve(isValidTab);
        });
    });
}

// Function to inject scripts with automatic retry and permission recovery
function injectScriptWithRetry(tabId, scriptFile, callback, retryCount = 0) {
    const maxRetries = 2; // Reduced to 2 for faster recovery
    const retryDelays = [1000, 2000]; // Progressive delays

    console.log(`BG: Starting injection of ${scriptFile} (attempt ${retryCount + 1}/${maxRetries + 1})`);

    // Validate tab state before injection
    validateTabState(tabId).then(isValid => {
        if (!isValid) {
            console.error(`BG: Tab ${tabId} is not valid for script injection`);
            callback(false);
            return;
        }

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: [scriptFile]
        }, () => {
        if (chrome.runtime.lastError) {
            console.error(`BG: Error injecting ${scriptFile} (attempt ${retryCount + 1}):`, chrome.runtime.lastError);

            const errorMessage = chrome.runtime.lastError.message;
            console.log(`BG: Error details: ${errorMessage}`);

            // Check if this is a permission error that might be recoverable
            if (errorMessage.includes("permission") || errorMessage.includes("Cannot access") || errorMessage.includes("The tab was closed") || errorMessage.includes("Receives end of file") || errorMessage.includes("Cannot access a chrome:// URL")) {

                if (retryCount < maxRetries) {
                    console.log(`BG: Retrying ${scriptFile} injection in ${retryDelays[retryCount]}ms...`);
                    sendStatusUpdate(`🔄 Memulihkan izin otomatis... (${retryCount + 1}/${maxRetries})`);

                    setTimeout(() => {
                        injectScriptWithRetry(tabId, scriptFile, callback, retryCount + 1);
                    }, retryDelays[retryCount]);
                    return;
                } else {
                    // All retries failed, try a simpler approach - just wait and retry once
                    console.log(`BG: All retries failed for ${scriptFile}, trying simpler recovery...`);
                    sendStatusUpdate("🔄 Mencoba pendekatan alternatif...");

                    // Simple wait and try one final time
                    setTimeout(() => {
                        console.log(`BG: Final attempt to inject ${scriptFile}`);
                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: [scriptFile]
                        }, () => {
                            if (chrome.runtime.lastError) {
                                console.error(`BG: Final injection attempt failed for ${scriptFile}:`, chrome.runtime.lastError);
                                sendStatusUpdate(`❌ Gagal menginjek ${scriptFile}. Error: ${chrome.runtime.lastError.message}`);
                                callback(false);
                            } else {
                                console.log(`BG: Final injection successful for ${scriptFile}`);
                                callback(true);
                            }
                        });
                    }, 2000); // Wait 2 seconds for final attempt
                    return;
                }
            } else {
                // Non-permission error, don't retry
                console.error(`BG: Non-retryable error for ${scriptFile}:`, errorMessage);
                sendStatusUpdate(`❌ Error ${scriptFile}: ${errorMessage}`);
                callback(false);
                return;
            }
        }

        // Success
        console.log(`BG: Successfully injected ${scriptFile}`);
        callback(true);
        });
    });
}

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
            console.log("BG: Collector finished. Starting downloader script injection.");
            injectDownloaderScript(tabId);
            break;

        // CONTINUE_DOWNLOAD no longer needed - downloader.js handles its own continuation

        case "DOWNLOAD_COMPLETE":
            console.log("BG: All tasks complete. Resetting state.");
            isDownloading = false;
            downloadTabId = null;
            break;

        case "APPLY_FILTER_AND_DOWNLOAD":
            if (!isDownloading) {
                // Validate request data
                const validation = validateFilterRequest(request);
                if (!validation.valid) {
                    console.error("BG: Invalid request data:", validation.error);
                    sendStatusUpdate(`❌ ${validation.error}`, true);
                    return;
                }

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

                // Inject filter changer script with automatic permission recovery
                injectScriptWithRetry(tabId, 'filter_changer.js', (success) => {
                    if (!success) {
                        console.error("BG: Failed to inject filter_changer.js after retries");

                        // Try one more direct injection attempt as last resort
                        console.log("BG: Attempting direct injection as last resort...");
                        sendStatusUpdate("🔄 Mencoba injeksi langsung...");

                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: ['filter_changer.js']
                        }, () => {
                            if (chrome.runtime.lastError) {
                                console.error("BG: Direct injection also failed:", chrome.runtime.lastError);
                                isDownloading = false;
                                downloadTabId = null;
                                sendStatusUpdate("❌ Gagal memulai download. Halaman mungkin perlu di-refresh.", true);
                                return;
                            } else {
                                console.log("BG: Direct injection successful!");
                                sendStatusUpdate("✅ Injeksi berhasil, melanjutkan...");
                                // Continue with filter application
                                applyFilterAfterInjection(tabId, request.month, request.year, downloadMode);
                            }
                        });
                        return;
                    }

                    // Continue with normal flow if injection succeeded
                    applyFilterAfterInjection(tabId, request.month, request.year, downloadMode);
                });
            }
            break;

        case "STOP_DOWNLOAD":
            console.log("BG: Stop download requested for tab:", tabId);
            if (isDownloading && downloadTabId === tabId) {
                console.log("BG: Stopping download process...");
                isDownloading = false;
                downloadTabId = null;

                // Send stop message to content scripts with error handling
                chrome.tabs.sendMessage(tabId, {
                    action: 'stopDownload'
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log("BG: Error sending stop message:", chrome.runtime.lastError.message);
                    } else {
                        console.log("BG: Stop message sent successfully");
                    }
                });

                // Also try to broadcast to all frames as backup
                chrome.webNavigation.getAllFrames({tabId: tabId}, (frames) => {
                    if (chrome.runtime.lastError) {
                        console.log("BG: Could not get frames:", chrome.runtime.lastError.message);
                        return;
                    }

                    frames.forEach(frame => {
                        chrome.tabs.sendMessage(tabId, {
                            action: 'stopDownload'
                        }, {frameId: frame.frameId}, (response) => {
                            if (chrome.runtime.lastError) {
                                console.log(`BG: Error sending stop to frame ${frame.frameId}:`, chrome.runtime.lastError.message);
                            }
                        });
                    });
                });

                sendStatusUpdate("⏹️ Download dihentikan oleh user", true);
            } else {
                console.log("BG: Not currently downloading or tab mismatch");
                sendStatusUpdate("⚠️ Tidak ada download yang sedang berjalan", true);
            }
            break;

        case "RELOAD_EXTENSION":
            console.log("BG: Extension reload requested");

            // Send response immediately and return true to keep channel open
            sendResponse({ success: true, message: "Extension reload initiated" });

            // Use longer timeout to ensure response is delivered before reload
            setTimeout(() => {
                console.log("BG: Performing extension reload...");
                chrome.runtime.reload();
            }, 300);
            return true; // Keep message channel open
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
    // Inject injector.js for modal setup with retry mechanism
    injectScriptWithRetry(tabId, 'injector.js', (injectorSuccess) => {
        if (!injectorSuccess) {
            console.error("BG: Failed to inject injector.js after retries");

            // Try direct injection as last resort
            console.log("BG: Attempting direct injector.js injection as last resort...");
            sendStatusUpdate("🔄 Mencoba injeksi injector langsung...");

            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['injector.js']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error("BG: Direct injector.js injection also failed:", chrome.runtime.lastError);
                    isDownloading = false;
                    downloadTabId = null;
                    sendStatusUpdate("❌ Gagal memulai download. Halaman mungkin perlu di-refresh.", true);
                    return;
                } else {
                    console.log("BG: Direct injector.js injection successful!");
                    sendStatusUpdate("✅ Injeksi injector berhasil, melanjutkan...");
                    // Continue with collector injection
                    injectCollectorScript(tabId);
                }
            });
            return;
        }

        console.log("BG: Injector.js injected successfully");
        // Continue with collector injection
        injectCollectorScript(tabId);
    });
}

// Helper function to inject collector script
function injectCollectorScript(tabId) {
    // Now inject collector.js to collect downloadable items with retry mechanism
    injectScriptWithRetry(tabId, 'collector.js', (collectorSuccess) => {
        if (!collectorSuccess) {
            console.error("BG: Failed to inject collector.js after retries");

            // Try direct injection as last resort
            console.log("BG: Attempting direct collector.js injection as last resort...");
            sendStatusUpdate("🔄 Mencoba injeksi collector langsung...");

            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['collector.js']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error("BG: Direct collector.js injection also failed:", chrome.runtime.lastError);
                    isDownloading = false;
                    downloadTabId = null;
                    sendStatusUpdate("❌ Gagal memulai pengumpulan dokumen. Halaman mungkin perlu di-refresh.", true);
                    return;
                } else {
                    console.log("BG: Direct collector.js injection successful!");
                    sendStatusUpdate("✅ Injeksi collector berhasil, mengumpulkan dokumen...");
                    // Wait a moment for collector to process, then inject downloader
                    setTimeout(() => {
                        injectDownloaderScript(tabId);
                    }, 1000);
                }
            });
            return;
        }

        console.log("BG: Collector.js injected successfully, waiting for DOWNLOAD_STARTED message");
        sendStatusUpdate("Mengumpulkan daftar dokumen...");

        // Inject downloader as backup in case collector doesn't send message
        setTimeout(() => {
            console.log("BG: Backup - injecting downloader script (collector might not have sent message)");
            injectDownloaderScript(tabId);
        }, 4000);

        // Final fallback - complete the process if still stuck
        setTimeout(() => {
            if (isDownloading && downloadTabId === tabId) {
                console.log("BG: Final fallback - completing single page download");
                isDownloading = false;
                downloadTabId = null;
                sendStatusUpdate("⚠️ Download selesai dengan metode alternatif", true);
            }
        }, 10000);
    });
}

// Helper function to inject downloader script
function injectDownloaderScript(tabId) {
    console.log("BG: Injecting downloader script...");
    sendStatusUpdate("Memulai proses download...");

    injectScriptWithRetry(tabId, 'downloader.js', (downloaderSuccess) => {
        if (!downloaderSuccess) {
            console.error("BG: Failed to inject downloader.js after retries");

            // Try direct injection as last resort
            console.log("BG: Attempting direct downloader.js injection as last resort...");
            sendStatusUpdate("🔄 Mencoba injeksi downloader langsung...");

            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['downloader.js']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error("BG: Direct downloader.js injection also failed:", chrome.runtime.lastError);
                    isDownloading = false;
                    downloadTabId = null;
                    sendStatusUpdate("❌ Gagal memulai downloader. Halaman mungkin perlu di-refresh.", true);
                } else {
                    console.log("BG: Direct downloader.js injection successful!");
                    sendStatusUpdate("✅ Downloader siap, memulai download otomatis...");
                }
            });
            return;
        }

        console.log("BG: Downloader.js injected successfully");
        sendStatusUpdate("✅ Downloader siap, memulai download otomatis...");
    });
}

// Function to start multi-page download
function startMultiPageDownload(tabId) {
    console.log("BG: Starting multi-page download process");

    // Inject injector.js for modal setup with retry mechanism
    injectScriptWithRetry(tabId, 'injector.js', (injectorSuccess) => {
        if (!injectorSuccess) {
            console.error("BG: Failed to inject injector.js for multi-page after retries");

            // Try direct injection as last resort
            console.log("BG: Attempting direct injector.js injection as last resort...");
            sendStatusUpdate("🔄 Mencoba injeksi injector langsung...");

            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['injector.js']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error("BG: Direct injector.js injection also failed:", chrome.runtime.lastError);
                    isDownloading = false;
                    downloadTabId = null;
                    sendStatusUpdate("❌ Gagal memulai multi-page download. Halaman mungkin perlu di-refresh.", true);
                    return;
                } else {
                    console.log("BG: Direct injector.js injection successful!");
                    sendStatusUpdate("✅ Injeksi injector berhasil, melanjutkan...");
                    // Continue with multi-page downloader injection
                    injectMultiPageDownloader(tabId);
                }
            });
            return;
        }

        console.log("BG: Injector.js loaded for multi-page download");
        // Continue with multi-page downloader injection
        injectMultiPageDownloader(tabId);
    });
}

// Helper function to inject multi-page downloader
function injectMultiPageDownloader(tabId) {
    // Inject multi-page downloader with retry mechanism
    injectScriptWithRetry(tabId, 'multi_page_downloader.js', (downloaderSuccess) => {
        if (!downloaderSuccess) {
            console.error("BG: Failed to inject multi_page_downloader.js after retries");

            // Try direct injection as last resort
            console.log("BG: Attempting direct multi_page_downloader.js injection as last resort...");
            sendStatusUpdate("🔄 Mencoba injeksi multi-page downloader langsung...");

            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['multi_page_downloader.js']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error("BG: Direct multi_page_downloader.js injection also failed:", chrome.runtime.lastError);
                    isDownloading = false;
                    downloadTabId = null;
                    sendStatusUpdate("❌ Gagal memulai multi-page downloader. Halaman mungkin perlu di-refresh.", true);
                    return;
                } else {
                    console.log("BG: Direct multi_page_downloader.js injection successful!");
                    sendStatusUpdate("✅ Injeksi multi-page downloader berhasil, memulai proses...");
                    // Start the process
                    startMultiPageProcess(tabId);
                }
            });
            return;
        }

        console.log("BG: Multi-page downloader injected successfully, starting process");
        // Start the process
        startMultiPageProcess(tabId);
    });
}

// Helper function to start the multi-page process after successful injection
function startMultiPageProcess(tabId) {
    console.log("BG: Starting multi-page process without response expectation");

    // Send message to start multi-page download (fire and forget)
    chrome.tabs.sendMessage(tabId, {
        action: 'startMultiPageDownload'
    }, (response) => {
        // Ignore any response or errors - the multi-page downloader will handle its own completion
        if (chrome.runtime.lastError) {
            console.log("BG: Expected message port closure for async multi-page download:", chrome.runtime.lastError.message);
        } else {
            console.log("BG: Multi-page download start acknowledged:", response);
        }
    });

    // Update status immediately
    console.log("BG: Multi-page download initiated successfully");
    sendStatusUpdate("Multi-page download in progress...");

    // Set up a safety timeout to reset state if completion message is never received
    setTimeout(() => {
        if (isDownloading && downloadTabId === tabId) {
            console.log("BG: Multi-page download safety timeout reached - resetting state");
            isDownloading = false;
            downloadTabId = null;
            sendStatusUpdate("⚠️ Multi-page download timeout - process may still be running", true);
        }
    }, 60000); // 60 second safety timeout
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

// Function to apply filter after successful script injection
function applyFilterAfterInjection(tabId, month, year, downloadMode) {
    console.log("BG: Filter changer injected. Applying filter...");

    // Send message to filter_changer to apply filter
    chrome.tabs.sendMessage(tabId, {
        action: 'applyTaxPeriodFilter',
        bulan: month,
        tahun: year
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("BG: Error applying filter:", chrome.runtime.lastError);
            isDownloading = false;
            downloadTabId = null;
            sendStatusUpdate("Gagal menerapkan filter: " + chrome.runtime.lastError.message, true);
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
}
