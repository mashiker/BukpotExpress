// Bukpot Express - Landing Page Script
// Handles navigation and theme management

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    setupThemeToggle();
    setupNavigation();
    addRamadanBanner();
});

// ============================================
// THEME MANAGEMENT
// ============================================

function initializeTheme() {
    chrome.storage.local.get(['theme'], (result) => {
        const theme = result.theme || 'light';
        applyTheme(theme);
        
        // Add stars if dark mode is already active on load
        if (theme === 'dark') {
            setTimeout(() => addStarsToHeader(), 100);
        }
    });
}

function applyTheme(theme) {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');

    if (theme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.innerHTML = '&#127769;'; // Moon icon for toggle to light
    } else {
        body.removeAttribute('data-theme');
        if (themeIcon) themeIcon.innerHTML = '&#127769;'; // Moon for next theme
    }

    chrome.storage.local.set({ theme: theme });
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    
    // Add/remove stars when toggling to/from dark mode
    if (newTheme === 'dark') {
        addStarsToHeader();
    } else {
        removeStarsFromHeader();
    }
}

function addStarsToHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    // Don't add if already exists
    if (header.querySelector('.star-1')) return;
    
    const star1 = document.createElement('span');
    star1.className = 'star star-1';
    star1.innerHTML = '⭐';
    header.appendChild(star1);

    const star2 = document.createElement('span');
    star2.className = 'star star-2';
    star2.innerHTML = '⭐';
    header.appendChild(star2);

    const star3 = document.createElement('span');
    star3.className = 'star star-3';
    star3.innerHTML = '⭐';
    header.appendChild(star3);
}

function removeStarsFromHeader() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => star.remove());
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// ============================================
// RAMADAN DECORATIONS
// ============================================

function addRamadanBanner() {
    // Add Ramadan banner after header in main content
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    const banner = document.createElement('div');
    banner.className = 'ramadan-banner';
    banner.innerHTML = `
        <div class="lantern lantern-left"></div>
        <div class="lantern lantern-right"></div>
        <div class="ramadan-greeting">✨ Ramadhan Kareem ✨</div>
        <div class="ramadan-subtext">Semoga berkah dan keberkahan menyertai kita semua</div>
    `;

    // Insert banner at the top of main content
    const firstChild = mainContent.firstChild;
    mainContent.insertBefore(banner, firstChild);
}

// ============================================
// NAVIGATION
// ============================================

function setupNavigation() {
    // Main menu items - handle click for navigation
    const menuPrepaid = document.getElementById('menu-prepaid');
    const menuBppu = document.getElementById('menu-bppu');

    // These are already <a> tags so they navigate naturally
    // But we can add analytics or additional logic here if needed

    // External tool links - ensure they open in new tab
    const toolLinks = document.querySelectorAll('.tool-item');
    toolLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Let the default behavior handle it (opens in new tab)
            // Can add analytics tracking here if needed
        });
    });

    // Support link
    const supportLink = document.getElementById('support-link');
    if (supportLink) {
        supportLink.addEventListener('click', (e) => {
            // Let default behavior handle it
        });
    }
}
