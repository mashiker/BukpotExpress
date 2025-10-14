// Bukpot Downloader With Filter Masa Pajak - Chrome Extension
// Version 2.0
// Automated tax document downloader with period filtering

(function () {
    if (typeof window !== 'undefined' && window.__BPE_DOWNLOADER_LOADED__) {
        console.log('Downloader: script already loaded, resetting state');
        if (typeof window.__BPE_DOWNLOADER_RESET__ === 'function') {
            window.__BPE_DOWNLOADER_RESET__();
        }
        return;
    }
    if (typeof window !== 'undefined') {
        window.__BPE_DOWNLOADER_LOADED__ = true;
    }

async function processSingleDownload() {
  // Check if download was stopped
  if (isDownloadStopped) {
    console.log("Downloader: Download stopped, aborting process");
    return;
  }

  let queue = JSON.parse(sessionStorage.getItem('coretaxDownloadQueue') || '[]');
  const totalCount = parseInt(sessionStorage.getItem('coretaxTotalCount') || 0);
  let successCount = parseInt(sessionStorage.getItem('coretaxSuccessCount') || 0);
  let skippedCount = parseInt(sessionStorage.getItem('coretaxSkippedCount') || 0);
  const idColumnIndex = parseInt(sessionStorage.getItem('coretaxIdColumnIndex'));

  if (queue.length === 0) {
    console.log("Downloader: Queue is empty. Finishing.");

    resetDownloaderState();

    const title = 'Download Complete!';
    const message = `Successfully Downloaded: ${successCount} file(s)`;
    const details = `Skipped (no download button): ${skippedCount} file(s)`;

    // Show completion modal briefly, then auto-close
    displayModalSafe(title, message, details, true);

    // Auto-close modal after 3 seconds
    setTimeout(() => {
      closeModalSafe();
    }, 3000);

    // Clean up sessionStorage
    Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('coretax')) {
            sessionStorage.removeItem(key);
        }
    });

    chrome.runtime.sendMessage({ type: "DOWNLOAD_COMPLETE" });
    return;
  }

  const itemToDownload = queue.shift();
  const currentProgress = successCount + 1;
  displayModalSafe('Download in Progress', `Downloading ${currentProgress} of ${totalCount}`, `Document: ${itemToDownload}`, false);

  const targetRow = Array.from(document.querySelectorAll("tbody tr")).find(row => {
    const idCell = row.children[idColumnIndex];
    if (idCell) {
        const headerText = document.querySelectorAll("thead th")[idColumnIndex].innerText.trim();
        const currentNum = idCell.innerText.replace(headerText, '').trim();
        return currentNum === itemToDownload;
    }
    return false;
  });

  let wasSuccessful = false;
  if (targetRow && targetRow.querySelector('#DownloadButton')) {
    targetRow.querySelector('#DownloadButton').click();
    successCount++;
    wasSuccessful = true;
    console.log(`Downloader: Clicked download for ${itemToDownload}. Success count: ${successCount}`);
  } else {
    skippedCount++; 
    console.log(`Downloader: Row or button for ${itemToDownload} not found. Skipping.`);
  }

  sessionStorage.setItem('coretaxDownloadQueue', JSON.stringify(queue));
  sessionStorage.setItem('coretaxSuccessCount', successCount);
  sessionStorage.setItem('coretaxSkippedCount', skippedCount);

  // Continue processing next file after delay (internal processing, no message needed)
  setTimeout(() => {
    processSingleDownload();
  }, wasSuccessful ? 1500 : 1000);
}

// Add stop download functionality
let isDownloadStopped = false;

function resetDownloaderState() {
    isDownloadStopped = false;
}

const displayModalSafe = (title, message, details = '', showButton = true) => {
    if (typeof displayModal === 'function') {
        displayModal(title, message, details, showButton);
    } else {
        console.log(`Downloader modal: ${title} - ${message} (${details})`);
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'stopDownload') {
        console.log("Downloader: stopDownload received");
        isDownloadStopped = true;

        // Store success count before clearing sessionStorage
        const successCount = parseInt(sessionStorage.getItem('coretaxSuccessCount') || 0);

        // Clear sessionStorage
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('coretax')) {
                sessionStorage.removeItem(key);
            }
        });

        // Close any open modals
        closeModalSafe();

        // Show stopped message with correct count
        displayModalSafe('Download Stopped', 'Download dihentikan', `Total files downloaded: ${successCount}`, true);

        // Auto-close modal after 3 seconds
        setTimeout(() => {
            closeModalSafe();
        }, 3000);

        // Send completion message to background
        chrome.runtime.sendMessage({ type: "DOWNLOAD_COMPLETE" });

        sendResponse({ success: true, message: "Download stopped successfully" });
        return true;
    }
});

if (typeof displayModal === 'function') {
    processSingleDownload();
} else {
    setTimeout(processSingleDownload, 100);
}

if (typeof window !== 'undefined') {
    window.__BPE_DOWNLOADER_RESET__ = resetDownloaderState;
}
resetDownloaderState();
})();
