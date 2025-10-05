// Bukpot Downloader With Filter Masa Pajak - Chrome Extension
// Version 2.0
// Multi-page downloader with pagination support

let totalPagesDownloaded = 0;
let totalFilesDownloaded = 0;
let currentPageInfo = { current: 1, total: 1 };
let isDownloadStopped = false;
let maxPagesToDownload = 10; // Safety limit: max 10 pages
let downloadedFileIds = new Set(); // Track downloaded files to avoid duplicates

async function startMultiPageDownload() {
    console.log('Multi-page downloader: === STARTING MULTI-PAGE DOWNLOAD ===');

    // Initialize counters
    totalPagesDownloaded = 1; // Start with page 1
    totalFilesDownloaded = 0;
    downloadedFileIds.clear(); // Clear previous downloads

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

async function downloadCurrentPage() {
    // Check if download was stopped before processing
    if (isDownloadStopped) {
        console.log('Multi-page downloader: Download stopped, cancelling current page processing');
        completeMultiPageDownload();
        return;
    }

    console.log(`Multi-page downloader: === PROCESSING PAGE ${totalPagesDownloaded} ===`);
    console.log(`Multi-page downloader: Current URL: ${window.location.href}`);

    // Send page processing update to maintain UI state
    chrome.runtime.sendMessage({
        type: 'MULTI_PAGE_NAVIGATION_UPDATE',
        status: `Memproses halaman ${totalPagesDownloaded}...`
    }).catch(error => {
        console.log('Multi-page downloader: Could not send page update:', error.message);
    });

    try {
        // Show progress modal
        displayModal('Multi-Page Download',
            `Downloading Page ${totalPagesDownloaded}`,
            `Total files so far: ${totalFilesDownloaded}`,
            false);

        // Wait for page to load completely
        console.log('Multi-page downloader: Waiting for page to load...');
        await waitForPageLoad();
        console.log('Multi-page downloader: Page loaded successfully');

        // Check if download was stopped after page load
        if (isDownloadStopped) {
            console.log('Multi-page downloader: Download stopped after page load');
            completeMultiPageDownload();
            return;
        }

        // Check for download buttons
        const downloadButtons = document.querySelectorAll('#DownloadButton');
        console.log(`Multi-page downloader: Found ${downloadButtons.length} download buttons on page ${totalPagesDownloaded}`);

        if (downloadButtons.length === 0) {
            console.log('Multi-page downloader: No download buttons found, checking for next page anyway');
        } else {
            // Collect and download files on current page
            const downloadedCount = await downloadFilesOnCurrentPage();
            totalFilesDownloaded += downloadedCount;

            console.log(`Multi-page downloader: Downloaded ${downloadedCount} files from page ${totalPagesDownloaded}`);
        }

        // Check if download was stopped after downloading
        if (isDownloadStopped) {
            console.log('Multi-page downloader: Download stopped after downloading files');
            completeMultiPageDownload();
            return;
        }

        // Check if there's a next page
        console.log('Multi-page downloader: === CHECKING FOR NEXT PAGE ===');
        const hasNextPage = await checkAndNavigateToNext();

        console.log(`Multi-page downloader: Next page result: ${hasNextPage}`);
        console.log(`Multi-page downloader: Is download stopped: ${isDownloadStopped}`);

        if (hasNextPage && !isDownloadStopped) {
            // Continue to next page
            totalPagesDownloaded++;
            console.log(`Multi-page downloader: === MOVING TO PAGE ${totalPagesDownloaded} ===`);
            console.log('Multi-page downloader: Waiting 5 seconds before processing next page...');

            // Send navigation update to maintain UI state
            chrome.runtime.sendMessage({
                type: 'MULTI_PAGE_NAVIGATION_UPDATE',
                status: `Bergerak ke halaman ${totalPagesDownloaded}...`
            }).catch(error => {
                console.log('Multi-page downloader: Could not send navigation update:', error.message);
            });

            setTimeout(() => {
                if (!isDownloadStopped) {
                    console.log('Multi-page downloader: === STARTING NEXT PAGE PROCESS ===');
                    downloadCurrentPage();
                } else {
                    console.log('Multi-page downloader: Download stopped before next page processing');
                    completeMultiPageDownload();
                }
            }, 5000); // Wait 5 seconds before next page (increased for better timing)
        } else {
            // No more pages or download stopped, finish the process
            console.log('Multi-page downloader: === NO MORE PAGES OR STOPPED, FINISHING ===');
            console.log(`Multi-page downloader: Has next page: ${hasNextPage}, Stopped: ${isDownloadStopped}`);
            completeMultiPageDownload();
        }

    } catch (error) {
        console.error('Multi-page downloader: Error downloading current page:', error);
        displayModal('Multi-Page Download Error',
            `Error on page ${totalPagesDownloaded}`,
            `Error: ${error.message}`,
            true);

        // Still try to continue or finish
        setTimeout(() => {
            completeMultiPageDownload();
        }, 3000);
    }
}

// Function to stop the download process
function stopDownload() {
    console.log('Multi-page downloader: === STOP DOWNLOAD REQUESTED ===');
    isDownloadStopped = true;

    // Close any open modals
    if (typeof closeModal === 'function') {
        closeModal();
    }

    // Show stopped message
    displayModal('Download Stopped',
        `Download dihentikan`,
        `Total files downloaded: ${totalFilesDownloaded} dari ${totalPagesDownloaded} halaman`,
        true);

    // Auto-close modal after 3 seconds
    setTimeout(() => {
        if (typeof closeModal === 'function') {
            closeModal();
        }
    }, 3000);
}

async function waitForPageLoad() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 40; // Increased from 20

        const checkPageReady = () => {
            attempts++;

            // Check if table is loaded and has data
            const table = document.querySelector('table');
            const downloadButtons = document.querySelectorAll('#DownloadButton');
            const tableRows = document.querySelectorAll('tbody tr');

            // More comprehensive page readiness check
            const tableReady = table && table.rows.length > 1;
            const buttonsReady = downloadButtons.length > 0;
            const hasDataRows = tableRows.length > 1; // More than just header

            // Check for loading indicators that might still be present
            const loadingIndicators = document.querySelectorAll('.loading, .spinner, [class*="loading"]');
            const hasLoadingElements = loadingIndicators.length > 0;

            if ((tableReady || buttonsReady) && hasDataRows && !hasLoadingElements) {
                console.log(`Multi-page downloader: Page ready after ${attempts} attempts`);
                console.log(`Multi-page downloader: Table rows: ${tableRows.length}, Download buttons: ${downloadButtons.length}`);
                resolve();
                return;
            }

            if (attempts >= maxAttempts) {
                console.log(`Multi-page downloader: Page not fully ready after ${maxAttempts} attempts, proceeding anyway`);
                console.log(`Multi-page downloader: Final state - Table rows: ${tableRows.length}, Download buttons: ${downloadButtons.length}`);
                resolve();
                return;
            }

            setTimeout(checkPageReady, 500); // Check every 500ms
        };

        checkPageReady();
    });
}

