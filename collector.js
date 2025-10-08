// Bukpot Downloader With Filter Masa Pajak - Chrome Extension
// Version 2.0
// Automated tax document downloader with period filtering

function collectAndStoreIdentifiers() {
    console.log("Collector: Starting collection process...");

    // First check if we have any download buttons at all
    const downloadButtons = document.querySelectorAll('#DownloadButton');
    console.log(`Collector: Found ${downloadButtons.length} download buttons on page`);

    if (downloadButtons.length === 0) {
        console.log("Collector: No download buttons found, looking for alternative button selectors...");
        // Try alternative selectors
        const altButtons = document.querySelectorAll('button[onclick*="download"], button[id*="download"], .download-btn, [class*="download"]');
        console.log(`Collector: Found ${altButtons.length} alternative download buttons`);

        if (altButtons.length === 0) {
            console.log("Collector: No download buttons found at all, proceeding anyway for button-based download");
        }
    }

    const identifierSet = new Set();
    let identifierColumnIndex = -1;

    const headers = document.querySelectorAll("thead th");
    const headerTexts = Array.from(headers).map(th => th.innerText.trim());
    console.log(`Collector: Found headers: ${headerTexts.join(', ')}`);

    // Find the unique document identifier column
    if (headerTexts.includes("Nomor Faktur Pajak")) {
        identifierColumnIndex = headerTexts.indexOf("Nomor Faktur Pajak");
        console.log(`Collector: Found 'Nomor Faktur Pajak' column at index ${identifierColumnIndex}`);
    } else if (headerTexts.includes("Nomor Pemotongan")) {
        identifierColumnIndex = headerTexts.indexOf("Nomor Pemotongan");
        console.log(`Collector: Found 'Nomor Pemotongan' column at index ${identifierColumnIndex}`);
    } else if (headerTexts.includes("Nomor Bukti Potong")) {
        identifierColumnIndex = headerTexts.indexOf("Nomor Bukti Potong");
        console.log(`Collector: Found 'Nomor Bukti Potong' column at index ${identifierColumnIndex}`);
    }

    if (identifierColumnIndex === -1) {
        console.log("Collector: Could not identify document number column, proceeding with button-based download");
        // For automatic workflow, we'll proceed with button-based download
        chrome.runtime.sendMessage({ type: "DOWNLOAD_STARTED" });
        return;
    }

    console.log(`Collector: Unique identifier found at column index ${identifierColumnIndex}.`);

    // Check if this is automatic workflow (no manual selection)
    const selectedRows = document.querySelectorAll("tbody tr:has(div.p-highlight)");
    let allRows = [];
    let skippedCount = 0;

    if (selectedRows.length === 0) {
        // Automatic workflow: collect all rows with download buttons
        console.log("Collector: No manual selection found, collecting all downloadable documents");
        allRows = document.querySelectorAll("tbody tr");
        console.log(`Collector: Found ${allRows.length} total rows in table`);

        allRows.forEach((row, index) => {
            const downloadButton = row.querySelector('#DownloadButton');
            if (downloadButton) {
                console.log(`Collector: Row ${index} has download button`);
                const idCell = row.children[identifierColumnIndex];
                if (idCell) {
                    const idText = idCell.innerText.replace(headerTexts[identifierColumnIndex], '').trim();
                    if (idText) {
                        identifierSet.add(idText);
                        console.log(`Collector: Added identifier: ${idText}`);
                    }
                }
            } else {
                skippedCount++;
                if (skippedCount <= 5) { // Only log first 5 to avoid spam
                    console.log(`Collector: Row ${index} has no download button`);
                }
            }
        });
    } else {
        // Manual workflow: collect only selected rows
        console.log(`Collector: Found ${selectedRows.length} manually selected rows`);
        selectedRows.forEach((row, index) => {
            const downloadButton = row.querySelector('#DownloadButton');
            if (downloadButton) {
                console.log(`Collector: Selected row ${index} has download button`);
                const idCell = row.children[identifierColumnIndex];
                if (idCell) {
                    const idText = idCell.innerText.replace(headerTexts[identifierColumnIndex], '').trim();
                    if (idText) {
                        identifierSet.add(idText);
                        console.log(`Collector: Added identifier from selected row: ${idText}`);
                    }
                }
            } else {
                skippedCount++;
                console.log(`Collector: Selected row ${index} has no download button`);
            }
        });
    }

    const identifierList = Array.from(identifierSet);
    console.log(`Collector: Found ${identifierList.length} unique items to download.`);

    if (identifierList.length > 0) {
        sessionStorage.setItem('coretaxDownloadQueue', JSON.stringify(identifierList));
        sessionStorage.setItem('coretaxTotalCount', identifierList.length);
        sessionStorage.setItem('coretaxSuccessCount', 0);
        sessionStorage.setItem('coretaxSkippedCount', skippedCount);
        sessionStorage.setItem('coretaxIdColumnIndex', identifierColumnIndex);

        chrome.runtime.sendMessage({ type: "DOWNLOAD_STARTED" });
    } else {
        console.log("Collector: No downloadable documents found, but proceeding with button-based download");
        // Even if no identifiers found, proceed with button-based download for automatic workflow
        chrome.runtime.sendMessage({ type: "DOWNLOAD_STARTED" });
    }
}

// Check if this is an automatic workflow call
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('automatic') === 'true') {
    console.log("Collector: Automatic workflow detected");
    collectAndStoreIdentifiers();
} else {
    // Legacy support for popup-based workflow
    console.log("Collector: Manual workflow detected");
    collectAndStoreIdentifiers();
}