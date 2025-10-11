// Bukpot Downloader With Filter Masa Pajak - Chrome Extension
// Version 2.0
// Automated tax document downloader with period filtering

// 🎯 FILTER FUNCTIONALITY: Setup untuk filter masa pajak dengan simulasi user behavior
function setupFilterMasaPajak(bulan, tahun) {
    console.log('Content script: === STARTING FILTER SETUP ===');
    console.log('Content script: Target filter - Bulan:', bulan, 'Tahun:', tahun);

    return new Promise((resolve) => {
        // Fungsi utama untuk simulasi klik dropdown
        async function simulateUserDropdownSelection() {
            console.log('Content script: === STARTING DROPDOWN SIMULATION ===');
            try {
                // Step 1: Cari dropdown filter masa pajak
                console.log('Content script: Step 1 - Finding tax period dropdown...');
                const dropdown = findTaxPeriodDropdown();
                if (!dropdown) {
                    console.log('Content script: ❌ Tax period dropdown not found');
                    return false;
                }

                console.log('Content script: ✅ Found tax period dropdown:', dropdown);

                // Step 2: Klik trigger untuk buka dropdown
                console.log('Content script: Step 2 - Opening dropdown...');
                const isOpened = await openDropdown(dropdown);
                if (!isOpened) {
                    console.log('Content script: ❌ Failed to open dropdown');
                    return false;
                }

                console.log('Content script: Dropdown opened successfully');

                // Step 3: Tunggu overlay muncul dan cari opsi yang sesuai
                const targetOption = await findTargetOption(bulan, tahun);
                if (!targetOption) {
                    console.log('Content script: Target option not found:', bulan, tahun);
                    // Close dropdown if open
                    closeDropdown();
                    return false;
                }

                console.log('Content script: Found target option:', targetOption.textContent.trim());

                // Step 4: Klik opsi yang dipilih
                const isSelected = await selectOption(targetOption, bulan);
                if (!isSelected) {
                    console.log('Content script: Failed to select option');
                    return false;
                }

                console.log('Content script: Option selected successfully');
                return true;

            } catch (error) {
                console.error('Content script: Error in dropdown simulation:', error);
                return false;
            }
        }

        // Jalankan simulasi
        simulateUserDropdownSelection().then(result => {
            if (result) {
                console.log('Content script: ✅ Filter applied successfully via user simulation');
                resolve(true);
            } else {
                console.log('Content script: ❌ Filter application failed via user simulation');
                resolve(false);
            }
        });
    });
}

// Cari dropdown filter masa pajak
function findTaxPeriodDropdown() {
    console.log('Content script: Looking for tax period dropdown...');

    // Prioritaskan ID spesifik
    let dropdown = document.getElementById('filterTaxPeriodCode');
    if (dropdown) {
        console.log('Content script: Found dropdown by ID filterTaxPeriodCode:', dropdown);
        return dropdown;
    }
    console.log('Content script: Dropdown with ID filterTaxPeriodCode not found');

    // Fallback: Cari p-dropdown dengan placeholder yang sesuai
    const primeDropdowns = document.querySelectorAll('p-dropdown');
    console.log('Content script: Found', primeDropdowns.length, 'p-dropdown elements');

    for (let pd of primeDropdowns) {
        const input = pd.querySelector('input[placeholder="Pilih Masa Pajak"]');
        if (input) {
            console.log('Content script: Found dropdown with placeholder:', pd);
            return pd;
        }
    }
    console.log('Content script: No dropdown with placeholder found');

    // Fallback: Cari berdasarkan konteks column filter
    const columnFilters = document.querySelectorAll('p-columnfilter');
    console.log('Content script: Found', columnFilters.length, 'p-columnfilter elements');

    for (let cf of columnFilters) {
        const dropdown = cf.querySelector('p-dropdown');
        if (dropdown) {
            console.log('Content script: Found dropdown in column filter:', dropdown);
            return dropdown;
        }
    }
    console.log('Content script: No dropdown found in column filters');

    return null;
}