async function downloadFilesOnCurrentPage() {
    return new Promise((resolve) => {
        // First, collect downloadable items
        const downloadButtons = document.querySelectorAll('#DownloadButton');
        console.log(`Multi-page downloader: Found ${downloadButtons.length} download buttons on current page`);

        if (downloadButtons.length === 0) {
            resolve(0);
            return;
        }

        // Get unique identifiers for each download button to avoid duplicates
        const buttonsWithIds = Array.from(downloadButtons).map((button, index) => {
            const row = button.closest('tr');
            let fileId = `page_${totalPagesDownloaded}_btn_${index}`; // Default ID

            if (row) {
                // Try to get a unique identifier from the row
                const cells = row.querySelectorAll('td');
                if (cells.length > 0) {
                    const firstCell = cells[0].textContent.trim();
                    if (firstCell) {
                        fileId = `file_${firstCell}`;
                    }
                }
            }

            return { button, fileId };
        });

        // Filter out already downloaded files
        const newButtons = buttonsWithIds.filter(item => !downloadedFileIds.has(item.fileId));
        console.log(`Multi-page downloader: ${newButtons.length} new files to download (excluding duplicates)`);

        if (newButtons.length === 0) {
            console.log('Multi-page downloader: No new files to download on this page');
            resolve(0);
            return;
        }

        let downloadedCount = 0;
        let completedCount = 0;

        // Click each download button with delay
        newButtons.forEach(({ button, fileId }, index) => {
            setTimeout(() => {
                // Check if download was stopped
                if (isDownloadStopped) {
                    console.log(`Multi-page downloader: Download stopped, skipping button ${index + 1}`);
                    completedCount++;
                    if (completedCount === newButtons.length) {
                        resolve(downloadedCount);
                    }
                    return;
                }

                try {
                    console.log(`Multi-page downloader: Clicking download button ${index + 1}/${newButtons.length} (ID: ${fileId})`);
                    button.click();
                    downloadedCount++;
                    downloadedFileIds.add(fileId); // Mark as downloaded
                    console.log(`Multi-page downloader: Download ${index + 1} initiated successfully`);
                } catch (error) {
                    console.error(`Multi-page downloader: Error clicking download button ${index + 1}:`, error);
                }

                completedCount++;

                // When all downloads are initiated
                if (completedCount === newButtons.length) {
                    console.log(`Multi-page downloader: Page download complete. Downloaded ${downloadedCount} files.`);
                    resolve(downloadedCount);
                }
            }, 2000 * index); // 2 second delay between each download (increased for reliability)
        });
    });
}

