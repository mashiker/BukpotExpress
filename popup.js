// Bukpot Downloader With Filter Masa Pajak - Chrome Extension
// Version 2.0
// Automated tax document downloader with period filtering

document.getElementById('downloadBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            chrome.runtime.sendMessage({ type: "START_DOWNLOAD_PROCESS", tabId: tabs[0].id });
            window.close();
        }
    });
});