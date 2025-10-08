// Bukpot Downloader With Filter Masa Pajak - Chrome Extension
// Version 2.0 - Simplified Page-Based Navigation
// Multi-page downloader with reliable page confirmation

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

    console.log(`\n📄 === PROCESSING PAGE ${totalPagesDownloaded} ===`);
    console.log(`📍 Current URL: ${window.location.href}`);

    try {
        // Show progress modal
        displayModal('Multi-Page Download',
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

        // Check for download buttons
        const downloadButtons = document.querySelectorAll('#DownloadButton');
        console.log(`🔢 Found ${downloadButtons.length} download buttons on page ${totalPagesDownloaded}`);

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

        // Check if download was stopped after downloading
        if (isDownloadStopped) {
            console.log('Multi-page downloader: Download stopped after downloading files');
            completeMultiPageDownload();
            return;
        }

        // Check if there's a next page using the new simplified approach
        console.log('\n🔍 === CHECKING FOR NEXT PAGE ===');
        const hasNextPage = await checkAndNavigateToNextSimple();

        console.log(`📊 Next page result: ${hasNextPage}`);

        if (hasNextPage && !isDownloadStopped) {
            // Continue to next page
            totalPagesDownloaded++;
            console.log(`\n🚀 === MOVING TO PAGE ${totalPagesDownloaded} ===`);
            console.log('⏳ Waiting 3 seconds before processing next page...');

            // Send navigation update to maintain UI state
            chrome.runtime.sendMessage({
                type: 'MULTI_PAGE_NAVIGATION_UPDATE',
                status: `🔄 Beralih ke halaman ${totalPagesDownloaded}...`
            }).catch(error => {
                console.log('Multi-page downloader: Could not send navigation update:', error.message);
            });

            setTimeout(() => {
                if (!isDownloadStopped) {
                    console.log(`\n🔄 === STARTING PAGE ${totalPagesDownloaded} PROCESS ===`);
                    downloadCurrentPage();
                } else {
                    console.log('Multi-page downloader: Download stopped before next page processing');
                    completeMultiPageDownload();
                }
            }, 3000); // Wait 3 seconds before next page
        } else {
            // No more pages or download stopped, finish the process
            console.log('\n🏁 === NO MORE PAGES OR STOPPED, FINISHING ===');
            console.log(`📊 Has next page: ${hasNextPage}, Stopped: ${isDownloadStopped}`);
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

// SIMPLIFIED PAGE-BASED NAVIGATION SYSTEM
async function checkAndNavigateToNextSimple() {
    console.log('\n🔍 === SIMPLIFIED PAGE-BASED NAVIGATION ===');

    // STEP 1: Get current page number before clicking
    console.log('📋 STEP 1: Detecting current page number...');
    const currentPageNumber = getCurrentPageNumber();
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
                console.log('🛑 This appears to be the last page');
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

    // Send completion message to background script to reset UI
    chrome.runtime.sendMessage({
        type: 'MULTI_PAGE_DOWNLOAD_COMPLETE',
        totalFiles: totalFilesDownloaded,
        totalPages: totalPagesDownloaded
    }).catch(error => {
        console.log('Multi-page downloader: Could not send completion message:', error.message);
    });

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