async function checkAndNavigateToNext() {
    return new Promise((resolve) => {
        console.log('Multi-page downloader: === CHECKING FOR NEXT PAGE ===');
        console.log('Multi-page downloader: Current page URL:', window.location.href);
        console.log(`Multi-page downloader: Current page: ${totalPagesDownloaded}`);

        // Safety check: don't exceed max pages
        if (totalPagesDownloaded >= maxPagesToDownload) {
            console.log(`Multi-page downloader: Reached max page limit (${maxPagesToDownload}), stopping download`);
            resolve(false);
            return;
        }

        // Safety check: don't exceed realistic page count
        if (totalPagesDownloaded >= 5) {
            console.log(`Multi-page downloader: Reached safety limit (5 pages), stopping download`);
            console.log('Multi-page downloader: This might indicate disabled state detection issue');
            resolve(false);
            return;
        }

        // Check if download was stopped
        if (isDownloadStopped) {
            console.log('Multi-page downloader: Download stopped, not checking next page');
            resolve(false);
            return;
        }

        // Check if there are any download buttons (content-based stop)
        const currentDownloadButtons = document.querySelectorAll('#DownloadButton');
        if (currentDownloadButtons.length === 0) {
            console.log('Multi-page downloader: No download buttons found, assuming end of pages');
            resolve(false);
            return;
        }

        // Debug: Log all possible pagination elements
        console.log('Multi-page downloader: Looking for pagination elements...');

        // Check for paginator container
        const paginatorContainers = document.querySelectorAll('.p-paginator');
        console.log(`Multi-page downloader: Found ${paginatorContainers.length} paginator containers`);

        if (paginatorContainers.length > 0) {
            paginatorContainers.forEach((container, index) => {
                console.log(`Multi-page downloader: Paginator ${index + 1}:`, container.innerHTML);

                // Log specific pagination elements
                const currentPage = container.querySelector('.p-paginator-current');
                const firstPage = container.querySelector('.p-paginator-first');
                const prevPage = container.querySelector('.p-paginator-prev');
                const nextPage = container.querySelector('.p-paginator-next');
                const lastPage = container.querySelector('.p-paginator-last');

                console.log(`Multi-page downloader: - Current page element:`, currentPage?.textContent);
                console.log(`Multi-page downloader: - First page disabled:`, firstPage?.classList.contains('p-disabled'));
                console.log(`Multi-page downloader: - Prev page disabled:`, prevPage?.classList.contains('p-disabled'));
                console.log(`Multi-page downloader: - Next page disabled:`, nextPage?.classList.contains('p-disabled'));
                console.log(`Multi-page downloader: - Last page disabled:`, lastPage?.classList.contains('p-disabled'));
            });
        }

        // Check page content for empty state
        const tableRows = document.querySelectorAll('tbody tr');
        console.log(`Multi-page downloader: Found ${tableRows.length} table rows`);

        if (tableRows.length <= 1) { // Only header row
            console.log('Multi-page downloader: No data rows found, assuming last page');
            resolve(false);
            return;
        }

        // Enhanced selector list for next page button
        const nextButtonSelectors = [
            '.p-paginator-next',
            '.p-paginator-next.p-paginator-element.p-link',
            'button[aria-label="Next Page"]',
            'button.p-paginator-next:not(.p-disabled)',
            '.pi-angle-right',
            '.next-page',
            'a[aria-label="Next"]',
            '[class*="paginator-next"]',
            'button.p-paginator-element.p-link.p-paginator-next',
            'span.p-paginator-icon.pi.pi-angle-right',
            '.p-paginator-element[aria-label="Next"]'
        ];

        let nextButton = null;
        let foundSelector = null;

        console.log('Multi-page downloader: Testing', nextButtonSelectors.length, 'selectors...');

        for (let selector of nextButtonSelectors) {
            nextButton = document.querySelector(selector);
            if (nextButton) {
                console.log(`Multi-page downloader: ✓ Found element with selector: ${selector}`);

                // More thorough check for disabled state - COMPREHENSIVE CHECK
                const isDisabled = nextButton.disabled ||
                                 nextButton.classList.contains('p-disabled') ||
                                 nextButton.classList.contains('disabled') ||
                                 nextButton.classList.contains('p-state-disabled') ||
                                 nextButton.getAttribute('aria-disabled') === 'true' ||
                                 nextButton.getAttribute('tabindex') === '-1' ||
                                 nextButton.style.display === 'none' ||
                                 nextButton.style.visibility === 'hidden' ||
                                 nextButton.style.opacity === '0' ||
                                 nextButton.style.pointerEvents === 'none';

                console.log(`Multi-page downloader: - Button disabled: ${isDisabled}`);
                console.log(`Multi-page downloader: - Button classes: ${nextButton.className}`);
                console.log(`Multi-page downloader: - Button disabled attr: ${nextButton.getAttribute('disabled')}`);
                console.log(`Multi-page downloader: - Button aria-disabled: ${nextButton.getAttribute('aria-disabled')}`);
                console.log(`Multi-page downloader: - Button tabindex: ${nextButton.getAttribute('tabindex')}`);
                console.log(`Multi-page downloader: - Button pointer-events: ${nextButton.style.pointerEvents}`);

                // Check parent elements for disabled state
                const parent = nextButton.closest('li, div, span');
                if (parent) {
                    const parentDisabled = parent.classList.contains('p-disabled') ||
                                         parent.classList.contains('p-state-disabled');
                    console.log(`Multi-page downloader: - Parent disabled: ${parentDisabled}`);
                    console.log(`Multi-page downloader: - Parent classes: ${parent.className}`);
                }

                if (!isDisabled) {
                    console.log(`Multi-page downloader: ✓ Button is ENABLED with selector: ${selector}`);
                    foundSelector = selector;
                    break;
                } else {
                    console.log(`Multi-page downloader: ✗ Button is DISABLED with selector: ${selector}`);
                    nextButton = null;
                }
            } else {
                console.log(`Multi-page downloader: ✗ No element found with selector: ${selector}`);
            }
        }

        if (!nextButton) {
            console.log('Multi-page downloader: ❌ No valid next page button found, assuming last page');

            // Additional check: look for any element that might be next button
            const allButtons = document.querySelectorAll('button, a');
            console.log(`Multi-page downloader: Found ${allButtons.length} total buttons/links on page`);

            const possibleNextButtons = Array.from(allButtons).filter(el => {
                const text = el.textContent.toLowerCase();
                const hasNextText = text.includes('next') || text.includes('selanjutnya');
                const hasIcon = el.querySelector('.pi-angle-right, .pi-chevron-right');
                return hasNextText || hasIcon;
            });

            console.log(`Multi-page downloader: Found ${possibleNextButtons.length} possible next buttons:`, possibleNextButtons);

            resolve(false);
            return;
        }

        console.log('Multi-page downloader: === CLICKING NEXT PAGE BUTTON ===');
        console.log(`Multi-page downloader: Using selector: ${foundSelector}`);

        try {
            // Store current page URL to verify navigation
            const currentUrl = window.location.href;
            console.log('Multi-page downloader: Current URL before click:', currentUrl);

            // Click the next button
            console.log('Multi-page downloader: Performing click...');
            nextButton.click();

            // Wait for navigation and verify URL changed
            console.log('Multi-page downloader: Waiting for navigation...');
            setTimeout(() => {
                const newUrl = window.location.href;
                console.log('Multi-page downloader: URL after click:', newUrl);
                console.log('Multi-page downloader: URL changed:', newUrl !== currentUrl);

                // Check if page content changed (URL might be same but content different)
                const newDownloadButtons = document.querySelectorAll('#DownloadButton');
                console.log('Multi-page downloader: Download buttons after navigation:', newDownloadButtons.length);

                // Check if we actually navigated to a new page by comparing content
                const newTableRows = document.querySelectorAll('tbody tr');
                console.log('Multi-page downloader: Table rows after navigation:', newTableRows.length);

                // Enhanced navigation verification - check for pagination indicators
                const currentPageElement = document.querySelector('.p-paginator-current');
                const nextPageElement = document.querySelector('.p-paginator-next');
                const isNextDisabled = nextPageElement ? (
                    nextPageElement.disabled ||
                    nextPageElement.classList.contains('p-disabled') ||
                    nextPageElement.classList.contains('disabled') ||
                    nextPageElement.getAttribute('aria-disabled') === 'true'
                ) : false;

                console.log('Multi-page downloader: Current page indicator:', currentPageElement?.textContent);
                console.log('Multi-page downloader: Next button disabled after click:', isNextDisabled);

                // More strict check: verify navigation actually worked
                if (newUrl !== currentUrl) {
                    console.log('Multi-page downloader: ✅ Navigation successful (URL changed)');
                    resolve(true);
                } else if (newDownloadButtons.length !== currentDownloadButtons.length) {
                    console.log('Multi-page downloader: ✅ Navigation successful (content changed)');
                    resolve(true);
                } else if (newTableRows.length !== tableRows.length) {
                    console.log('Multi-page downloader: ✅ Navigation successful (table content changed)');
                    resolve(true);
                } else if (currentPageElement) {
                    // Check if page number has changed
                    const pageText = currentPageElement.textContent;
                    const pageMatch = pageText.match(/(\d+)/);
                    if (pageMatch) {
                        const currentPageNum = parseInt(pageMatch[1]);
                        if (currentPageNum > totalPagesDownloaded) {
                            console.log('Multi-page downloader: ✅ Navigation successful (page number increased)');
                            resolve(true);
                        } else {
                            console.log('Multi-page downloader: ❌ Navigation failed (page number did not increase)');
                            resolve(false);
                        }
                    } else {
                        console.log('Multi-page downloader: ❌ Navigation failed (no changes detected)');
                        resolve(false);
                    }
                } else {
                    console.log('Multi-page downloader: ❌ Navigation failed (no changes detected)');
                    console.log('Multi-page downloader: This indicates next button was disabled but not detected properly');
                    resolve(false);
                }
            }, 5000); // Wait 5 seconds for page navigation (increased for better timing)

        } catch (error) {
            console.error('Multi-page downloader: Error clicking next button:', error);
            resolve(false);
        }
    });
}

