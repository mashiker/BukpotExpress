# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bukpot Express is a Chrome extension that automates the download of Indonesian tax documents (bukti potong) from the CoreTax DJP portal. It provides period filtering and batch download capabilities with both single-page and multi-page modes.

## Architecture

This is a Manifest V3 Chrome extension with the following key components:

### Core Files Structure
- **manifest.json**: Extension configuration (Manifest V3, permissions, side panel)
- **background.js**: Service worker handling download coordination and state management
- **popup.html/popup.css/popup.js**: Main user interface with controls for filtering and downloading
- **sidebar.html/sidebar.css**: Alternative sidebar interface (uses same popup.js)
- **filter_changer.js**: Handles automatic tax period filtering on CoreTax pages
- **collector.js**: Scans and collects downloadable document links from the page
- **downloader.js**: Manages single-page download process
- **multi_page_downloader.js**: Handles multi-page download with automatic navigation
- **injector.js**: Injects progress modal and UI elements into the target page

### Extension Architecture Pattern
The extension follows a message-passing architecture:
1. **UI Layer** (popup/sidebar) sends user commands to background script
2. **Background Script** coordinates the overall download process and manages state
3. **Content Scripts** (injected) interact with CoreTax DOM and handle page-specific operations
4. **Web Accessible Resources** provide content scripts to CoreTax pages

### Key Design Patterns
- **State Management**: Centralized in background.js with download tracking
- **Message Passing**: Chrome extension messaging between background and content scripts
- **Frame Broadcasting**: Commands sent to all frames for reliability
- **Timeout Management**: Tracked timeout system for cleanup and error recovery
- **Progress Monitoring**: Real-time status updates across UI and injected modal

## Development Commands

Since this is a Chrome extension project, there are no traditional build commands. Development involves:

### Loading the Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the project directory
4. The extension icon will appear in the toolbar

### Testing
- **Manual Testing**: Load extension in Chrome and test on CoreTax portal
- **Console Debugging**: Use F12 Developer Tools to check logs:
  - Background script logs: Prefixed with `BG:`
  - Content script logs: Prefixed with `Content script:`
  - Component-specific logs: `Collector:`, `Downloader:`, etc.

### Reloading During Development
- Go to `chrome://extensions/`
- Find "Bukpot Express" and click the reload button
- Refresh CoreTax pages to test changes

## Key Features Implementation

### Download Modes
- **Single Page**: Downloads all documents from current page only
- **Multi Page**: Navigates through all pages automatically while downloading

### Tax Period Filtering
- Month/year selection in UI
- Automatic filter application via `filter_changer.js`
- DOM manipulation to set CoreTax filter dropdowns

### Error Handling
- Timeout tracking and cleanup system
- Permission recovery mechanisms
- State validation for download requests
- Multi-page download safety timeouts

### Security Considerations
- Content Security Policy configured for CoreTax domains
- Web accessible resources restricted to tax portal domains
- Local-only processing, no external data transmission

## Important Implementation Details

### Manifest V3 Compatibility
- Uses service worker instead of background pages
- Proper permission declarations for activeTab, scripting, sidePanel
- CSP headers configured for extension security

### CoreTax Portal Integration
- Target domains: `coretax.pajak.go.id`, `coretaxdjp.pajak.go.id` and subdomains
- DOM element selection specific to CoreTax interface
- Handles navigation and pagination within the tax portal

### User Experience Features
- Real-time progress reporting
- Collapsible tutorial and tips sections
- Theme switching capability (light/dark mode)
- Promotional content for related tools

## File Naming Conventions
- **UI Files**: `popup.*` (shared between popup and sidebar)
- **Feature Scripts**: Descriptive names like `filter_changer.js`, `multi_page_downloader.js`
- **Resources**: Icons in `/images/` directory with size suffixes

## Testing Notes
- Requires access to Indonesian CoreTax portal for full testing
- Mock DOM elements may be needed for unit testing content scripts
- Extension permissions must be granted for CoreTax domains
- Test both popup and side panel interfaces