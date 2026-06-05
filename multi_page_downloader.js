// Bukpot Express - Multi Page Downloader
// Version 3.0 - Updated for Coretax DJP withholding-slips-portal
// Multi-page downloader with reliable page confirmation
// Supports both OLD (home-portal) and NEW (withholding-slips-portal) page structures

(function () {
    if (typeof window !== 'undefined' && window.__BPE_MULTI_PAGE_LOADED__) {
        console.log('Multi-page downloader: script already loaded, resetting state');
        if (typeof window.__BPE_MULTI_PAGE_RESET__ === 'function') {
            window.__BPE_MULTI_PAGE_RESET__();
        }
        return;
    }
    if (typeof window !== 'undefined') {
        window.__BPE_MULTI_PAGE_LOADED__ = true;
    }

    let totalPagesDownloaded = 0;
    let totalFilesDownloaded = 0;
    let currentPageInfo = { current: 1, total: 1 };
    let isDownloadStopped = false;
    let stopAfterCurrentPage = false; // Finish current page, then stop
    let maxPagesToDownload = 10; // Safety limit: max 10 pages
    let downloadedFileIds = new Set(); // Track downloaded files to avoid duplicates

    const displayModalSafe = (title, message, details = '', showButton = true) => {
        if (typeof displayModal === 'function') {
            displayModal(title, message, details, showButton);
        } else {
            console.log(`Multi-page downloader modal: ${title} - ${message} (${details})`);
        }
    };

    const closeModalSafe = () => {
        if (typeof closeModal === 'function') {
            closeModal();
        } else {
            const modal = document.querySelector('.ct-modal-overlay');
            if (modal) {
                modal.remove();
            }
        }
    };

    function resetModuleState() {
        totalPagesDownloaded = 1;
        totalFilesDownloaded = 0;
        currentPageInfo = { current: 1, total: 1 };
        isDownloadStopped = false;
        stopAfterCurrentPage = false;
        downloadedFileIds.clear();
    }

    /**
     * Wait for table data to appear after clicking Cari.
     * Polls every 300ms, max 3 seconds (10 attempts).
     * Returns true if data rows or download buttons found, false otherwise.
     */
    async function waitForTableAfterCari() {
        const maxAttempts = 10; // 10 x 300ms = 3 seconds
        const pollInterval = 300;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const tableRows = document.querySelectorAll('tbody tr');
            const downloadBtns = queryDownloadButtons();
            const visibleBtns = downloadBtns.filter(btn => {
                const style = window.getComputedStyle(btn);
                return style.display !== 'none' && style.visibility !== 'hidden' && btn.offsetParent !== null;
            });

            const hasData = tableRows.length > 0 || visibleBtns.length > 0;

            if (attempt % 3 === 0 || hasData) {
                console.log(`BPPU: waitForTableAfterCari attempt ${attempt}/${maxAttempts} - rows: ${tableRows.length}, buttons: ${visibleBtns.length}`);
            }

            if (hasData) {
                console.log(`BPPU: Data found after Cari - ${tableRows.length} rows, ${visibleBtns.length} download buttons`);
                return true;
            }

            await new Promise(r => setTimeout(r, pollInterval));
        }

        console.log('BPPU: waitForTableAfterCari timed out - no data found after 3 seconds');
        return false;
    }

    /**
     * Click the Cari button and wait for table to load.
     * Returns true if data appeared, false if still empty after wait.
     */
    async function clickCariAndWait() {
        const searchBtn = document.querySelector('#search, button[arialabel="Search"], button.btn-primary[type="submit"]');
        if (!searchBtn) {
            console.log('BPPU: Cari button not found - skipping Cari click');
            return true; // No Cari button, proceed anyway
        }

        console.log('BPPU: Clicking Cari button...');
        searchBtn.click();

        return await waitForTableAfterCari();
    }




    /**
     * Detect which portal version we're on.
     * NEW portal: URL contains 'withholding-slips-portal' or 'my-withholding-slips'
     * OLD portal: URL contains 'home-portal' or old-style table with ActionDownloadButton
     */
    function detectPortalVersion() {
        const url = window.location.href;
        if (url.includes('withholding-slips-portal') || url.includes('my-withholding-slips')) {
            return true; // NEW
        }
        if (document.querySelector('coretax-my-withholding-slips')) {
            return true; // NEW
        }
        // New portal uses #DownloadButton (no leading space), old uses #ActionDownloadButton
        if (document.querySelector('#DownloadButton.p-button-danger')) {
            return true; // NEW
        }
        if (document.querySelector('#ActionDownloadButton') || document.querySelector('.ct-ovw-btn-mini-save')) {
            return false; // OLD
        }
        return !!document.querySelector('#DownloadButton');
    }

    /**
     * Get all download buttons on the page using portal-aware selectors.
     * NEW portal: button#DownloadButton (exact ID, p-button-danger class, pi pi-file-pdf icon)
     * OLD portal: #ActionDownloadButton, .ct-ovw-btn-mini-save
     */
    function queryDownloadButtons() {
        const isNew = detectPortalVersion();
        let allButtons = [];
        if (isNew) {
            // NEW portal selectors - use exact ID match
            allButtons = Array.from(document.querySelectorAll('button#DownloadButton'));
        } else {
            // OLD portal selectors
            allButtons = Array.from(document.querySelectorAll('#DownloadButton, #ActionDownloadButton, button.ct-ovw-btn-mini-save, [id*="DownloadButton"], [id*="ActionDownloadButton"]'));
        }
        return allButtons;
    }

    async function startMultiPageDownload() {
        console.log('Multi-page downloader: === STARTING MULTI-PAGE DOWNLOAD ===');
        console.log(`Multi-page downloader: Portal: ${detectPortalVersion() ? 'NEW' : 'OLD'}`);

        // Clear any prior stop request persisted by background
        try { chrome.storage?.local?.set({ stopRequested: false }); } catch (e) { }

        // Make sure all internal flags are reset before starting
        stopAfterCurrentPage = false;
        isDownloadStopped = false;

        resetModuleState();

        // Send status update
        try {
            chrome.runtime.sendMessage({
                type: 'MULTI_PAGE_NAVIGATION_UPDATE',
                status: '\U0001f504 Memulai proses download...'
            });
        } catch (e) {}

        // NEW PORTAL GUARD: If on new portal and no table data visible, click Cari first
        const isNewPortalForGuard = detectPortalVersion();
        if (isNewPortalForGuard) {
            const hasData = document.querySelectorAll('tbody tr').length > 0 || queryDownloadButtons().length > 0;
            if (!hasData) {
                console.log('BPPU: startMultiPageDownload - no data visible, clicking Cari first...');
                await clickCariAndWait();
            }
        }

        try {
            // Start downloading from current page
            await downloadCurrentPage();

            // This will be reached when all pages are completed
            console.log('Multi-page downloader: All pages processed successfully');
            return {
                success: true,
                totalPages: totalPagesDownloaded,
                totalFiles: totalFilesDownloaded
            };
        } catch (error) {
            console.error('Multi-page downloader: Error in startMultiPageDownload:', error);
            throw error;
        }
    }

    async function startBPPUAutomation() {
        console.log('BPPU Automation: === STARTING ===');
        resetModuleState();

        try {
            const isNewPortal = detectPortalVersion();
            console.log(`BPPU Automation: Portal version: ${isNewPortal ? 'NEW (withholding-slips-portal)' : 'OLD (home-portal)'}`);

            if (isNewPortal) {
                // NEW PORTAL: withholding-slips-portal/id-ID/my-withholding-slips
                // CHECK FIRST: if data already loaded, skip Cari click entirely
                const existingRows = document.querySelectorAll('tbody tr').length;
                const existingBtns = queryDownloadButtons().filter(btn => {
                    const s = window.getComputedStyle(btn);
                    return s.display !== 'none' && s.visibility !== 'hidden' && btn.offsetParent !== null;
                }).length;

                if (existingRows > 0 || existingBtns > 0) {
                    console.log(`BPPU Automation: Data already present (${existingRows} rows, ${existingBtns} buttons) - skipping Cari`);
                    try {
                        chrome.runtime.sendMessage({
                            type: 'MULTI_PAGE_NAVIGATION_UPDATE',
                            status: `✅ Data sudah ada: ${existingRows} baris. Langsung mulai download...`
                        });
                    } catch (e) {}
                } else {
                    // No data visible - click Cari to load
                    console.log('BPPU Automation: No data visible - clicking Cari to load data...');

                    try {
                        chrome.runtime.sendMessage({
                            type: 'MULTI_PAGE_NAVIGATION_UPDATE',
                            status: '🔍 Mengklik tombol Cari...'
                        });
                    } catch (e) {}

                    // Click Cari and wait for data, with retry (max 2 attempts)
                    let dataLoaded = false;
                    for (let attempt = 1; attempt <= 2; attempt++) {
                        console.log(`BPPU Automation: Cari attempt ${attempt}/2`);
                        dataLoaded = await clickCariAndWait();
                        if (dataLoaded) break;

                        if (attempt < 2) {
                            console.log('BPPU Automation: No data found, retrying Cari click...');
                            try {
                                chrome.runtime.sendMessage({
                                    type: 'MULTI_PAGE_NAVIGATION_UPDATE',
                                    status: `⏳ Data belum muncul, mencoba lagi (attempt ${attempt}/2)...`
                                });
                            } catch (e) {}
                        }
                    }

                    if (!dataLoaded) {
                        console.log('BPPU Automation: No data found after Cari - proceeding anyway');
                        try {
                            chrome.runtime.sendMessage({
                                type: 'MULTI_PAGE_NAVIGATION_UPDATE',
                                status: '⚠️ Tidak ada data ditemukan setelah klik Cari. Pastikan filter sudah benar.'
                            });
                        } catch (e) {}
                    } else {
                        const rowCount = document.querySelectorAll('tbody tr').length;
                        try {
                            chrome.runtime.sendMessage({
                                type: 'MULTI_PAGE_NAVIGATION_UPDATE',
                                status: `✅ Data ditemukan: ${rowCount} baris. Mulai download...`
                            });
                        } catch (e) {}
                    }
                }
            } else {
                // OLD PORTAL: home-portal based flow - needs filter
                console.log('BPPU Automation (old): Applying Jenis Dokumen filter...');

                // 1. Refresh Grid
                const refreshBtn = document.querySelector('button[icon="pi pi-refresh"]');
                if (refreshBtn) {
                    refreshBtn.click();
                    await new Promise(r => setTimeout(r, 2000));
                }

                // 2. Filter "Jenis Dokumen" - 4th column filter (index 3)
                const filterInputs = document.querySelectorAll('th p-columnfilterformelement input');
                let targetInput = filterInputs.length > 3 ? filterInputs[3] : null;

                if (targetInput) {
                    targetInput.value = "Bukti Potong PPh Unifikasi (BPPU)";
                    targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                    targetInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
                    await waitForPageLoad();
                    await new Promise(r => setTimeout(r, 2000));
                } else {
                    console.warn('BPPU Automation (old): Could not find Jenis Dokumen filter, proceeding without filter');
                }
            }

            // Start Multi-page Download (works for both old and new portal)
            console.log('BPPU Automation: Starting download loop...');
            return await startMultiPageDownload();

        } catch (error) {
            console.error('BPPU Automation: Error:', error);
            throw error;
        }
    }

    async function downloadCurrentPage() {
        // Check if download was stopped before processing
        if (isDownloadStopped) {
            console.log('Multi-page downloader: Download stopped, cancelling current page processing');
            completeMultiPageDownload();
            return;
        }

        console.log(`\n📄 === PROCESSING PAGE ${totalPagesDownloaded} ===`);
        console.log(`📍 Current URL: ${window.location.href}`);

        try {
            // Show progress modal
            displayModalSafe('Multi-Page Download',
                `Downloading Page ${totalPagesDownloaded}`,
                `Total files so far: ${totalFilesDownloaded}`,
                false);

            // Send page processing update to maintain UI state
            chrome.runtime.sendMessage({
                type: 'MULTI_PAGE_NAVIGATION_UPDATE',
                status: `📥 Mengunduh halaman ${totalPagesDownloaded} dari beberapa halaman...`
            }).catch(error => {
                console.log('Multi-page downloader: Could not send page update:', error.message);
            });

            // Wait for page to load completely
            console.log('⏳ Waiting for page to load...');
            await waitForPageLoad();
            console.log('✅ Page loaded successfully');

            // Check if download was stopped after page load
            if (isDownloadStopped) {
                console.log('Multi-page downloader: Download stopped after page load');
                completeMultiPageDownload();
                return;
            }

            // Check for download buttons - DELEGATE TO downloadFilesOnCurrentPage for robust detection
            // const downloadButtons = document.querySelectorAll('#DownloadButton');
            // console.log(`🔢 Found ${downloadButtons.length} download buttons on page ${totalPagesDownloaded}`);

            // Download files on current page
            let downloadedCount = await downloadFilesOnCurrentPage();

            // RETRY: If 0 files downloaded, wait 2s and try once more (buttons may still be rendering)
            if (downloadedCount === 0) {
                console.log(`⚠️ No files downloaded from page ${totalPagesDownloaded}. Retrying in 2s...`);
                try {
                    chrome.runtime.sendMessage({
                        type: 'MULTI_PAGE_NAVIGATION_UPDATE',
                        status: `⏳ Halaman ${totalPagesDownloaded}: 0 file. Mencoba ulang...`
                    });
                } catch (e) {}
                await new Promise(r => setTimeout(r, 2000));
                downloadedCount = await downloadFilesOnCurrentPage();
            }

            totalFilesDownloaded += downloadedCount;

            console.log(`✅ Downloaded ${downloadedCount} files from page ${totalPagesDownloaded}`);

            // Send completion status for this page (but not overall completion)
            if (downloadedCount > 0) {
                chrome.runtime.sendMessage({
                    type: 'MULTI_PAGE_NAVIGATION_UPDATE',
                    status: `✅ Halaman ${totalPagesDownloaded} selesai (${downloadedCount} file). Memeriksa halaman berikutnya...`
                }).catch(error => {
                    console.log('Multi-page downloader: Could not send page completion update:', error.message);
                });
            } else {
                console.log(`⚠️ No files downloaded from page ${totalPagesDownloaded} after retry.`);
            }

            /* 
            if (downloadButtons.length === 0) {
                console.log('⚠️ No download buttons found on this page');
            } else {
                // Collect and download files on current page
                const downloadedCount = await downloadFilesOnCurrentPage();
                totalFilesDownloaded += downloadedCount;

                console.log(`✅ Downloaded ${downloadedCount} files from page ${totalPagesDownloaded}`);

                // Send completion status for this page (but not overall completion)
                if (downloadedCount > 0) {
                    chrome.runtime.sendMessage({
                        type: 'MULTI_PAGE_NAVIGATION_UPDATE',
                        status: `✅ Halaman ${totalPagesDownloaded} selesai (${downloadedCount} file). Memeriksa halaman berikutnya...`
                    }).catch(error => {
                        console.log('Multi-page downloader: Could not send page completion update:', error.message);
                    });
                }
            } 
            */

            // Check if stop is requested after finishing this page
            if (isDownloadStopped || stopAfterCurrentPage) {
                console.log('Multi-page downloader: Stop requested after current page, not navigating further');
                completeMultiPageDownload();
                return;
            }

            if (stopAfterCurrentPage) {
                console.log('Multi-page downloader: Boundary stop active, skipping next page navigation');
                completeMultiPageDownload();
                return;
            }
            const hasNextPage = await checkAndNavigateToNextSimple();
            if (hasNextPage && !isDownloadStopped && !stopAfterCurrentPage) {
                totalPagesDownloaded++;
                setTimeout(() => {
                    if (!isDownloadStopped && !stopAfterCurrentPage) {
                        downloadCurrentPage();
                    } else {
                        completeMultiPageDownload();
                    }
                }, 3000);
            } else {
                completeMultiPageDownload();
            }

        } catch (error) {
            console.error('Multi-page downloader: Error downloading current page:', error);
            displayModalSafe('Multi-Page Download Error',
                `Error on page ${totalPagesDownloaded}`,
                `Error: ${error.message}`,
                true);

            // Still try to continue or finish
            setTimeout(() => {
                completeMultiPageDownload();
            }, 3000);
        }
    }

    // SIMPLIFIED PAGE-BASED NAVIGATION SYSTEM
    async function checkAndNavigateToNextSimple() {
        console.log('\n🔍 === SIMPLIFIED PAGE-BASED NAVIGATION ===');

        // STEP 1: Get current page number before clicking
        console.log('📋 STEP 1: Detecting current page number...');
        const currentPageNumber = getCurrentPageNumber();
        if (stopAfterCurrentPage) {
            console.log('Multi-page downloader: Boundary stop active - not navigating to next page');
            return false;
        }

        console.log(`📍 Current page number detected: ${currentPageNumber}`);

        if (currentPageNumber === null) {
            console.log('❌ Could not detect current page number - stopping navigation');
            return false;
        }

        // STEP 2: Find and click next page button
        console.log('\n🎯 STEP 2: Finding next page button...');
        const nextButton = findNextPageButton();

        if (!nextButton) {
            console.log('❌ No next page button found - this appears to be the last page');
            return false;
        }

        console.log(`✅ Found next page button: ${nextButton.tagName} - "${nextButton.textContent}"`);

        // STEP 3: Click next button
        console.log('\n🚀 STEP 3: Clicking next page button...');
        const currentUrl = window.location.href;
        console.log(`📄 URL before click: ${currentUrl}`);

        nextButton.click();
        console.log('✅ Next button clicked successfully');

        // STEP 4: Wait for navigation and page change
        console.log('\n⏳ STEP 4: Waiting for page navigation...');

        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('🔍 Checking if page has changed...');

                const newPageNumber = getCurrentPageNumber();
                console.log(`📍 New page number detected: ${newPageNumber}`);

                // STEP 5: Confirm page has changed
                if (newPageNumber !== null && newPageNumber > currentPageNumber) {
                    console.log(`✅ SUCCESS: Page changed from ${currentPageNumber} to ${newPageNumber}`);
                    console.log('🔄 Ready to download from new page');
                    resolve(true);
                } else {
                    console.log(`❌ Page change failed or no change detected`);
                    console.log(`   Expected: page > ${currentPageNumber}, Got: ${newPageNumber}`);
                    console.log('This appears to be the last page');
                    resolve(false);
                }
            }, 3000); // Wait 3 seconds for navigation
        });
    }

    // Helper function to get current page number
    function getCurrentPageNumber() {
        console.log('🔍 Detecting page number from .p-paginator-pages...');

        // Look for the highlighted page button in paginator (your specific example)
        const highlightedPage = document.querySelector('.p-paginator-page.p-highlight');
        if (highlightedPage) {
            const pageNumber = parseInt(highlightedPage.textContent.trim());
            console.log(`📋 Found highlighted page button: ${pageNumber}`);
            console.log(`   Button HTML: ${highlightedPage.outerHTML.substring(0, 100)}...`);
            return pageNumber;
        }

        // Alternative: look for current page indicator
        const currentPageElement = document.querySelector('.p-paginator-current');
        if (currentPageElement) {
            const text = currentPageElement.textContent;
            const match = text.match(/(\d+)/);
            if (match) {
                const pageNumber = parseInt(match[1]);
                console.log(`📋 Found current page from indicator: ${pageNumber}`);
                return pageNumber;
            }
        }

        // Alternative: search for page numbers in paginator
        const pageButtons = document.querySelectorAll('.p-paginator-page');
        console.log(`🔍 Found ${pageButtons.length} page buttons`);

        for (let button of pageButtons) {
            if (button.classList.contains('p-highlight')) {
                const pageNumber = parseInt(button.textContent.trim());
                console.log(`📋 Found highlighted page button (alternative): ${pageNumber}`);
                return pageNumber;
            }
        }

        console.log('❌ Could not determine current page number');
        console.log('🔍 Debug: Available paginator elements:');
        const paginatorContainers = document.querySelectorAll('.p-paginator');
        paginatorContainers.forEach((container, index) => {
            console.log(`   Paginator ${index + 1}: ${container.innerHTML.substring(0, 200)}...`);
        });

        return null;
    }

    // Helper function to find next page button
    function findNextPageButton() {
        console.log('🔍 Searching for next page button...');

        // Try the standard next button selector first
        let nextButton = document.querySelector('.p-paginator-next:not(.p-disabled)');
        if (nextButton) {
            console.log('✅ Found standard next button: .p-paginator-next');
            return nextButton;
        }

        // Try without disabled filter first to see what's available
        nextButton = document.querySelector('.p-paginator-next');
        if (nextButton) {
            console.log('🔍 Found .p-paginator-next (checking if disabled)');
            if (nextButton.classList.contains('p-disabled')) {
                console.log('❌ Next button is disabled - this is the last page');
                return null;
            } else {
                console.log('✅ Found enabled next button: .p-paginator-next');
                return nextButton;
            }
        }

        // Try alternative selectors
        const selectors = [
            'button.p-paginator-next',
            '[aria-label="Next"]',
            '[aria-label="Next Page"]',
            '.pi-angle-right',
            '.pi-chevron-right'
        ];

        for (let selector of selectors) {
            nextButton = document.querySelector(selector);
            if (nextButton && !nextButton.classList.contains('p-disabled')) {
                console.log(`✅ Found next button with selector: ${selector}`);
                return nextButton;
            }
        }

        console.log('❌ No next page button found');
        return null;
    }

    // Function to stop the download process
    function stopDownload(boundary = true) {
        console.log('Multi-page downloader: === STOP DOWNLOAD REQUESTED ===');
        if (boundary) {
            stopAfterCurrentPage = true; // finish current page, then stop
            try {
                chrome.runtime.sendMessage({
                    type: 'MULTI_PAGE_NAVIGATION_UPDATE',
                    status: `Stop diminta - berhenti setelah halaman ${totalPagesDownloaded}`
                });
            } catch (e) { }
        } else {
            isDownloadStopped = true;
            completeMultiPageDownload();
        }
    }

    async function waitForPageLoad() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 60; // Increased to 60 (approx 6 seconds)
            let stableCount = 0;
            let lastButtonCount = 0;

            const checkPageReady = () => {
                attempts++;

                // Check if table is loaded and has data
                const table = document.querySelector('table');
                // Updated to be more inclusive
                // Use portal-aware button detection
                const allDownloadBtns = queryDownloadButtons();
                const downloadButtons = allDownloadBtns.filter(btn => {
                    const style = window.getComputedStyle(btn);
                    return style.display !== 'none' && style.visibility !== 'hidden' && btn.offsetParent !== null;
                });
                const tableRows = document.querySelectorAll('tbody tr');

                // More comprehensive page readiness check
                const hasTable = table && table.rows.length > 0;
                const hasButtons = downloadButtons.length > 0;
                const hasDataRows = tableRows.length > 0;

                // Check for loading indicators
                const loadingIndicators = document.querySelectorAll('.loading, .spinner, [class*="loading"], .p-datatable-loading-overlay, .p-datatable-loading-icon');
                const hasLoadingElements = loadingIndicators.length > 0;

                // Visualization of state
                if (attempts % 5 === 0) {
                    console.log(`Multi-page downloader: Waiting... Rows: ${tableRows.length}, Buttons: ${downloadButtons.length}, Loading: ${hasLoadingElements}`);
                }

                // HEURISTIC: We expect roughly 1 button per data row. 
                // If we have rows but 0 buttons, we definitely wait.
                // If we have significantly fewer buttons than rows, we validly wait a bit longer to see if more render.
                if (!hasLoadingElements && (hasButtons || (hasDataRows && attempts > 20))) {

                    // Stability check: Wait until button count stops increasing
                    if (downloadButtons.length === lastButtonCount) {
                        stableCount++;
                    } else {
                        stableCount = 0;
                        lastButtonCount = downloadButtons.length;
                    }

                    // If we have a stable count for a few checks, OR we hit the "standard" 10 items, proceed.
                    // Also proceed if we're hitting max attempts but have at least something.
                    if (stableCount >= 3 || downloadButtons.length >= tableRows.length || attempts >= maxAttempts) {
                        console.log(`Multi-page downloader: Page ready. Rows: ${tableRows.length}, Buttons: ${downloadButtons.length}`);
                        // Give one final small buffer for any attached event listeners
                        setTimeout(resolve, 500);
                        return;
                    }
                } else if (attempts >= maxAttempts) {
                    console.log(`Multi-page downloader: Timeout waiting for page. Proceeding with what we have. Rows: ${tableRows.length}, Buttons: ${downloadButtons.length}`);
                    resolve();
                    return;
                }

                setTimeout(checkPageReady, 100);
            };

            checkPageReady();
        });
    }

    async function downloadFilesOnCurrentPage() {
        return new Promise(async (resolve) => {
            console.log('=== COMPREHENSIVE DEBUG START ===');
            console.log(`Current URL: ${window.location.href}`);

            // Helper to get fresh list of buttons
            const getFreshButtons = () => {
                const allBtns = queryDownloadButtons();
                return allBtns.filter(btn => {
                    const style = window.getComputedStyle(btn);
                    const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && btn.offsetParent !== null;
                    const isDisabled = btn.disabled || btn.classList.contains('p-disabled') || btn.getAttribute('aria-disabled') === 'true';
                    return isVisible && !isDisabled;
                });
            };

            // Initial capture for counting and metadata
            const initialButtons = getFreshButtons();

            console.log(`Multi-page downloader: Found ${initialButtons.length} buttons initially.`);

            if (initialButtons.length === 0) {
                console.log('⚠️ No buttons found.');
                // Send debug log to popup
                try {
                    chrome.runtime.sendMessage({
                        type: 'MULTI_PAGE_NAVIGATION_UPDATE',
                        status: `⚠️ Deteksi 0 tombol.`
                    });
                } catch (e) { }
                resolve(0);
                return;
            }

            // Map metadata for logging
            const buttonsMetadata = initialButtons.map((button, index) => {
                const row = button.closest('tr');
                let firstCellText = '';

                if (row) {
                    const cells = row.querySelectorAll('td');
                    if (cells.length > 0) {
                        firstCellText = (cells[0].textContent || '').trim();
                    }
                }
                return { firstCellText };
            });

            // Send debug log to popup
            try {
                chrome.runtime.sendMessage({
                    type: 'MULTI_PAGE_NAVIGATION_UPDATE',
                    status: `🔍 Deteksi: ${initialButtons.length} tombol.`
                });
            } catch (e) { }

            let downloadCount = 0;
            const maxButtons = initialButtons.length;

            // Process sequentially with re-querying
            for (let i = 0; i < maxButtons; i++) {

                // Stop check
                if (isDownloadStopped) {
                    console.log('Download stopped by user request.');
                    break;
                }

                // RE-QUERY BUTTON to avoid stale reference
                const freshButtons = getFreshButtons();
                // We use the index strictly. If the list size changed, we might be off, 
                // but checking freshButtons[i] is safer than holding a stale reference.
                const button = freshButtons[i];

                if (!button) {
                    console.warn(`⚠️ Button at index ${i} not found matching original count. List changed? Skipped.`);
                    continue;
                }

                const meta = buttonsMetadata[i] || {};
                const itemLabel = meta.firstCellText ? `Nomor Dokumen ${meta.firstCellText}` : `File #${i + 1}`;

                try {
                    console.log(`🖱️ Clicking button ${i + 1}/${maxButtons}: ${itemLabel}`);

                    // 1. Scroll
                    button.scrollIntoView({ block: 'center', inline: 'center' });

                    // 2. Focus
                    button.focus();

                    // 3. Click (Angular-friendly)
                    // Try naive click first, then complex if needed. 
                    // Actually, for consistency, let's use the click() method first as it's most robust for native buttons.
                    button.click();

                    // If that doesn't work, one might need to dispatch events, but click() usually works if element is fresh.
                    // We'll dispatch a mouse event just in case it listens for mousedown/up
                    button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                    button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));

                    downloadCount++;

                    // Report success
                    try {
                        chrome.runtime.sendMessage({
                            type: 'MULTI_PAGE_NAVIGATION_UPDATE',
                            status: `✅ Klik: ${itemLabel}`
                        });
                    } catch (e) { }

                    console.log(`✅ Clicked: ${itemLabel}`);

                    // HUMAN BEHAVIOR: Wait fast but safe
                    // Random delay between 500ms and 1000ms
                    const delayTime = 500 + Math.random() * 500;
                    // console.log(`⏳ Waiting ${Math.round(delayTime)}ms...`);
                    await new Promise(r => setTimeout(r, delayTime));

                } catch (err) {
                    console.error(`❌ Error clicking button ${i}:`, err);
                }
            }

            resolve(downloadCount);
        });
    }

    function completeMultiPageDownload() {
        const pagesCompleted = totalPagesDownloaded;
        const filesDownloaded = totalFilesDownloaded;

        console.log('Multi-page downloader: === MULTI-PAGE DOWNLOAD COMPLETE ===');
        console.log(`Multi-page downloader: Total pages: ${pagesCompleted}, Total files: ${filesDownloaded}`);

        // Show completion modal
        const title = 'Multi-Page Download Complete!';
        const message = `Downloaded ${filesDownloaded} file(s) from ${pagesCompleted} page(s)`;
        const details = `Process completed successfully`;

        displayModalSafe(title, message, details, true);

        // Send completion message to background script to reset UI state
        chrome.runtime.sendMessage({
            type: 'MULTI_PAGE_DOWNLOAD_COMPLETE',
            totalFiles: filesDownloaded,
            totalPages: pagesCompleted
        }).catch(error => {
            console.log('Multi-page downloader: Could not send completion message:', error.message);
        });

        // Auto-close modal after 5 seconds (longer for multi-page)
        setTimeout(() => {
            closeModalSafe();
        }, 5000);

        console.log('Multi-page downloader: Completion message sent to background script');
        resetModuleState();
    }

    // Chrome runtime message handler
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'startMultiPageDownload') {
            console.log("Multi-page downloader: startMultiPageDownload received");

            // Reset stop flag when starting new download
            isDownloadStopped = false;
            stopAfterCurrentPage = false;

            // Send immediate response to prevent message port error
            sendResponse({
                success: true,
                message: "Multi-page download started successfully"
            });

            // Start the download process asynchronously with proper error handling
            (async () => {
                try {
                    console.log("Multi-page downloader: Starting async download process");
                    const result = await startMultiPageDownload();
                    console.log("Multi-page downloader: Process completed with result:", result);

                    // Send completion message to background script
                    chrome.runtime.sendMessage({
                        type: 'MULTI_PAGE_DOWNLOAD_COMPLETE',
                        totalFiles: result.totalFiles,
                        totalPages: result.totalPages
                    }).catch(error => {
                        console.log('Multi-page downloader: Could not send completion message:', error.message);
                    });
                } catch (error) {
                    console.error("Multi-page downloader: Error in multi-page download:", error);
                    // Send error status update
                    chrome.runtime.sendMessage({
                        type: 'UPDATE_STATUS',
                        status: `Error: ${error.message}`,
                        complete: true
                    }).catch(error => {
                        console.log('Multi-page downloader: Could not send error status:', error.message);
                    });
                }
            })();

            return true; // Keep message channel open
        } else if (message.action === 'startBPPUAutomation') {
            // NEW: startBPPUAutomation handler
            console.log("Multi-page downloader: startBPPUAutomation received");

            isDownloadStopped = false;
            stopAfterCurrentPage = false;

            sendResponse({ success: true, message: "BPPU Automation started" });

            (async () => {
                try {
                    const result = await startBPPUAutomation();
                    chrome.runtime.sendMessage({
                        type: 'MULTI_PAGE_DOWNLOAD_COMPLETE',
                        totalFiles: result.totalFiles,
                        totalPages: result.totalPages
                    });
                } catch (error) {
                    console.error("BPPU Automation Error:", error);
                    chrome.runtime.sendMessage({
                        type: 'UPDATE_STATUS',
                        status: `Error: ${error.message}`,
                        complete: true
                    });
                }
            })();
            return true;

        } else if (message.action === 'stopDownload') {
            console.log("Multi-page downloader: stopDownload received");
            stopDownload(true);
            sendResponse({
                success: true,
                message: "Multi-page download stopped successfully"
            });
            return true;
        }
    });

    // React immediately if background toggles stopRequested in storage
    try {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'local' && changes.stopRequested) {
                const val = changes.stopRequested.newValue;
                if (val === true) {
                    console.log('Multi-page downloader: stopRequested flag detected from storage. Will stop after current page.');
                    stopDownload(true);
                }
            }
        });
    } catch (e) { }

    // Auto-start if called directly
    if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('multiPage') === 'true') {
            console.log("Multi-page downloader: Auto-starting multi-page download");
            startMultiPageDownload();
        }
    }

    if (typeof window !== 'undefined') {
        window.__BPE_MULTI_PAGE_RESET__ = resetModuleState;
    }
    resetModuleState();
})();