function completeMultiPageDownload() {
    console.log('Multi-page downloader: === MULTI-PAGE DOWNLOAD COMPLETE ===');
    console.log(`Multi-page downloader: Total pages: ${totalPagesDownloaded}, Total files: ${totalFilesDownloaded}`);

    // Show completion modal
    const title = 'Multi-Page Download Complete!';
    const message = `Downloaded ${totalFilesDownloaded} file(s) from ${totalPagesDownloaded} page(s)`;
    const details = `Process completed successfully`;

    displayModal(title, message, details, true);

    // Auto-close modal after 5 seconds (longer for multi-page)
    setTimeout(() => {
        if (typeof closeModal === 'function') {
            closeModal();
        } else {
            // Fallback: force remove modal if closeModal not available
            const modal = document.querySelector('.ct-modal-overlay');
            if (modal) {
                modal.remove();
            }
        }
    }, 5000);

    // Note: No longer sending message to background script
    // Background script is already waiting for the response from startMultiPageDownload
    console.log('Multi-page downloader: Completion handled by async response');
}

// Chrome runtime message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startMultiPageDownload') {
        console.log("Multi-page downloader: startMultiPageDownload received");

        // Reset stop flag when starting new download
        isDownloadStopped = false;

        try {
            startMultiPageDownload()
                .then(result => {
                    console.log("Multi-page downloader: Process completed with result:", result);
                    sendResponse({
                        success: true,
                        message: "Multi-page download completed successfully",
                        totalPages: result.totalPages,
                        totalFiles: result.totalFiles
                    });
                })
                .catch(error => {
                    console.error("Multi-page downloader: Error in multi-page download:", error);
                    sendResponse({
                        success: false,
                        message: error.message,
                        error: error.message
                    });
                });

            // Return true to indicate async response
            return true;
        } catch (error) {
            console.error("Multi-page downloader: Error starting multi-page download:", error);
            sendResponse({
                success: false,
                message: error.message,
                error: error.message
            });
        }
    } else if (message.action === 'stopDownload') {
        console.log("Multi-page downloader: stopDownload received");
        stopDownload();
        sendResponse({
            success: true,
            message: "Multi-page download stopped successfully"
        });
        return true;
    }
});

// Auto-start if called directly
if (typeof window !== 'undefined' && window.location) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('multiPage') === 'true') {
        console.log("Multi-page downloader: Auto-starting multi-page download");
        startMultiPageDownload();
    }
}