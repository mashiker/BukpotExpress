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

const BPPU_DOWNLOAD_LOG_KEY = 'bppuDownloadLog';
let downloadAuditLog = createEmptyDownloadAuditLog();
let auditLogStarted = false;

function createEmptyDownloadAuditLog() {
  return {
    startedAt: new Date().toISOString(),
    completedAt: null,
    mode: 'single-page',
    totalDetected: 0,
    successCount: 0,
    failedCount: 0,
    totalPages: 1,
    entries: []
  };
}

function saveDownloadAuditLog() {
  try {
    chrome.storage?.local?.set({ [BPPU_DOWNLOAD_LOG_KEY]: downloadAuditLog });
  } catch (e) {
    console.log('Downloader: Could not save download audit log:', e);
  }
}

function startDownloadAuditLog(totalCount = 0) {
  if (auditLogStarted) return;
  auditLogStarted = true;
  downloadAuditLog = createEmptyDownloadAuditLog();
  downloadAuditLog.totalDetected = totalCount;
  saveDownloadAuditLog();
}

function finishDownloadAuditLog() {
  downloadAuditLog.completedAt = new Date().toISOString();
  saveDownloadAuditLog();
}

function cleanCellText(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function getRowCellMap(row) {
  const cellMap = {};
  if (!row) return cellMap;

  const headers = Array.from(document.querySelectorAll('thead th')).map(header => cleanCellText(header.innerText));
  row.querySelectorAll('td').forEach((cell, index) => {
    const titleElement = cell.querySelector('.p-column-title');
    const title = cleanCellText(titleElement ? titleElement.textContent : headers[index] || `Kolom ${index + 1}`);
    const rawText = cleanCellText(cell.textContent || cell.innerText);
    const value = titleElement ? cleanCellText(rawText.replace(title, '')) : rawText;
    cellMap[title] = value;
  });

  return cellMap;
}

function buildRowMetadata(row, documentNumber, pageIndex) {
  const cellMap = getRowCellMap(row);
  return {
    page: 1,
    pageIndex,
    documentNumber: documentNumber || cellMap['Nomor Dokumen'] || cellMap['Nomor Bukti Potong'] || cellMap['Nomor Pemotongan'] || '',
    documentDate: cellMap['Tanggal Dokumen'] || '',
    documentTitle: cellMap['Judul Dokumen'] || '',
    documentType: cellMap['Jenis Dokumen'] || '',
    caseNumber: cellMap['Nomor Kasus'] || '',
    createdAt: cellMap['Tanggal Pembuatan'] || '',
    createdBy: cellMap['Pengguna Pembuatan'] || ''
  };
}

function recordDownloadAuditEntry(meta, status, attempts, reason = '') {
  const entry = {
    no: downloadAuditLog.entries.length + 1,
    page: meta.page || 1,
    pageIndex: meta.pageIndex || '',
    documentNumber: meta.documentNumber || '',
    documentDate: meta.documentDate || '',
    documentTitle: meta.documentTitle || '',
    documentType: meta.documentType || '',
    caseNumber: meta.caseNumber || '',
    createdAt: meta.createdAt || '',
    createdBy: meta.createdBy || '',
    status,
    attempts,
    reason,
    loggedAt: new Date().toISOString()
  };

  downloadAuditLog.entries.push(entry);
  downloadAuditLog.totalDetected = Math.max(downloadAuditLog.totalDetected, downloadAuditLog.entries.length);
  downloadAuditLog.successCount = downloadAuditLog.entries.filter(item => item.status === 'BERHASIL').length;
  downloadAuditLog.failedCount = downloadAuditLog.entries.filter(item => item.status === 'GAGAL').length;
  saveDownloadAuditLog();
}

async function verifyDownloadStarted(itemLabel, sinceMs) {
  try {
    const deadline = Date.now() + 5000;

    while (Date.now() < deadline) {
      const verified = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'VERIFY_DOWNLOAD_STARTED',
          sinceMs,
          windowMs: 10000,
          itemLabel
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Downloader: download verification message error:', chrome.runtime.lastError.message);
            resolve(false);
            return;
          }

          resolve(!!response?.verified);
        });
      });

      if (verified) return true;
      await new Promise(r => setTimeout(r, 250));
    }

    console.log(`Downloader: download not verified for ${itemLabel}`);
    return false;
  } catch (e) {
    console.log('Downloader: verifyDownload error:', e);
    return false;
  }
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
  startDownloadAuditLog(totalCount);

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

    finishDownloadAuditLog();
    chrome.runtime.sendMessage({
      type: "DOWNLOAD_COMPLETE",
      totalDetected: downloadAuditLog.totalDetected,
      successFiles: downloadAuditLog.successCount,
      failedFiles: downloadAuditLog.failedCount,
      totalPages: 1
    });
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
  const pageIndex = totalCount > 0 ? totalCount - queue.length : successCount + skippedCount + 1;
  if (targetRow && targetRow.querySelector('#DownloadButton')) {
    const meta = buildRowMetadata(targetRow, itemToDownload, pageIndex);
    const downloadButton = targetRow.querySelector('#DownloadButton');
    const clickStartedAt = Date.now();
    downloadButton.click();
    await new Promise(r => setTimeout(r, 500));

    let verified = await verifyDownloadStarted(itemToDownload, clickStartedAt);
    let attempts = 1;

    if (!verified) {
      console.log(`Downloader: Download not detected for ${itemToDownload}, retrying click...`);
      attempts = 2;
      const retryStartedAt = Date.now();
      downloadButton.click();
      await new Promise(r => setTimeout(r, 1000));
      verified = await verifyDownloadStarted(itemToDownload, retryStartedAt);
    }

    if (verified) {
      successCount++;
      wasSuccessful = true;
      recordDownloadAuditEntry(meta, 'BERHASIL', attempts);
      console.log(`Downloader: Verified download for ${itemToDownload}. Success count: ${successCount}`);
    } else {
      skippedCount++;
      recordDownloadAuditEntry(meta, 'GAGAL', attempts, 'Download tidak terdeteksi setelah retry');
      console.log(`Downloader: Download failed verification for ${itemToDownload}.`);
    }
  } else {
    skippedCount++; 
    recordDownloadAuditEntry(buildRowMetadata(targetRow, itemToDownload, pageIndex), 'GAGAL', 0, 'Baris atau tombol download tidak ditemukan');
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
        finishDownloadAuditLog();
        chrome.runtime.sendMessage({
            type: "DOWNLOAD_COMPLETE",
            totalDetected: downloadAuditLog.totalDetected,
            successFiles: downloadAuditLog.successCount,
            failedFiles: downloadAuditLog.failedCount,
            totalPages: 1
        });

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
