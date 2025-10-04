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
        console.log('Multi-page downloader: Checking for next page...');
        const hasNextPage = await checkAndNavigateToNext();

        if (hasNextPage && !isDownloadStopped) {
            // Continue to next page
            totalPagesDownloaded++;
            console.log(`Multi-page downloader: Moving to page ${totalPagesDownloaded} in 2 seconds...`);
            setTimeout(() => {
                if (!isDownloadStopped) {
                    downloadCurrentPage();
                } else {
                    completeMultiPageDownload();
                }
            }, 2000); // Wait 2 seconds before next page
        } else {
            // No more pages or download stopped, finish the process
            console.log('Multi-page downloader: No more pages or download stopped, finishing...');
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
        const maxAttempts = 20;

        const checkPageReady = () => {
            attempts++;

            // Check if table is loaded
            const table = document.querySelector('table');
            const downloadButtons = document.querySelectorAll('#DownloadButton');

            if ((table && table.rows.length > 1) || downloadButtons.length > 0) {
                console.log(`Multi-page downloader: Page ready after ${attempts} attempts`);
                resolve();
                return;
            }

            if (attempts >= maxAttempts) {
                console.log(`Multi-page downloader: Page not fully ready after ${maxAttempts} attempts, proceeding anyway`);
                resolve();
                return;
            }

            setTimeout(checkPageReady, 500);
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
            }, 1000 * index); // 1 second delay between each download
        });
    });
}

async function checkAndNavigateToNext() {
    return new Promise((resolve) => {
        console.log('Multi-page downloader: Checking for next page...');

        // Safety check: don't exceed max pages
        if (totalPagesDownloaded >= maxPagesToDownload) {
            console.log(`Multi-page downloader: Reached max page limit (${maxPagesToDownload}), stopping download`);
            resolve(false);
            return;
        }

        // Check if download was stopped
        if (isDownloadStopped) {
            console.log('Multi-page downloader: Download stopped, not checking next page');
            resolve(false);
            return;
        }

        // Look for next page button with various selectors
        const nextButtonSelectors = [
            '.p-paginator-next',
            '.p-paginator-next.p-paginator-element.p-link',
            'button[aria-label="Next Page"]',
            'button.p-paginator-next:not(.p-disabled)',
            '.pi-angle-right',
            '.next-page',
            'a[aria-label="Next"]',
            '[class*="paginator-next"]'
        ];

        let nextButton = null;

        for (let selector of nextButtonSelectors) {
            nextButton = document.querySelector(selector);
            if (nextButton) {
                // More thorough check for disabled state
                const isDisabled = nextButton.disabled ||
                                 nextButton.classList.contains('p-disabled') ||
                                 nextButton.classList.contains('disabled') ||
                                 nextButton.getAttribute('aria-disabled') === 'true' ||
                                 nextButton.style.display === 'none' ||
                                 nextButton.style.visibility === 'hidden';

                if (!isDisabled) {
                    console.log(`Multi-page downloader: Found next button with selector: ${selector}`);
                    break;
                } else {
                    console.log(`Multi-page downloader: Found next button but it's disabled: ${selector}`);
                    nextButton = null;
                }
            }
        }

        if (!nextButton) {
            console.log('Multi-page downloader: No next page button found, download complete');
            resolve(false);
            return;
        }

        console.log('Multi-page downloader: Clicking next page button...');

        try {
            // Store current page URL to verify navigation
            const currentUrl = window.location.href;

            // Click the next button
            nextButton.click();

            // Wait for navigation and verify URL changed
            setTimeout(() => {
                const newUrl = window.location.href;
                if (newUrl !== currentUrl) {
                    console.log('Multi-page downloader: Successfully navigated to next page');
                    resolve(true);
                } else {
                    console.log('Multi-page downloader: Navigation failed (URL unchanged), assuming end of pages');
                    resolve(false);
                }
            }, 2000); // Wait 2 seconds for page navigation

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