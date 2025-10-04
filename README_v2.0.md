# Bukpot Downloader Plus v2.0

## Overview

Bukpot Downloader Plus v2.0 is a Chrome Extension designed to automate the process of downloading tax documents from the CoreTax DJP portal. This version introduces a completely new workflow with automatic tax period filtering and batch downloading.

## Key Features

### ✨ New in v2.0

- **Sidebar Interface**: Replaces popup with a persistent sidebar for better user experience
- **Automatic Tax Period Filtering**: Automatically changes the tax period filter (month/year)
- **One-Click Download**: Apply filter and download all documents with a single click
- **Smart Status Updates**: Real-time progress feedback throughout the process
- **Enhanced Error Handling**: Better error messages and recovery mechanisms

### 🔧 Technical Improvements

- Chrome Extension Manifest V3 compatible
- Side Panel API integration
- Improved content script injection
- Better state management
- Enhanced logging for debugging

## Installation

1. Download the extension files to your local machine
2. Open Google Chrome
3. Navigate to `chrome://extensions/`
4. Enable "Developer mode" using the toggle in the top right
5. Click "Load unpacked" and select the extension directory
6. The extension icon should appear in your Chrome toolbar

## How to Use

### Basic Workflow

1. **Navigate to CoreTax**: Open the CoreTax DJP portal and go to the document listing page
2. **Open Extension**: Click the extension icon in your Chrome toolbar (sidebar will open)
3. **Select Tax Period**:
   - Choose the desired month from the "Pilih Bulan" dropdown
   - Choose the desired year from the "Pilih Tahun" dropdown
4. **Start Process**: Click the "Terapkan & Unduh Semua" button
5. **Monitor Progress**: Watch the status area for real-time updates
6. **Download Complete**: All documents will be automatically downloaded to your default download folder

### Process Flow

```
Select Month/Year → Click Button → Filter Applied → Page Refreshes → Auto-Download Starts → Files Downloaded
```

## User Interface

### Sidebar Components

- **Logo**: Bukpot Express branding
- **Title**: "Bukpot Downloader Plus" with version info
- **Filter Section**: Month and year dropdown selectors
- **Action Button**: "Terapkan & Unduh Semua" (enabled when both selections are made)
- **Status Area**: Real-time progress and status messages
- **Footer**: Version number and contact information

### Status Messages

- **Ready**: "Siap untuk memulai unduh otomatis."
- **Filtering**: "Menerapkan filter masa pajak..."
- **Success**: "Filter berhasil diterapkan. Memulai proses unduh otomatis..."
- **Downloading**: "Mengunduh semua dokumen..."
- **Complete**: "Proses unduh selesai!"
- **Error**: Descriptive error messages

## Troubleshooting

### Common Issues

1. **Sidebar doesn't open**
   - Ensure you're using Chrome 114+ (Side Panel API requirement)
   - Check that the extension is properly loaded
   - Refresh the CoreTax page and try again

2. **Filter not applied**
   - Make sure you're on the correct CoreTax page with document listings
   - Check that the tax period dropdown is visible on the page
   - Try refreshing the page and restarting the process

3. **Downloads don't start**
   - Verify there are documents available for the selected period
   - Check that download buttons are visible on the page
   - Ensure no browser pop-up blockers are interfering

4. **Extension not working**
   - Open Developer Tools (F12) and check Console for errors
   - Verify all permissions are granted
   - Try disabling other extensions that might conflict

### Debug Information

The extension provides detailed logging in the browser console. To view logs:

1. Press F12 to open Developer Tools
2. Go to the Console tab
3. Look for messages prefixed with:
   - `BG:` (Background script logs)
   - `Content script:` (Content script logs)
   - `Collector:` (Collector script logs)

## Technical Details

### Files Structure

```
BukpotDownloaderV2/
├── manifest.json           # Extension configuration
├── sidebar.html           # Sidebar interface
├── sidebar.css            # Sidebar styling
├── sidebar.js             # Sidebar logic
├── background.js          # Background service worker
├── filter_changer.js      # Tax period filter automation
├── collector.js           # Document collection logic
├── injector.js            # Progress modal injection
├── downloader.js          # Download coordination
└── images/                # Extension icons
    ├── skilogo.png
    └── skilogo48.png
```

### Permissions

The extension requires the following permissions:

- `activeTab`: Access to the currently active tab
- `scripting`: Inject scripts into web pages
- `sidePanel`: Open and manage the sidebar interface

### Browser Compatibility

- **Minimum Chrome Version**: 114+ (for Side Panel API)
- **Manifest Version**: 3
- **Tested On**: Latest Chrome versions

## Support

For technical support or questions:

- **Email**: sinergikonsultan.dev@gmail.com
- **Documentation**: Check TESTING_CHECKLIST.md for detailed testing procedures

## Version History

### v2.0 (Current)
- Added sidebar interface
- Implemented automatic tax period filtering
- One-click download functionality
- Enhanced error handling
- Improved user experience

### v1.0 - v1.2
- Basic popup interface
- Manual document selection
- Batch download functionality

## Privacy & Security

- This extension only operates on CoreTax DJP portal pages
- No data is collected or transmitted to third parties
- All processing happens locally in your browser
- Source code is available for review

---

© 2025 Bukpot Express. All Rights Reserved.