// Test script to validate extension structure and identify potential issues

const fs = require('fs');
const path = require('path');

console.log("=== Extension Validation Test ===\n");

// Test 1: Check required files exist
console.log("1. Checking required files...");
const requiredFiles = [
    'manifest.json',
    'sidebar.html',
    'sidebar.css',
    'sidebar.js',
    'background.js',
    'filter_changer.js',
    'collector.js',
    'injector.js',
    'downloader.js'
];

let filesExist = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
        filesExist = false;
    }
});

// Test 2: Validate manifest.json
console.log("\n2. Validating manifest.json...");
try {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

    console.log(`✅ Manifest is valid JSON`);
    console.log(`✅ Version: ${manifest.version}`);
    console.log(`✅ Manifest version: ${manifest.manifest_version}`);

    if (manifest.side_panel) {
        console.log(`✅ Side panel configured: ${manifest.side_panel.default_path}`);
    } else {
        console.log(`❌ No side panel configuration`);
    }

    if (manifest.permissions && manifest.permissions.includes('sidePanel')) {
        console.log(`✅ Side panel permission granted`);
    } else {
        console.log(`❌ Missing sidePanel permission`);
    }

    if (manifest.web_accessible_resources) {
        const resources = manifest.web_accessible_resources[0].resources;
        if (resources.includes('filter_changer.js')) {
            console.log(`✅ filter_changer.js is web accessible`);
        } else {
            console.log(`❌ filter_changer.js not web accessible`);
        }
    }

} catch (error) {
    console.log(`❌ Manifest validation failed: ${error.message}`);
}

// Test 3: Check sidebar.html structure
console.log("\n3. Checking sidebar.html structure...");
try {
    const sidebarHTML = fs.readFileSync('sidebar.html', 'utf8');

    if (sidebarHTML.includes('sidebar.css')) {
        console.log(`✅ CSS linked`);
    } else {
        console.log(`❌ CSS not linked`);
    }

    if (sidebarHTML.includes('sidebar.js')) {
        console.log(`✅ JavaScript linked`);
    } else {
        console.log(`❌ JavaScript not linked`);
    }

    if (sidebarHTML.includes('monthSelect') && sidebarHTML.includes('yearSelect')) {
        console.log(`✅ Month and year dropdowns present`);
    } else {
        console.log(`❌ Missing dropdowns`);
    }

    if (sidebarHTML.includes('applyDownloadBtn')) {
        console.log(`✅ Apply button present`);
    } else {
        console.log(`❌ Missing apply button`);
    }

} catch (error) {
    console.log(`❌ Sidebar HTML check failed: ${error.message}`);
}

// Test 4: Check JavaScript files for key functions
console.log("\n4. Checking JavaScript files for key functions...");

// Check background.js
try {
    const bgJS = fs.readFileSync('background.js', 'utf8');

    if (bgJS.includes('APPLY_FILTER_AND_DOWNLOAD')) {
        console.log(`✅ Background script handles APPLY_FILTER_AND_DOWNLOAD`);
    } else {
        console.log(`❌ Background script missing APPLY_FILTER_AND_DOWNLOAD handler`);
    }

    if (bgJS.includes('sendStatusUpdate')) {
        console.log(`✅ Background script has status update function`);
    } else {
        console.log(`❌ Background script missing status update function`);
    }

    if (bgJS.includes('startAutomaticDownload')) {
        console.log(`✅ Background script has automatic download function`);
    } else {
        console.log(`❌ Background script missing automatic download function`);
    }

} catch (error) {
    console.log(`❌ Background.js check failed: ${error.message}`);
}

// Check sidebar.js
try {
    const sidebarJS = fs.readFileSync('sidebar.js', 'utf8');

    if (sidebarJS.includes('APPLY_FILTER_AND_DOWNLOAD')) {
        console.log(`✅ Sidebar script sends APPLY_FILTER_AND_DOWNLOAD message`);
    } else {
        console.log(`❌ Sidebar script missing APPLY_FILTER_AND_DOWNLOAD message`);
    }

    if (sidebarJS.includes('UPDATE_STATUS')) {
        console.log(`✅ Sidebar script listens for status updates`);
    } else {
        console.log(`❌ Sidebar script missing status update listener`);
    }

} catch (error) {
    console.log(`❌ Sidebar.js check failed: ${error.message}`);
}

// Check filter_changer.js
try {
    const filterJS = fs.readFileSync('filter_changer.js', 'utf8');

    if (filterJS.includes('setupFilterMasaPajak')) {
        console.log(`✅ Filter changer has setupFilterMasaPajak function`);
    } else {
        console.log(`❌ Filter changer missing setupFilterMasaPajak function`);
    }

    if (filterJS.includes('applyTaxPeriodFilter')) {
        console.log(`✅ Filter changer handles applyTaxPeriodFilter message`);
    } else {
        console.log(`❌ Filter changer missing applyTaxPeriodFilter handler`);
    }

} catch (error) {
    console.log(`❌ Filter_changer.js check failed: ${error.message}`);
}

console.log("\n=== Validation Complete ===");

if (filesExist) {
    console.log("✅ All required files are present");
} else {
    console.log("❌ Some required files are missing");
}

console.log("\nTo test the extension:");
console.log("1. Load the extension in Chrome (chrome://extensions/)");
console.log("2. Navigate to a CoreTax page");
console.log("3. Open the sidebar and test the functionality");