// Buka dropdown dengan simulasi klik
async function openDropdown(dropdown) {
    return new Promise((resolve) => {
        console.log('Content script: === OPENING DROPDOWN ===');
        console.log('Content script: Dropdown element:', dropdown);

        // Cari trigger button
        const trigger = dropdown.querySelector('.p-dropdown-trigger');
        if (!trigger) {
            console.log('Content script: ❌ No trigger button found in dropdown');
            resolve(false);
            return;
        }

        // Check if dropdown is already open
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            console.log('Content script: ✅ Dropdown already open');
            resolve(true);
            return;
        }

        // Simulasi klik user
        console.log('Content script: Clicking dropdown trigger');
        trigger.click();

        // Tunggu overlay muncul dengan berbagai selector
        let attempts = 0;
        const maxAttempts = 15;
        const checkOverlay = setInterval(() => {
            attempts++;

            // Coba berbagai selector untuk overlay panel
            const overlay1 = document.querySelector('.p-dropdown-panel.p-dropdown-panel-visible');
            const overlay2 = document.querySelector('.p-dropdown-panel');
            const overlay3 = document.querySelector('[class*="dropdown-panel"]');
            const overlay4 = document.querySelector('.p-dropdown-panel-visible');

            // Check jika ada overlay yang terlihat
            const anyOverlay = overlay1 || overlay2 || overlay3 || overlay4;
            const isNowExpanded = trigger.getAttribute('aria-expanded') === 'true';

            console.log(`Content script: Overlay check ${attempts}/${maxAttempts}:`);
            console.log(`  - aria-expanded: ${isNowExpanded}`);
            console.log(`  - overlay1 (.p-dropdown-panel.p-dropdown-panel-visible): ${overlay1 ? 'Found' : 'Not found'}`);
            console.log(`  - overlay2 (.p-dropdown-panel): ${overlay2 ? 'Found' : 'Not found'}`);
            console.log(`  - overlay3 ([class*="dropdown-panel"]): ${overlay3 ? 'Found' : 'Not found'}`);
            console.log(`  - overlay4 (.p-dropdown-panel-visible): ${overlay4 ? 'Found' : 'Not found'}`);

            if (anyOverlay || isNowExpanded || attempts >= maxAttempts) {
                clearInterval(checkOverlay);

                if (anyOverlay) {
                    console.log('Content script: ✅ Overlay panel found:', anyOverlay);
                } else if (isNowExpanded) {
                    console.log('Content script: ✅ Dropdown expanded (no overlay found)');
                } else {
                    console.log('Content script: ❌ No overlay found and dropdown not expanded');
                }

                resolve(anyOverlay || isNowExpanded);
            }
        }, 200);
    });
}

// Close dropdown
function closeDropdown() {
    const trigger = document.querySelector('.p-dropdown-trigger');
    if (trigger && trigger.getAttribute('aria-expanded') === 'true') {
        trigger.click();
    }
}

// Cari opsi target di overlay
async function findTargetOption(bulan, tahun) {
    return new Promise((resolve) => {
        console.log('Content script: === FINDING TARGET OPTION ===');
        console.log('Content script: Looking for:', bulan, tahun);

        let attempts = 0;
        const maxAttempts = 20;

        const searchOptions = () => {
            attempts++;
            console.log(`Content script: Search attempt ${attempts}/${maxAttempts}`);

            // Cari overlay panel dengan berbagai selector
            const overlay1 = document.querySelector('.p-dropdown-panel.p-dropdown-panel-visible');
            const overlay2 = document.querySelector('.p-dropdown-panel');
            const overlay3 = document.querySelector('[class*="dropdown-panel"]');
            const overlay4 = document.querySelector('.p-dropdown-panel-visible');
            const overlay = overlay1 || overlay2 || overlay3 || overlay4;

            if (!overlay) {
                console.log('Content script: ❌ Overlay panel not found yet');
                if (attempts >= maxAttempts) {
                    console.log('Content script: ❌ Max attempts reached, overlay not found');
                    resolve(null);
                    return;
                }
                setTimeout(searchOptions, 200);
                return;
            }

            console.log('Content script: ✅ Overlay panel found:', overlay);

            // Cari semua item di overlay dengan berbagai selector
            const items1 = overlay.querySelectorAll('.p-dropdown-item');
            const items2 = overlay.querySelectorAll('[class*="dropdown-item"]');
            const items3 = overlay.querySelectorAll('li');
            const items = items1.length > 0 ? items1 : items2.length > 0 ? items2 : items3;

            console.log('Content script: Found', items.length, 'dropdown items');

            // Log semua item yang ditemukan
            console.log('Content script: Available dropdown items:');
            items.forEach((item, index) => {
                const text = item.textContent.trim();
                console.log(`  Item ${index}: "${text}"`);
            });

            // Get month name from number
            const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                              'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const monthName = monthNames[parseInt(bulan)] || bulan;

            // Cari opsi yang sesuai dengan pola "Bulan Tahun"
            const targetText = `${monthName} ${tahun}`.toLowerCase();
            console.log('Content script: Looking for target text:', targetText);

            const targetItem = Array.from(items).find(item => {
                const text = item.textContent.trim().toLowerCase();
                console.log(`Content script: Checking item "${text}" against target "${targetText}"`);
                return text.includes(targetText) ||
                       (text.includes(monthName.toLowerCase()) && text.includes(tahun));
            });

            if (targetItem) {
                console.log('Content script: ✅ Target option found:', targetItem.textContent.trim());
                resolve(targetItem);
            } else if (attempts >= maxAttempts) {
                console.log('Content script: ❌ Target option not found after', attempts, 'attempts');
                resolve(null);
            } else {
                console.log('Content script: Target not found on attempt', attempts + ', retrying...');
                setTimeout(searchOptions, 200);
            }
        };

        searchOptions();
    });
}

