// Bukpot Downloader With Filter Masa Pajak - Chrome Extension
// Version 2.0
// Automated tax document downloader with period filtering

async function processSingleDownload() {
  let queue = JSON.parse(sessionStorage.getItem('coretaxDownloadQueue') || '[]');
  const totalCount = parseInt(sessionStorage.getItem('coretaxTotalCount') || 0);
  let successCount = parseInt(sessionStorage.getItem('coretaxSuccessCount') || 0);
  let skippedCount = parseInt(sessionStorage.getItem('coretaxSkippedCount') || 0);
  const idColumnIndex = parseInt(sessionStorage.getItem('coretaxIdColumnIndex'));

  if (queue.length === 0) {
    console.log("Downloader: Queue is empty. Finishing.");
    
    const title = 'Download Complete!';
    const message = `Successfully Downloaded: ${successCount} file(s)`;
    const details = `Skipped (no download button): ${skippedCount} file(s)`;
    
    displayModal(title, message, details, true);
    
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
  displayModal('Download in Progress', `Downloading ${currentProgress} of ${totalCount}`, `Document: ${itemToDownload}`, false);

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
  
  chrome.runtime.sendMessage({ type: "CONTINUE_DOWNLOAD", delay: wasSuccessful ? 1500 : 1000 });
}

if (typeof displayModal === 'function') {
    processSingleDownload();
} else {
    setTimeout(processSingleDownload, 100);
}