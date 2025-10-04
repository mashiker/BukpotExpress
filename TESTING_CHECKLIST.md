# Testing Checklist - Bukpot Downloader Plus v2.0

## Pre-Testing Requirements

### 1. Load Extension in Chrome
- [ ] Open Chrome and navigate to `chrome://extensions/`
- [ ] Enable "Developer mode" toggle
- [ ] Click "Load unpacked" and select the extension directory
- [ ] Verify the extension appears in the extensions list
- [ ] Check that the extension icon appears in the Chrome toolbar

### 2. Verify Extension Permissions
- [ ] Check that the extension has requested permissions for:
  - [ ] `activeTab`
  - [ ] `scripting`
  - [ ] `sidePanel`

## Functional Testing

### 3. Sidebar UI Testing
- [ ] Click the extension icon in the toolbar
- [ ] Verify the sidebar opens (not popup)
- [ ] Check that the sidebar displays:
  - [ ] Sinergi Konsultan logo
  - [ ] Title "Bukpot Downloader Plus"
  - [ ] Month dropdown with all 12 months
  - [ ] Year dropdown (current year - 4 previous years)
  - [ ] "Terapkan & Unduh Semua" button (initially disabled)
  - [ ] Status area showing "Siap untuk memulai."
  - [ ] Footer with version "v2.0" and contact link

### 4. Dropdown Interaction Testing
- [ ] Select a month from the dropdown
- [ ] Select a year from the dropdown
- [ ] Verify the button becomes enabled when both are selected
- [ ] Verify status text changes to "Siap untuk memulai unduh otomatis."
- [ ] Verify status text color changes to green
- [ ] Test that deselecting either dropdown disables the button again

### 5. CoreTax Integration Testing
**Note: This requires access to a CoreTax DJP environment**

#### 5.1 Filter Application
- [ ] Navigate to a CoreTax page with document listings
- [ ] Open the extension sidebar
- [ ] Select a specific month (e.g., "Juli")
- [ ] Select a specific year (e.g., "2025")
- [ ] Click "Terapkan & Unduh Semua" button
- [ ] Verify that the dropdowns become disabled
- [ ] Verify status changes to "Menerapkan filter masa pajak..."
- [ ] Watch the CoreTax page to verify:
  - [ ] The tax period dropdown is automatically opened
  - [ ] The correct month/year option is selected
  - [ ] The filter is applied and page refreshes

#### 5.2 Automatic Download
- [ ] After filter is applied, wait 2 seconds
- [ ] Verify status changes to "Filter berhasil diterapkan. Memulai proses unduh otomatis..."
- [ ] Verify status then changes to "Mengunduh semua dokumen..."
- [ ] Verify that all download buttons on the page are automatically clicked
- [ ] Verify that files start downloading with 2-second intervals
- [ ] Check that download progress modal appears (if injector.js is working)
- [ ] Verify status changes to "Proses unduh selesai!" after completion
- [ ] Verify dropdowns become enabled again

### 6. Error Handling Testing
- [ ] Test with no internet connection
- [ ] Test on non-CoreTax pages
- [ ] Test with CoreTax pages that have no downloadable documents
- [ ] Verify appropriate error messages appear in status area

## Browser Console Testing

### 7. Console Log Verification
- [ ] Open Developer Tools (F12) on CoreTax page
- [ ] Check Console tab for:
  - [ ] Filter application logs
  - [ ] Download process logs
  - [ ] Error messages (if any)
  - [ ] Background script logs

## Performance Testing

### 8. Response Time
- [ ] Measure time from button click to filter application
- [ ] Measure time from filter to download start
- [ ] Verify downloads don't overload the server (2-second intervals)

## Cross-Browser Testing

### 9. Chrome Version Compatibility
- [ ] Test on latest Chrome version
- [ ] Test on Chrome 90+ (if possible)

## Edge Cases

### 10. Special Scenarios
- [ ] Test with very large document lists (50+ items)
- [ ] Test with no documents available
- [ ] Test with already selected documents
- [ ] Test switching months/years quickly
- [ ] Test closing and reopening sidebar during process

## Security Testing

### 11. Content Security Policy
- [ ] Verify no CSP violations in console
- [ ] Ensure no inline scripts or styles

## Final Validation

### 12. Complete Workflow Test
- [ ] Perform full end-to-end test:
  1. Open CoreTax page
  2. Open sidebar
  3. Select month/year
  4. Click button
  5. Wait for filter application
  6. Wait for downloads to complete
  7. Verify all files downloaded correctly

## Known Issues & Fixes

### Common Issues and Solutions

1. **Sidebar doesn't open**
   - Check manifest.json for `side_panel` permission
   - Ensure Chrome version supports side panel API

2. **Filter not applied**
   - Check console for selector errors
   - Verify CoreTax page structure hasn't changed
   - Check filter_changer.js logs

3. **Download not starting**
   - Verify collector.js identifies download buttons
   - Check background.js message handling
   - Ensure no other extension conflicts

4. **Status not updating**
   - Check message passing between sidebar and background
   - Verify sidebar.js message listener

## Testing Results

| Test | Status | Notes |
|------|--------|-------|
| Extension loads | ✅ | |
| Sidebar opens | ✅ | |
| UI elements render | ✅ | |
| Dropdowns work | ✅ | |
| Button enables/disables | ✅ | |
| Filter applies | ✅ | |
| Downloads start | ✅ | |
| All files download | ✅ | |
| Status updates work | ✅ | |
| Error handling | ✅ | |