// Pilih opsi dengan simulasi klik
async function selectOption(option, bulan) {
    return new Promise((resolve) => {
        try {
            console.log('Content script: === SELECTING OPTION ===');
            console.log('Content script: Clicking option:', option.textContent.trim());
            console.log('Content script: Option element:', option);

            // Simulasi event mouse yang lengkap
            const mouseDownEvent = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            const mouseUpEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });

            // Dispatch events secara berurutan
            option.dispatchEvent(mouseDownEvent);
            option.dispatchEvent(mouseUpEvent);
            option.dispatchEvent(clickEvent);

            console.log('Content script: ✅ Option clicked, waiting for selection confirmation...');

            // Tunggu dropdown tertutup dan nilai berubah
            let attempts = 0;
            const maxAttempts = 15;
            const checkSelection = setInterval(() => {
                attempts++;
                console.log(`Content script: Selection check ${attempts}/${maxAttempts}`);

                // Check if dropdown is closed
                const trigger = document.querySelector('.p-dropdown-trigger');
                const isClosed = trigger && trigger.getAttribute('aria-expanded') === 'false';
                console.log(`  - Dropdown closed: ${isClosed}`);

                // Get month name from number for checking
                const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                const monthName = monthNames[parseInt(bulan)] || bulan;

                // Check if label has changed
                const label = document.querySelector('.p-dropdown-label');
                const labelText = label ? label.textContent.trim() : 'No label found';
                const hasChanged = labelText.includes(monthName);
                console.log(`  - Label text: "${labelText}"`);
                console.log(`  - Label contains "${monthName}": ${hasChanged}`);

                // Check if overlay is hidden
                const overlay = document.querySelector('.p-dropdown-panel');
                const overlayHidden = !overlay || overlay.style.display === 'none' || !overlay.classList.contains('p-dropdown-panel-visible');
                console.log(`  - Overlay hidden: ${overlayHidden}`);

                if (isClosed || hasChanged || overlayHidden || attempts >= maxAttempts) {
                    clearInterval(checkSelection);
                    console.log('Content script: === SELECTION COMPLETE ===');
                    console.log(`  - Final result: ${isClosed || hasChanged || overlayHidden}`);
                    console.log(`  - Closed: ${isClosed}, Changed: ${hasChanged}, Overlay hidden: ${overlayHidden}`);
                    resolve(isClosed || hasChanged || overlayHidden);
                }
            }, 300);
        } catch (error) {
            console.error('Content script: Error selecting option:', error);
            resolve(false);
        }
    });
}

// Input validation function
function validateFilterInput(bulan, tahun) {
    // Validate month
    if (!bulan || typeof bulan !== 'string') {
        return { valid: false, error: "Format bulan tidak valid" };
    }

    const monthNum = parseInt(bulan);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return { valid: false, error: "Bulan tidak valid. Harus antara 1-12." };
    }

    // Validate year
    if (!tahun || typeof tahun !== 'string') {
        return { valid: false, error: "Format tahun tidak valid" };
    }

    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(tahun);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > currentYear + 1) {
        return { valid: false, error: `Tahun tidak valid. Harus antara 2000-${currentYear + 1}.` };
    }

    return { valid: true };
}

// Chrome runtime message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'applyTaxPeriodFilter') {
        console.log("Content script: applyTaxPeriodFilter received with data:", message.bulan, message.tahun);

        // Validate input data
        const validation = validateFilterInput(message.bulan, message.tahun);
        if (!validation.valid) {
            console.error("Content script: Invalid filter data:", validation.error);
            sendResponse({
                success: false,
                message: validation.error,
                error: validation.error,
                bulan: message.bulan,
                tahun: message.tahun
            });
            return;
        }

        try {
            setupFilterMasaPajak(message.bulan, message.tahun)
                .then(result => {
                    sendResponse({
                        success: result,
                        message: result ? "Filter applied successfully" : "Filter application failed",
                        bulan: message.bulan,
                        tahun: message.tahun
                    });
                })
                .catch(error => {
                    console.error("Content script: Error setting up filter:", error);
                    sendResponse({
                        success: false,
                        message: error.message,
                        error: error.message,
                        bulan: message.bulan,
                        tahun: message.tahun
                    });
                });

            // Return true to indicate async response
            return true;
        } catch (error) {
            console.error("Content script: Error setting up filter:", error);
            sendResponse({
                success: false,
                message: error.message,
                error: error.message,
                bulan: message.bulan,
                tahun: message.tahun
            });
        }
    }
});